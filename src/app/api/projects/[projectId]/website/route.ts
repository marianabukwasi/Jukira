import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import { getPricingByMarket } from "@/lib/pricing";
import { recordAuditLog } from "@/lib/audit";
import type { MemorialWebsiteRecord } from "@/lib/types";

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
  const website = db
    .prepare("SELECT * FROM memorial_websites WHERE project_id = ?")
    .get(projectId) as unknown as MemorialWebsiteRecord | undefined;
  const messages = db
    .prepare(
      "SELECT * FROM memorial_messages WHERE project_id = ? ORDER BY created_at DESC"
    )
    .all(projectId);
  const pricing = getPricingByMarket(project.country_market);

  return NextResponse.json({
    website: website ? { ...website } : null,
    messages,
    setupPrice: pricing.website_setup_price ?? 49,
    monthlyHostingPrice: pricing.archive_monthly_price ?? 4.99,
    currency: pricing.currency,
  });
}

export async function POST(
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

  const db = getDb();
  const pricing = getPricingByMarket(project.country_market);
  const now = new Date().toISOString();

  const existing = db
    .prepare("SELECT * FROM memorial_websites WHERE project_id = ?")
    .get(projectId) as unknown as MemorialWebsiteRecord | undefined;

  const isRenewal = Boolean(existing && existing.enabled);
  const days = isRenewal ? 30 : 180; // 6 months free included on initial setup, then monthly €4.99
  const expiresAt = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toISOString();
  const amount = isRenewal
    ? pricing.archive_monthly_price ?? 4.99
    : pricing.website_setup_price ?? 49;

  const invoiceNum = `LEG-${new Date().getFullYear()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

  db.prepare(`
    INSERT INTO orders_payments (
      id, project_id, customer_user_id, customer_name,
      service_type, package_label, amount, currency,
      payment_status, provider_reference, invoice_number, created_at
    ) VALUES (?, ?, ?, ?, 'MEMORIAL_WEBSITE', ?, ?, ?, 'PAID', ?, ?, ?)
  `).run(
    `ord_${crypto.randomBytes(5).toString("hex")}`,
    projectId,
    user.id,
    user.name,
    isRenewal
      ? "Memorial Website Monthly Hosting"
      : "Dedicated Memorial Website (Includes 6 Months Free Hosting)",
    amount,
    pricing.currency,
    `WEB-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    invoiceNum,
    now
  );

  if (existing) {
    db.prepare(
      "UPDATE memorial_websites SET enabled = 1, hosting_term = 'SIX_MONTHS', expires_at = ?, updated_at = ? WHERE project_id = ?"
    ).run(expiresAt, now, projectId);
  } else {
    db.prepare(`
      INSERT INTO memorial_websites (
        id, project_id, enabled, welcome_message, life_story,
        milestones_json, hosting_term, expires_at, moderation_required, updated_at
      ) VALUES (?, ?, 1, ?, ?, '[]', 'SIX_MONTHS', ?, 1, ?)
    `).run(
      `web_${crypto.randomBytes(5).toString("hex")}`,
      projectId,
      `Welcome to a quiet place celebrating the life of ${project.deceased_full_name}.`,
      "",
      expiresAt,
      now
    );
  }

  recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: isRenewal ? "MEMORIAL_WEBSITE_RENEWED" : "MEMORIAL_WEBSITE_ACTIVATED",
    targetType: "project",
    targetId: projectId,
    details: `Invoice: ${invoiceNum}`,
  });

  return NextResponse.json({ ok: true, invoiceNumber: invoiceNum, expiresAt });
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
  const now = new Date().toISOString();

  if (body.messageId && body.status) {
    const nextStatus = String(body.status);
    db.prepare(
      "UPDATE memorial_messages SET status = ? WHERE id = ? AND project_id = ?"
    ).run(nextStatus, String(body.messageId), projectId);

    const msgRow = db
      .prepare(
        "SELECT attachment_media_id FROM memorial_messages WHERE id = ? AND project_id = ?"
      )
      .get(String(body.messageId), projectId) as
      | { attachment_media_id: string | null }
      | undefined;

    if (msgRow?.attachment_media_id) {
      db.prepare(
        "UPDATE media SET approval_status = ? WHERE id = ? AND project_id = ?"
      ).run(
        nextStatus === "APPROVED" ? "APPROVED" : "REJECTED",
        msgRow.attachment_media_id,
        projectId
      );
    }

    return NextResponse.json({ ok: true });
  }

  db.prepare(`
    UPDATE memorial_websites
    SET welcome_message = COALESCE(?, welcome_message),
        life_story = COALESCE(?, life_story),
        milestones_json = COALESCE(?, milestones_json),
        moderation_required = COALESCE(?, moderation_required),
        listed_in_garden = COALESCE(?, listed_in_garden),
        garden_location = COALESCE(?, garden_location),
        garden_tribute = COALESCE(?, garden_tribute),
        updated_at = ?
    WHERE project_id = ?
  `).run(
    typeof body.welcome_message === "string" ? body.welcome_message : null,
    typeof body.life_story === "string" ? body.life_story : null,
    Array.isArray(body.milestones) ? JSON.stringify(body.milestones) : null,
    typeof body.moderation_required === "boolean"
      ? body.moderation_required
        ? 1
        : 0
      : null,
    typeof body.listed_in_garden === "boolean"
      ? body.listed_in_garden
        ? 1
        : 0
      : null,
    typeof body.garden_location === "string" ? body.garden_location : null,
    typeof body.garden_tribute === "string" ? body.garden_tribute : null,
    now,
    projectId
  );

  return NextResponse.json({ ok: true });
}
