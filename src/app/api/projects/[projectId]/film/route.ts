import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import {
  createExpiringDownloadToken,
  storage,
  verifyExpiringDownloadToken,
} from "@/lib/storage";
import { queueNotification, recordAuditLog } from "@/lib/audit";
import type { ProductionJobRecord, ProjectRecord } from "@/lib/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  ensureSeeded();
  const { projectId } = await context.params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const kind = (url.searchParams.get("kind") || "film") as
    | "film"
    | "shorter"
    | "raw";

  const db = getDb();
  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(projectId) as unknown as ProjectRecord | undefined;

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If token is provided, stream the file download
  if (token) {
    const verified = verifyExpiringDownloadToken(token);
    if (!verified || verified.projectId !== projectId) {
      return NextResponse.json(
        { error: "Download link expired or invalid." },
        { status: 403 }
      );
    }

    const job = db
      .prepare("SELECT * FROM production_jobs WHERE project_id = ?")
      .get(projectId) as unknown as ProductionJobRecord | undefined;

    if (verified.kind === "raw") {
      if (!project.raw_footage_purchased) {
        return NextResponse.json(
          { error: "Raw footage package not purchased." },
          { status: 403 }
        );
      }
      const mediaList = db
        .prepare(
          "SELECT id, original_filename, file_type, file_size, caption, event_date, enhancement_preference FROM media WHERE project_id = ?"
        )
        .all(projectId);
      const manifest = JSON.stringify(
        {
          project: project.deceased_full_name,
          exportedAt: new Date().toISOString(),
          note: "Original contributed media manifest. Individual files are stored securely in Jukira object storage.",
          files: mediaList,
        },
        null,
        2
      );
      return new NextResponse(manifest, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="jukira-raw-footage-${project.secure_token}.json"`,
        },
      });
    }

    const key =
      verified.kind === "shorter"
        ? job?.shorter_file_key
        : job?.output_file_key;
    if (key) {
      const buf = await storage.readFile(key);
      if (buf) {
        const isWebm = key.toLowerCase().endsWith(".webm");
        const contentType = isWebm ? "video/webm" : "video/mp4";
        const ext = isWebm ? "webm" : "mp4";
        return new NextResponse(new Uint8Array(buf), {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="jukira-${project.secure_token}-${verified.kind}.${ext}"`,
          },
        });
      }
    }

    return NextResponse.json(
      { error: "Film file not yet uploaded." },
      { status: 404 }
    );
  }

  // Otherwise generate expiring download URLs for authorized user
  const user = await getSession();
  if (!user || !getAuthorizedProject(user, projectId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const downloadToken = createExpiringDownloadToken(
    { projectId, kind },
    3600
  );
  return NextResponse.json({
    downloadUrl: `/api/projects/${projectId}/film?token=${encodeURIComponent(
      downloadToken
    )}`,
    expiresInSeconds: 3600,
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  ensureSeeded();
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { projectId } = await context.params;
  const db = getDb();
  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(projectId) as unknown as ProjectRecord | undefined;

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") || "";
  const now = new Date().toISOString();

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("filmFile") as File | null;
    const kind = String(form.get("kind") || "film");
    if (!file) {
      return NextResponse.json(
        { error: "Please select an MP4 file." },
        { status: 400 }
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const key = await storage.saveFile(projectId, file.name, buf, "exports");
    if (kind === "shorter") {
      db.prepare(
        "UPDATE production_jobs SET shorter_file_key = ?, updated_at = ? WHERE project_id = ?"
      ).run(key, now, projectId);
    } else {
      db.prepare(
        "UPDATE production_jobs SET output_file_key = ?, editing_status = 'EXPORT_READY', updated_at = ? WHERE project_id = ?"
      ).run(key, now, projectId);
      db.prepare(
        "UPDATE projects SET project_status = 'QUALITY_REVIEW' WHERE id = ?"
      ).run(projectId);
    }
    recordAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      action: "ADMIN_UPLOADED_FILM",
      targetType: "project",
      targetId: projectId,
      details: `Kind: ${kind}, File: ${file.name}`,
    });
    return NextResponse.json({ ok: true, key });
  }

  const body = await request.json();
  if (body.qcChecklist) {
    const checklist = body.qcChecklist as Record<string, boolean>;
    const allPassed = Object.values(checklist).every(Boolean);
    const reviewStatus = allPassed ? "PASSED" : "CHANGES_REQUESTED";

    db.prepare(
      `UPDATE production_jobs
       SET qc_checklist_json = ?, review_status = ?, notes = COALESCE(?, notes),
           completed_at = ?, updated_at = ?
       WHERE project_id = ?`
    ).run(
      JSON.stringify(checklist),
      reviewStatus,
      body.notes ? String(body.notes) : null,
      allPassed ? now : null,
      now,
      projectId
    );

    if (allPassed && body.deliverNow) {
      db.prepare(
        "UPDATE projects SET project_status = 'FINAL_FILM_DELIVERED' WHERE id = ?"
      ).run(projectId);
      queueNotification({
        recipientEmail: project.owner_email,
        recipientRole: "FAMILY_OWNER",
        projectId,
        eventType: "FINAL_FILM_DELIVERED",
        subject: `Your memorial film for ${project.deceased_full_name} is ready`,
        body: "Human quality review is complete. Sign in to watch and download your finished MP4 film.",
      });
    }

    recordAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      action: "HUMAN_QC_UPDATED",
      targetType: "project",
      targetId: projectId,
      details: `Review status: ${reviewStatus}`,
    });

    return NextResponse.json({ ok: true, reviewStatus });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
