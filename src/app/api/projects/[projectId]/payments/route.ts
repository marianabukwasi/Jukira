import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import { getPricingByMarket, getTierPrice } from "@/lib/pricing";
import { queueNotification, recordAuditLog } from "@/lib/audit";
import { FILM_DURATION_LABELS } from "@/lib/types";

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

  const body = await request.json();
  const action = String(body.action || "");
  const simulateFailure = body.simulateFailure === true;
  const db = getDb();
  const pricing = getPricingByMarket(project.country_market);
  const now = new Date().toISOString();
  const invoiceNum = `LEG-${new Date().getFullYear()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

  if (simulateFailure) {
    db.prepare(`
      INSERT INTO orders_payments (
        id, project_id, customer_user_id, customer_name,
        service_type, package_label, amount, currency,
        payment_status, provider_reference, invoice_number, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FAILED', ?, ?, ?)
    `).run(
      `ord_${crypto.randomBytes(5).toString("hex")}`,
      projectId,
      user.id,
      user.name,
      action === "PURCHASE_RAW_FOOTAGE"
        ? "RAW_FOOTAGE"
        : action === "START_ARCHIVE"
        ? "ARCHIVE_SUBSCRIPTION"
        : "FILM_PRODUCTION",
      "Attempted payment",
      action === "PURCHASE_RAW_FOOTAGE"
        ? pricing.raw_footage_price
        : action === "START_ARCHIVE"
        ? pricing.archive_monthly_price
        : getTierPrice(pricing, project.film_duration_tier),
      pricing.currency,
      `FAIL-${Date.now()}`,
      invoiceNum,
      now
    );

    return NextResponse.json(
      {
        error:
          "Payment was declined by the provider. No paid service has been granted.",
      },
      { status: 402 }
    );
  }

  if (action === "PAY_PRODUCTION") {
    const amount = getTierPrice(pricing, project.film_duration_tier);
    db.prepare(`
      INSERT INTO orders_payments (
        id, project_id, customer_user_id, customer_name,
        service_type, package_label, amount, currency,
        payment_status, provider_reference, invoice_number, created_at
      ) VALUES (?, ?, ?, ?, 'FILM_PRODUCTION', ?, ?, ?, 'PAID', ?, ?, ?)
    `).run(
      `ord_${crypto.randomBytes(5).toString("hex")}`,
      projectId,
      user.id,
      user.name,
      `${FILM_DURATION_LABELS[project.film_duration_tier]} Memorial Film`,
      amount,
      pricing.currency,
      `PAY-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
      invoiceNum,
      now
    );
    queueNotification({
      recipientEmail: user.email,
      recipientRole: user.role,
      projectId,
      eventType: "PAYMENT_CONFIRMED",
      subject: `Payment confirmed (${invoiceNum})`,
      body: `Your payment of ${amount} ${pricing.currency} for ${project.deceased_full_name} has been confirmed.`,
    });
  } else if (action === "PURCHASE_RAW_FOOTAGE") {
    db.prepare(`
      INSERT INTO orders_payments (
        id, project_id, customer_user_id, customer_name,
        service_type, package_label, amount, currency,
        payment_status, provider_reference, invoice_number, created_at
      ) VALUES (?, ?, ?, ?, 'RAW_FOOTAGE', 'Raw Footage Download Package', ?, ?, 'PAID', ?, ?, ?)
    `).run(
      `ord_${crypto.randomBytes(5).toString("hex")}`,
      projectId,
      user.id,
      user.name,
      pricing.raw_footage_price,
      pricing.currency,
      `RAW-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
      invoiceNum,
      now
    );
    db.prepare(
      "UPDATE projects SET raw_footage_purchased = 1 WHERE id = ?"
    ).run(projectId);
  } else if (action === "START_ARCHIVE") {
    const renewal = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    db.prepare(`
      INSERT INTO orders_payments (
        id, project_id, customer_user_id, customer_name,
        service_type, package_label, amount, currency,
        payment_status, provider_reference, invoice_number, created_at
      ) VALUES (?, ?, ?, ?, 'ARCHIVE_SUBSCRIPTION', 'Monthly Cloud Archive', ?, ?, 'PAID', ?, ?, ?)
    `).run(
      `ord_${crypto.randomBytes(5).toString("hex")}`,
      projectId,
      user.id,
      user.name,
      pricing.archive_monthly_price,
      pricing.currency,
      `SUB-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
      invoiceNum,
      now
    );
    db.prepare(`
      INSERT INTO subscriptions (
        id, project_id, customer_user_id, status, monthly_price, currency, renewal_date, created_at
      ) VALUES (?, ?, ?, 'ACTIVE', ?, ?, ?, ?)
    `).run(
      `sub_${crypto.randomBytes(5).toString("hex")}`,
      projectId,
      user.id,
      pricing.archive_monthly_price,
      pricing.currency,
      renewal,
      now
    );
    db.prepare(
      "UPDATE archives SET retention_status = 'ACTIVE', deletion_date = NULL, updated_at = ? WHERE project_id = ?"
    ).run(now, projectId);
  } else if (action === "CANCEL_ARCHIVE") {
    const deletionDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    db.prepare(
      "UPDATE subscriptions SET status = 'CANCELLED', expiry_date = ? WHERE project_id = ? AND status = 'ACTIVE'"
    ).run(deletionDate, projectId);
    db.prepare(
      "UPDATE archives SET retention_status = 'GRACE_PERIOD', deletion_date = ?, updated_at = ? WHERE project_id = ?"
    ).run(deletionDate, now, projectId);
    queueNotification({
      recipientEmail: project.owner_email,
      recipientRole: "FAMILY_OWNER",
      projectId,
      eventType: "ARCHIVE_CANCELLATION",
      subject: `Archive subscription ending for ${project.deceased_full_name}`,
      body: `Your cloud archive subscription has been cancelled. You may download your film and files until ${deletionDate.slice(
        0,
        10
      )}, after which archived material will be deleted.`,
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action,
    targetType: "project",
    targetId: projectId,
    details: `Invoice: ${invoiceNum}`,
  });

  return NextResponse.json({ ok: true, invoiceNumber: invoiceNum });
}
