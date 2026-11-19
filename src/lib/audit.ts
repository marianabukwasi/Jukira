import crypto from "node:crypto";
import { getDb } from "./db";

export function recordAuditLog(params: {
  actorUserId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO audit_logs (id, actor_user_id, actor_email, action, target_type, target_id, details, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    `aud_${crypto.randomBytes(6).toString("hex")}`,
    params.actorUserId ?? null,
    params.actorEmail ?? null,
    params.action,
    params.targetType,
    params.targetId,
    params.details ?? null,
    new Date().toISOString()
  );
}

export function queueNotification(params: {
  recipientEmail: string;
  recipientRole: string;
  projectId?: string | null;
  eventType: string;
  subject: string;
  body: string;
}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO notifications (id, recipient_email, recipient_role, project_id, event_type, subject, body, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'SENT', ?)`
  ).run(
    `ntf_${crypto.randomBytes(6).toString("hex")}`,
    params.recipientEmail,
    params.recipientRole,
    params.projectId ?? null,
    params.eventType,
    params.subject,
    params.body,
    new Date().toISOString()
  );
}
