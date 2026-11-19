import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import { recordAuditLog } from "@/lib/audit";

export async function GET(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  ensureSeeded();
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = await context.params;
  const project = getAuthorizedProject(user, projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = getDb();
  const contributors = db
    .prepare("SELECT * FROM contributors WHERE project_id = ? ORDER BY created_at DESC")
    .all(projectId);
  const media = db
    .prepare(
      `SELECT m.*, c.name as contributor_name, c.relationship as contributor_relationship
       FROM media m
       JOIN contributors c ON c.id = m.contributor_id
       WHERE m.project_id = ?
       ORDER BY m.created_at DESC`
    )
    .all(projectId);
  const productionJob = db
    .prepare("SELECT * FROM production_jobs WHERE project_id = ?")
    .get(projectId);
  const payments = db
    .prepare("SELECT * FROM orders_payments WHERE project_id = ? ORDER BY created_at DESC")
    .all(projectId);
  const subscription = db
    .prepare("SELECT * FROM subscriptions WHERE project_id = ? ORDER BY created_at DESC LIMIT 1")
    .get(projectId);

  return NextResponse.json({
    project,
    contributors,
    media,
    productionJob,
    payments,
    subscription,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  ensureSeeded();
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = await context.params;
  const project = getAuthorizedProject(user, projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const db = getDb();

  const allowedUpdates: Record<string, unknown> = {};
  if (typeof body.film_duration_tier === "string")
    allowedUpdates.film_duration_tier = body.film_duration_tier;
  if (typeof body.music_choice === "string")
    allowedUpdates.music_choice = body.music_choice;
  if (typeof body.presentation_style === "string")
    allowedUpdates.presentation_style = body.presentation_style;
  if (typeof body.opening_title === "string")
    allowedUpdates.opening_title = body.opening_title;
  if (typeof body.closing_title === "string")
    allowedUpdates.closing_title = body.closing_title;
  if (typeof body.closing_date === "string" || body.closing_date === null)
    allowedUpdates.closing_date = body.closing_date;
  if (typeof body.include_shorter_version === "boolean")
    allowedUpdates.include_shorter_version = body.include_shorter_version
      ? 1
      : 0;
  if (typeof body.review_required === "boolean")
    allowedUpdates.review_required = body.review_required ? 1 : 0;

  if (
    user.role === "ADMIN" &&
    typeof body.project_status === "string"
  ) {
    // Enforce Rule 7: Do not publish a film without human quality review
    if (body.project_status === "FINAL_FILM_DELIVERED") {
      const job = db
        .prepare("SELECT review_status FROM production_jobs WHERE project_id = ?")
        .get(projectId) as { review_status: string } | undefined;
      if (!job || job.review_status !== "PASSED") {
        return NextResponse.json(
          {
            error:
              "A film cannot be marked as delivered until human quality review has passed.",
          },
          { status: 400 }
        );
      }
    }
    allowedUpdates.project_status = body.project_status;
  } else if (
    body.project_status === "CONTRIBUTIONS_CLOSED" &&
    (user.role === "FAMILY_OWNER" || user.role === "ADMIN")
  ) {
    allowedUpdates.project_status = "CONTRIBUTIONS_CLOSED";
  }

  const keys = Object.keys(allowedUpdates);
  if (keys.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => allowedUpdates[k]);
  db.prepare(`UPDATE projects SET ${setClause} WHERE id = ?`).run(
    ...values,
    projectId
  );

  recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: "PROJECT_UPDATED",
    targetType: "project",
    targetId: projectId,
    details: JSON.stringify(allowedUpdates),
  });

  const updated = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(projectId);
  return NextResponse.json({ project: updated });
}
