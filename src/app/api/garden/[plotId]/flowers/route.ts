import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import type { MemorialPlotRecord } from "@/lib/types";

const FLOWER_CATALOG: Record<string, number> = {
  "White Rose": 1.5,
  "Ivory Lily": 1.5,
  "Forget-Me-Not Bouquet": 2.0,
  "Olive & Laurel Wreath": 2.0,
  "Sunlit Daisy Posy": 1.25,
};

export async function POST(
  request: Request,
  context: { params: Promise<{ plotId: string }> }
) {
  ensureSeeded();
  const { plotId } = await context.params;
  const db = getDb();

  const plot = db
    .prepare("SELECT * FROM memorial_plots WHERE id = ?")
    .get(plotId) as unknown as MemorialPlotRecord | undefined;

  if (!plot || !plot.allow_flowers) {
    return NextResponse.json(
      { error: "Digital flowers are not enabled for this resting place." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const flowerType = String(body.flowerType || "White Rose");
  const pricePaid = FLOWER_CATALOG[flowerType] ?? 1.5;
  const isAnonymous = body.isAnonymous === true;
  const senderName = isAnonymous
    ? null
    : String(body.senderName || "").trim() || "A Visitor";
  const message = String(body.message || "").trim() || null;
  const now = new Date().toISOString();

  const flowerId = `flw_${crypto.randomBytes(5).toString("hex")}`;
  db.prepare(`
    INSERT INTO digital_flowers (
      id, plot_id, flower_type, sender_name, is_anonymous, message,
      price_paid, currency, placed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'USD', ?)
  `).run(
    flowerId,
    plotId,
    flowerType,
    senderName,
    isAnonymous ? 1 : 0,
    message,
    pricePaid,
    now
  );

  return NextResponse.json({
    ok: true,
    flower: {
      id: flowerId,
      plot_id: plotId,
      flower_type: flowerType,
      sender_name: senderName,
      is_anonymous: isAnonymous ? 1 : 0,
      message,
      price_paid: pricePaid,
      currency: "USD",
      placed_at: now,
    },
  });
}
