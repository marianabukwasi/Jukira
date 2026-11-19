import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import { recordAuditLog } from "@/lib/audit";

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

  if (body.action === "APPROVE_ALL") {
    db.prepare(
      "UPDATE media SET approval_status = 'APPROVED' WHERE project_id = ?"
    ).run(projectId);
    recordAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      action: "MEDIA_APPROVE_ALL",
      targetType: "project",
      targetId: projectId,
    });
    return NextResponse.json({ ok: true });
  }

  const mediaId = String(body.mediaId || "");
  if (!mediaId) {
    return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
  }

  if (
    body.approval_status === "APPROVED" ||
    body.approval_status === "REJECTED" ||
    body.approval_status === "PENDING"
  ) {
    db.prepare(
      "UPDATE media SET approval_status = ? WHERE id = ? AND project_id = ?"
    ).run(body.approval_status, mediaId, projectId);
  }

  if (typeof body.flagged === "boolean") {
    db.prepare(
      "UPDATE media SET flagged = ? WHERE id = ? AND project_id = ?"
    ).run(body.flagged ? 1 : 0, mediaId, projectId);
  }

  return NextResponse.json({ ok: true });
}
