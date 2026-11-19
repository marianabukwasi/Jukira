import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { queueNotification, recordAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const telephone = String(body.telephone || "").trim() || null;
    const password = String(body.password || "");
    const role =
      body.role === "FUNERAL_HOME" ? "FUNERAL_HOME" : "FAMILY_OWNER";
    const businessName = String(body.businessName || "").trim();
    const country = String(body.country || "EU").trim();

    if (!name || !email || password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Please provide your name, a valid email, and a password of at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (role === "FUNERAL_HOME" && !businessName) {
      return NextResponse.json(
        { error: "Please provide your funeral home business name." },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db
      .prepare("SELECT id FROM users WHERE LOWER(email) = ?")
      .get(email);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const passwordHash = await hashPassword(password);
    const userId = `usr_${crypto.randomBytes(6).toString("hex")}`;
    let funeralHomeId: string | null = null;
    let accountStatus = "ACTIVE";

    if (role === "FUNERAL_HOME") {
      funeralHomeId = `fh_${crypto.randomBytes(6).toString("hex")}`;
      accountStatus = "PENDING";
      const currencyMap: Record<string, string> = {
        EU: "EUR",
        UK: "GBP",
        US: "USD",
        UG: "UGX",
      };
      db.prepare(`
        INSERT INTO funeral_homes (
          id, business_name, contact_name, contact_email, contact_phone,
          country, currency, account_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
      `).run(
        funeralHomeId,
        businessName,
        name,
        email,
        telephone,
        country,
        currencyMap[country] || "EUR",
        now
      );
    }

    db.prepare(`
      INSERT INTO users (
        id, name, email, telephone, password_hash, role,
        account_status, funeral_home_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name,
      email,
      telephone,
      passwordHash,
      role,
      accountStatus,
      funeralHomeId,
      now
    );

    recordAuditLog({
      actorUserId: userId,
      actorEmail: email,
      action: "USER_REGISTERED",
      targetType: "user",
      targetId: userId,
      details: `Role: ${role}, Status: ${accountStatus}`,
    });

    if (role === "FUNERAL_HOME") {
      queueNotification({
        recipientEmail: email,
        recipientRole: "FUNERAL_HOME",
        eventType: "PARTNER_APPLICATION_RECEIVED",
        subject: "Your Jukira partner application has been received",
        body: "An administrator will review and activate your funeral home partner account shortly.",
      });
      return NextResponse.json({
        pendingApproval: true,
        message:
          "Partner request submitted. An administrator will approve your account before you sign in.",
      });
    }

    await setSessionCookie({
      id: userId,
      name,
      email,
      role: "FAMILY_OWNER",
      funeralHomeId: null,
    });

    return NextResponse.json({
      pendingApproval: false,
      redirectTo: "/family/dashboard",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create account right now." },
      { status: 500 }
    );
  }
}
