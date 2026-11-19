import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import type { MediaRecord, ProjectRecord } from "@/lib/types";

function extractYear(dateStr: string | null): number {
  if (!dateStr) return 9999;
  const match = dateStr.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : 9999;
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  ensureSeeded();
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
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

  const allMedia = db
    .prepare(
      `SELECT m.*, c.name as contributor_name, c.relationship as contributor_relationship
       FROM media m
       JOIN contributors c ON c.id = m.contributor_id
       WHERE m.project_id = ? AND m.approval_status = 'APPROVED' AND m.flagged = 0
       ORDER BY m.created_at ASC`
    )
    .all(projectId) as unknown as (MediaRecord & {
    contributor_name: string;
    contributor_relationship: string;
  })[];

  // Duplicate detection by filename + file_size
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const uniqueMedia = allMedia.filter((m) => {
    const key = `${m.original_filename.toLowerCase()}::${m.file_size}`;
    if (seen.has(key)) {
      duplicates.push(m.original_filename);
      return false;
    }
    seen.add(key);
    return true;
  });

  // Sort chronologically if Chronological, otherwise group by contributor/theme
  const ordered = [...uniqueMedia].sort((a, b) => {
    if (project.presentation_style === "Thematic") {
      return a.contributor_relationship.localeCompare(
        b.contributor_relationship
      );
    }
    const ya = extractYear(a.event_date);
    const yb = extractYear(b.event_date);
    if (ya !== yb) return ya - yb;
    return a.created_at.localeCompare(b.created_at);
  });

  const clips = ordered.map((m, idx) => ({
    order: idx + 1,
    mediaId: m.id,
    fileType: m.file_type,
    url: `/api/media/${m.id}/file`,
    filename: m.original_filename,
    caption: m.caption,
    eventDate: m.event_date,
    eventLocation: m.event_location,
    contributor: `${m.contributor_name} (${m.contributor_relationship})`,
    enhancement: m.enhancement_preference,
    durationMs: m.file_type === "VIDEO" ? 5000 : 3500,
  }));

  db.prepare(
    "UPDATE projects SET project_status = 'IN_PRODUCTION' WHERE id = ? AND project_status IN ('PROJECT_CREATED', 'COLLECTING_CONTRIBUTIONS', 'CONTRIBUTIONS_CLOSED', 'MEDIA_ORGANISED')"
  ).run(projectId);

  db.prepare(
    "UPDATE production_jobs SET editing_status = 'AI_ASSISTED_SEQUENCE_READY', updated_at = ? WHERE project_id = ?"
  ).run(new Date().toISOString(), projectId);

  recordAuditLog({
    actorUserId: admin.id,
    actorEmail: admin.email,
    action: "AI_COMPILATION_PLANNED",
    targetType: "project",
    targetId: projectId,
    details: `Ordered ${clips.length} clips; skipped ${duplicates.length} duplicate(s).`,
  });

  return NextResponse.json({
    plan: {
      openingTitle:
        project.opening_title ||
        `Celebrating the Life of ${project.deceased_full_name}`,
      closingTitle:
        project.closing_title || "Forever remembered with love",
      datesLine:
        project.date_of_birth && project.date_of_passing
          ? `${project.date_of_birth.slice(0, 4)} – ${project.date_of_passing.slice(
              0,
              4
            )}`
          : "",
      presentationStyle: project.presentation_style || "Chronological",
      duplicatesSkipped: duplicates,
      clips,
    },
  });
}
