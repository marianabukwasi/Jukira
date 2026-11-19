import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { storage } from "@/lib/storage";
import { queueNotification } from "@/lib/audit";

const ALLOWED_IMAGE_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "gif",
]);
const ALLOWED_VIDEO_EXT = new Set(["mp4", "mov", "m4v", "webm", "avi"]);
const MAX_FILE_BYTES = 1024 * 1024 * 1024; // 1 GB per file

export async function POST(
  request: Request,
  context: { params: Promise<{ secureToken: string }> }
) {
  try {
    ensureSeeded();
    const { secureToken } = await context.params;
    const db = getDb();

    const project = db
      .prepare("SELECT * FROM projects WHERE secure_token = ?")
      .get(secureToken) as
      | {
          id: string;
          deceased_full_name: string;
          owner_email: string;
          project_status: string;
          closing_date: string | null;
          review_required: number;
        }
      | undefined;

    if (!project) {
      return NextResponse.json(
        { error: "Contribution link not found." },
        { status: 404 }
      );
    }

    if (
      project.project_status !== "COLLECTING_CONTRIBUTIONS" &&
      project.project_status !== "PROJECT_CREATED"
    ) {
      return NextResponse.json(
        { error: "Contributions for this memorial project are now closed." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const contributorName = String(formData.get("contributorName") || "").trim();
    const relationship = String(formData.get("relationship") || "").trim();
    const relationshipCustom =
      String(formData.get("relationshipCustom") || "").trim() || null;
    const contactInfo = String(formData.get("contactInfo") || "").trim() || null;
    const acceptedTerms = formData.get("acceptedTerms") === "true";
    const termsVersion = String(
      formData.get("termsVersion") || "v1.0-2026"
    ).trim();

    if (!contributorName || !relationship) {
      return NextResponse.json(
        { error: "Please enter your name and relationship." },
        { status: 400 }
      );
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        { error: "You must agree to the submission terms before uploading." },
        { status: 400 }
      );
    }

    const files = formData.getAll("files") as File[];
    const captions = formData.getAll("captions") as string[];
    const eventDates = formData.getAll("eventDates") as string[];
    const eventLocations = formData.getAll("eventLocations") as string[];
    const enhancements = formData.getAll("enhancements") as string[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one photograph or video to upload." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    let contributorId = String(formData.get("contributorId") || "").trim();

    if (!contributorId) {
      contributorId = `cnt_${crypto.randomBytes(6).toString("hex")}`;
      db.prepare(`
        INSERT INTO contributors (
          id, project_id, name, relationship, relationship_custom,
          contact_info, accepted_terms_version, accepted_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        contributorId,
        project.id,
        contributorName,
        relationship,
        relationshipCustom,
        contactInfo,
        termsVersion,
        now,
        now
      );
    }

    const savedItems: {
      id: string;
      filename: string;
      fileType: string;
      fileSize: number;
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || typeof file.arrayBuffer !== "function") continue;

      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the 1 GB single-file limit.`,
          },
          { status: 400 }
        );
      }

      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const isImage =
        file.type.startsWith("image/") || ALLOWED_IMAGE_EXT.has(ext);
      const isVideo =
        file.type.startsWith("video/") || ALLOWED_VIDEO_EXT.has(ext);

      if (!isImage && !isVideo) {
        return NextResponse.json(
          {
            error: `File "${file.name}" is not a supported photograph or video format.`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const storageKey = await storage.saveFile(
        project.id,
        file.name,
        buffer,
        "originals"
      );

      const mediaId = `med_${crypto.randomBytes(6).toString("hex")}`;
      const fileType = isVideo ? "VIDEO" : "IMAGE";
      const enhancement =
        isVideo &&
        ["KEEP_ORIGINAL", "STANDARD_CORRECTION", "AI_ENHANCEMENT"].includes(
          enhancements[i] || ""
        )
          ? enhancements[i]
          : "KEEP_ORIGINAL";
      const approvalStatus = project.review_required ? "PENDING" : "APPROVED";

      db.prepare(`
        INSERT INTO media (
          id, project_id, contributor_id, file_type, mime_type,
          storage_key, original_filename, file_size, video_duration_sec,
          upload_status, caption, event_date, event_location, enhancement_preference,
          approval_status, flagged, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPLOADED', ?, ?, ?, ?, ?, 0, ?)
      `).run(
        mediaId,
        project.id,
        contributorId,
        fileType,
        file.type ||
          (fileType === "VIDEO" ? "video/mp4" : "image/jpeg"),
        storageKey,
        file.name,
        file.size,
        null,
        (captions[i] || "").trim() || null,
        (eventDates[i] || "").trim() || null,
        (eventLocations[i] || "").trim() || null,
        enhancement,
        approvalStatus,
        now
      );

      savedItems.push({
        id: mediaId,
        filename: file.name,
        fileType,
        fileSize: file.size,
      });
    }

    queueNotification({
      recipientEmail: project.owner_email,
      recipientRole: "FAMILY_OWNER",
      projectId: project.id,
      eventType: "NEW_CONTRIBUTION",
      subject: `New memories shared for ${project.deceased_full_name}`,
      body: `${contributorName} (${relationship}) uploaded ${savedItems.length} item(s).`,
    });

    if (contactInfo && contactInfo.includes("@")) {
      queueNotification({
        recipientEmail: contactInfo,
        recipientRole: "CONTRIBUTOR",
        projectId: project.id,
        eventType: "SUBMISSION_CONFIRMED",
        subject: `Thank you for sharing your memories of ${project.deceased_full_name}`,
        body: `Your ${savedItems.length} uploaded file(s) have been safely received.`,
      });
    }

    return NextResponse.json({
      contributorId,
      uploadedCount: savedItems.length,
      items: savedItems,
    });
  } catch {
    return NextResponse.json(
      { error: "Upload interrupted. Please retry your submission." },
      { status: 500 }
    );
  }
}
