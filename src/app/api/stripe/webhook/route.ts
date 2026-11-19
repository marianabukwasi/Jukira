import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  ensureSeeded();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeKey);
  const sig = request.headers.get("stripe-signature") || "";
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const projectId = session.metadata?.projectId;
    const serviceType = session.metadata?.serviceType;

    const db = getDb();
    if (orderId) {
      db.prepare(
        "UPDATE orders_payments SET payment_status = 'PAID', provider_reference = ? WHERE id = ?"
      ).run(session.id, orderId);
    }

    if (projectId && serviceType === "RAW_FOOTAGE") {
      db.prepare(
        "UPDATE projects SET raw_footage_purchased = 1 WHERE id = ?"
      ).run(projectId);
    }

    if (projectId) {
      recordAuditLog({
        action: "STRIPE_PAYMENT_CONFIRMED",
        targetType: "project",
        targetId: projectId,
        details: `Order: ${orderId}, Service: ${serviceType}`,
      });
    }
  }

  return NextResponse.json({ received: true });
}
