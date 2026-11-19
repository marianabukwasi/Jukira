import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const inquiryType = String(body.inquiryType || "General").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill in your name, email, and message." },
        { status: 400 }
      );
    }

    const db = getDb();
    db.prepare(
      `INSERT INTO contact_inquiries (id, name, email, inquiry_type, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      `inq_${crypto.randomBytes(6).toString("hex")}`,
      name,
      email,
      inquiryType,
      message,
      new Date().toISOString()
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to send your message right now." },
      { status: 500 }
    );
  }
}
