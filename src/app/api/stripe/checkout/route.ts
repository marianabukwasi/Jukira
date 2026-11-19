import { NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import { getPricingByMarket, getTierPrice } from "@/lib/pricing";
import { FILM_DURATION_LABELS } from "@/lib/types";

export async function POST(request: Request) {
  ensureSeeded();
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const projectId = String(body.projectId || "");
  const serviceType = String(body.serviceType || "FILM_PRODUCTION");
  const project = getAuthorizedProject(user, projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const pricing = getPricingByMarket(project.country_market);
  let amount = getTierPrice(pricing, project.film_duration_tier);
  let label = `${FILM_DURATION_LABELS[project.film_duration_tier]} — ${
    project.deceased_full_name
  }`;

  if (serviceType === "RAW_FOOTAGE") {
    amount = pricing.raw_footage_price;
    label = `Raw Footage Package — ${project.deceased_full_name}`;
  } else if (serviceType === "MEMORIAL_WEBSITE") {
    amount = pricing.website_setup_price ?? 99.99;
    label = `Jukira Individual Memorial — ${project.deceased_full_name}`;
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({
      demoMode: true,
      message:
        "STRIPE_SECRET_KEY is not configured yet. Using local payment simulation.",
    });
  }

  const stripe = new Stripe(stripeKey);
  const origin = new URL(request.url).origin;
  const invoiceNum = `LEG-${new Date().getFullYear()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

  const db = getDb();
  const orderId = `ord_${crypto.randomBytes(5).toString("hex")}`;
  db.prepare(`
    INSERT INTO orders_payments (
      id, project_id, customer_user_id, customer_name,
      service_type, package_label, amount, currency,
      payment_status, invoice_number, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
  `).run(
    orderId,
    projectId,
    user.id,
    user.name,
    serviceType,
    label,
    amount,
    pricing.currency,
    invoiceNum,
    new Date().toISOString()
  );

  const unitAmount =
    pricing.currency === "UGX" ? Math.round(amount) : Math.round(amount * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: pricing.currency.toLowerCase(),
          product_data: { name: label },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
      projectId,
      serviceType,
    },
    success_url: `${origin}/family/projects/${projectId}/film?paid=1`,
    cancel_url: `${origin}/family/projects/${projectId}/film?cancelled=1`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
