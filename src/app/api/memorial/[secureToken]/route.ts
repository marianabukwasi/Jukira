import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { storage } from "@/lib/storage";
import { queueNotification } from "@/lib/audit";
import type { MemorialWebsiteRecord, ProjectRecord } from "@/lib/types";

export async function POST(
  request: Request,
  context: { params: Promise<{ secureToken: string }> }
) {
  ensureSeeded();
  const { secureToken } = await context.params;
  const db = getDb();

  const project = db
    .prepare("SELECT * FROM projects WHERE secure_token = ?")
    .get(secureToken) as unknown as ProjectRecord | undefined;

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const website = db
    .prepare("SELECT * FROM memorial_websites WHERE project_id = ?")
    .get(project.id) as unknown as MemorialWebsiteRecord | undefined;

  if (!website || !website.enabled) {
    return NextResponse.json(
      { error: "Memorial website is not active." },
      { status: 404 }
    );
  }

  let authorName = "";
  let relationship = "";
  let message = "";
  let file: File | null = null;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    authorName = String(form.get("authorName") || "").trim();
    relationship = String(form.get("relationship") || "").trim();
    message = String(form.get("message") || "").trim();
    const uploaded = form.get("file");
    if (uploaded && uploaded instanceof File && uploaded.size > 0) {
      file = uploaded;
    }
  } else {
    const body = await request.json();
    authorName = String(body.authorName || "").trim();
    relationship = String(body.relationship || "").trim();
    message = String(body.message || "").trim();
  }

  if (!authorName || (!message && !file)) {
    return NextResponse.json(
      { error: "Please enter your name and a message or photo/video." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  let attachmentMediaId: string | null = null;

  if (file) {
    const isVideo = file.type.startsWith("video/");
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = await storage.saveFile(
      project.id,
      file.name,
      buffer,
      "originals"
    );

    const contributorId = `cnt_${crypto.randomBytes(5).toString("hex")}`;
    db.prepare(`
      INSERT INTO contributors (
        id, project_id, name, relationship, accepted_terms_version, accepted_at, created_at
      ) VALUES (?, ?, ?, ?, 'v1.0-2026', ?, ?)
    `).run(contributorId, project.id, authorName, relationship || "Friend", now, now);

    attachmentMediaId = `med_${crypto.randomBytes(6).toString("hex")}`;
    db.prepare(`
      INSERT INTO media (
        id, project_id, contributor_id, file_type, mime_type,
        storage_key, original_filename, file_size, upload_status,
        caption, enhancement_preference, approval_status, flagged, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UPLOADED', ?, 'KEEP_ORIGINAL', 'PENDING', 0, ?)
    `).run(
      attachmentMediaId,
      project.id,
      contributorId,
      isVideo ? "VIDEO" : "IMAGE",
      file.type || (isVideo ? "video/mp4" : "image/jpeg"),
      key,
      file.name,
      file.size,
      message || null,
      now
    );
  }

  // All guest posts require Admin/Family approval before appearing publicly
  db.prepare(
    `INSERT INTO memorial_messages (
      id, project_id, author_name, relationship, message, attachment_media_id, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`
  ).run(
    `msg_${crypto.randomBytes(5).toString("hex")}`,
    project.id,
    authorName,
    relationship || "Friend",
    message || "Shared a late photograph or video memory.",
    attachmentMediaId,
    now
  );

  queueNotification({
    recipientEmail: project.owner_email,
    recipientRole: "FAMILY_OWNER",
    projectId: project.id,
    eventType: "MEMORIAL_POST_PENDING",
    subject: `New pending post on ${project.deceased_full_name}’s memorial website`,
    body: `${authorName} submitted a message${
      attachmentMediaId ? " with a photo/video" : ""
    }. Admin or family approval is required before it appears.`,
  });

  return NextResponse.json({
    ok: true,
    status: "PENDING",
    message:
      "Thank you. Your post has been submitted and will appear once approved by the administrator or family.",
  });
}
