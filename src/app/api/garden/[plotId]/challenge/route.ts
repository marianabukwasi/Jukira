import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function POST(
  request: Request,
  context: { params: Promise<{ plotId: string }> }
) {
  ensureSeeded();
  const { plotId } = await context.params;
  const body = await request.json();

  const challengerName = String(body.challengerName || "").trim();
  const challengerEmail = String(body.challengerEmail || "").trim();
  const reason = String(body.reason || "INACCURATE").trim();
  const details = String(body.details || "").trim();

  if (!challengerName || !challengerEmail || !details) {
    return NextResponse.json(
      { error: "Please provide your name, email, and details of the challenge." },
      { status: 400 }
    );
  }

  const db = getDb();
  const challengeId = `chg_${crypto.randomBytes(5).toString("hex")}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO memorial_challenges (
      id, plot_id, challenger_name, challenger_email, reason, details, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?)
  `).run(
    challengeId,
    plotId,
    challengerName,
    challengerEmail,
    reason,
    details,
    now
  );

  recordAuditLog({
    actorEmail: challengerEmail,
    action: "MEMORIAL_CHALLENGE_SUBMITTED",
    targetType: "memorial_plot",
    targetId: plotId,
    details: `Reason: ${reason}`,
  });

  return NextResponse.json({
    ok: true,
    message:
      "Your challenge has been recorded for Jukira registry review. Thank you for helping keep our memorials accurate and respectful.",
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ plotId: string }> }
) {
  ensureSeeded();
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { plotId } = await context.params;
  const body = await request.json();
  const db = getDb();

  if (body.verificationStatus) {
    db.prepare(
      "UPDATE memorial_plots SET verification_status = ? WHERE id = ?"
    ).run(String(body.verificationStatus), plotId);
  }

  if (body.challengeId && body.challengeStatus) {
    db.prepare(
      "UPDATE memorial_challenges SET status = ? WHERE id = ? AND plot_id = ?"
    ).run(String(body.challengeStatus), String(body.challengeId), plotId);
  }

  recordAuditLog({
    actorUserId: admin.id,
    actorEmail: admin.email,
    action: "ADMIN_UPDATED_PLOT_REGISTRY",
    targetType: "memorial_plot",
    targetId: plotId,
    details: JSON.stringify(body),
  });

  return NextResponse.json({ ok: true });
}
