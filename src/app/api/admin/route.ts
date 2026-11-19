import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { storage } from "@/lib/storage";

export async function PATCH(request: Request) {
  ensureSeeded();
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const db = getDb();
  const now = new Date().toISOString();

  if (body.action === "UPDATE_PARTNER_STATUS") {
    const partnerId = String(body.partnerId || "");
    const status = String(body.status || "ACTIVE");
    db.prepare(
      "UPDATE funeral_homes SET account_status = ? WHERE id = ?"
    ).run(status, partnerId);
    db.prepare(
      "UPDATE users SET account_status = ? WHERE funeral_home_id = ?"
    ).run(status, partnerId);
    recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: "PARTNER_STATUS_UPDATED",
      targetType: "funeral_home",
      targetId: partnerId,
      details: `Status: ${status}`,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "UPDATE_USER_STATUS") {
    const userId = String(body.userId || "");
    const status = String(body.status || "ACTIVE");
    db.prepare("UPDATE users SET account_status = ? WHERE id = ?").run(
      status,
      userId
    );
    recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: "USER_STATUS_UPDATED",
      targetType: "user",
      targetId: userId,
      details: `Status: ${status}`,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "UPDATE_PARTNER_WHITE_LABEL") {
    const partnerId = String(body.partnerId || "");
    const enabled = body.white_label_enabled ? 1 : 0;
    const brandName = String(body.white_label_name || "").trim() || null;
    const monthlyFee = Number(body.white_label_monthly_fee ?? 49);
    db.prepare(
      "UPDATE funeral_homes SET white_label_enabled = ?, white_label_name = ?, white_label_monthly_fee = ? WHERE id = ?"
    ).run(enabled, brandName, monthlyFee, partnerId);
    recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: "PARTNER_WHITE_LABEL_UPDATED",
      targetType: "funeral_home",
      targetId: partnerId,
      details: `Enabled: ${enabled}, Name: ${brandName}, Monthly: ${monthlyFee}`,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "UPDATE_PRICING") {
    const id = String(body.id || "");
    db.prepare(`
      UPDATE pricing_configs
      SET tier_collection = ?, tier_slideshow = ?, tier_10 = ?, tier_20 = ?, tier_30 = ?, tier_45 = ?, tier_60 = ?,
          raw_footage_price = ?, archive_monthly_price = ?,
          website_setup_price = ?, website_annual_renewal = ?,
          estimated_production_cost = ?, upload_allowance_gb = ?, updated_at = ?
      WHERE id = ?
    `).run(
      Number(body.tier_collection ?? 35),
      Number(body.tier_slideshow ?? 55),
      Number(body.tier_10),
      Number(body.tier_20),
      Number(body.tier_30),
      Number(body.tier_45),
      Number(body.tier_60),
      Number(body.raw_footage_price),
      Number(body.archive_monthly_price),
      Number(body.website_setup_price ?? 49),
      Number(body.website_annual_renewal ?? 19),
      Number(body.estimated_production_cost),
      Number(body.upload_allowance_gb),
      now,
      id
    );
    recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: "PRICING_UPDATED",
      targetType: "pricing_config",
      targetId: id,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "DELETE_EXPIRED_ARCHIVE") {
    const projectId = String(body.projectId || "");
    const mediaRows = db
      .prepare("SELECT id, storage_key FROM media WHERE project_id = ?")
      .all(projectId) as { id: string; storage_key: string }[];

    for (const m of mediaRows) {
      if (!m.storage_key.startsWith("public:")) {
        await storage.deleteFile(m.storage_key);
      }
    }

    db.prepare(
      "UPDATE archives SET retention_status = 'DELETED', deletion_date = ?, updated_at = ? WHERE project_id = ?"
    ).run(now, now, projectId);

    recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: "ARCHIVE_EXPIRED_MATERIAL_DELETED",
      targetType: "archive",
      targetId: projectId,
      details: `Deleted ${mediaRows.length} raw media objects per retention policy.`,
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
