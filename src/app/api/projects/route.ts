import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { getPricingByMarket, getTierPrice } from "@/lib/pricing";
import { queueNotification, recordAuditLog } from "@/lib/audit";
import { FILM_DURATION_LABELS, type FilmDurationTier } from "@/lib/types";

export async function GET() {
  ensureSeeded();
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  let projects;
  if (user.role === "ADMIN") {
    projects = db
      .prepare("SELECT * FROM projects ORDER BY created_at DESC")
      .all();
  } else if (user.role === "FUNERAL_HOME") {
    projects = db
      .prepare(
        "SELECT * FROM projects WHERE funeral_home_id = ? ORDER BY created_at DESC"
      )
      .all(user.funeralHomeId || "");
  } else {
    projects = db
      .prepare(
        "SELECT * FROM projects WHERE owner_id = ? OR LOWER(owner_email) = LOWER(?) ORDER BY created_at DESC"
      )
      .all(user.id, user.email);
  }

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const deceasedFullName = String(body.deceasedFullName || "").trim();
    const deceasedPreferredName =
      String(body.deceasedPreferredName || "").trim() ||
      deceasedFullName.split(" ")[0];
    const dateOfBirth = String(body.dateOfBirth || "").trim() || null;
    const dateOfPassing = String(body.dateOfPassing || "").trim() || null;
    const mainPhotoUrl =
      String(body.mainPhotoUrl || "").trim() || "/images/stage-grandparent.png";
    const filmDurationTier = (body.filmDurationTier ||
      "20_TO_30") as FilmDurationTier;
    const ownerName = String(body.ownerName || user.name).trim();
    const ownerEmail = String(body.ownerEmail || user.email)
      .trim()
      .toLowerCase();
    const ownerPhone = String(body.ownerPhone || "").trim() || null;
    const preferredLanguage = String(body.preferredLanguage || "English").trim();
    const countryMarket = String(body.countryMarket || "EU").trim();
    const closingDate = String(body.closingDate || "").trim() || null;
    const funeralHomeId =
      user.role === "FUNERAL_HOME"
        ? user.funeralHomeId || null
        : body.funeralHomeId || null;

    if (!deceasedFullName || !ownerName || !ownerEmail) {
      return NextResponse.json(
        {
          error:
            "Please provide the person's full name and the project owner's name and email.",
        },
        { status: 400 }
      );
    }

    const db = getDb();
    const pricing = getPricingByMarket(countryMarket);
    const tierPrice = getTierPrice(pricing, filmDurationTier);

    const projectId = `prj_${crypto.randomBytes(5).toString("hex")}`;
    const slugBase = deceasedPreferredName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const secureToken = `${slugBase || "memorial"}-${crypto
      .randomBytes(4)
      .toString("hex")}`;
    const now = new Date().toISOString();

    const ownerUser = db
      .prepare("SELECT id FROM users WHERE LOWER(email) = ?")
      .get(ownerEmail) as { id: string } | undefined;

    const ownerId =
      user.role === "FAMILY_OWNER" ? user.id : ownerUser?.id || null;

    const yearBirth = dateOfBirth ? dateOfBirth.slice(0, 4) : "";
    const yearPass = dateOfPassing ? dateOfPassing.slice(0, 4) : "";
    const datesLine =
      yearBirth && yearPass ? `${yearBirth} – ${yearPass}` : "";

    db.prepare(`
      INSERT INTO projects (
        id, secure_token, deceased_full_name, deceased_preferred_name,
        date_of_birth, date_of_passing, main_photo_url,
        owner_id, owner_name, owner_email, owner_phone,
        funeral_home_id, film_duration_tier, preferred_language,
        country_market, currency, project_status, closing_date,
        opening_title, closing_title, music_choice, presentation_style,
        include_shorter_version, review_required, raw_footage_purchased, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COLLECTING_CONTRIBUTIONS', ?, ?, ?, 'Warm Acoustic & Piano', 'Chronological', 0, 0, 0, ?)
    `).run(
      projectId,
      secureToken,
      deceasedFullName,
      deceasedPreferredName,
      dateOfBirth,
      dateOfPassing,
      mainPhotoUrl,
      ownerId,
      ownerName,
      ownerEmail,
      ownerPhone,
      funeralHomeId,
      filmDurationTier,
      preferredLanguage,
      pricing.country_code,
      pricing.currency,
      closingDate,
      `Celebrating the Life of ${deceasedFullName}${
        datesLine ? ` (${datesLine})` : ""
      }`,
      `Forever remembered with love`,
      now
    );

    // Create production job
    db.prepare(`
      INSERT INTO production_jobs (
        id, project_id, editing_status, review_status, qc_checklist_json, updated_at
      ) VALUES (?, ?, 'COLLECTING_MEDIA', 'PENDING', ?, ?)
    `).run(
      `job_${crypto.randomBytes(5).toString("hex")}`,
      projectId,
      JSON.stringify({
        correctPerson: false,
        sensibleSequence: false,
        noInappropriateMaterial: false,
        smoothTransitions: false,
        musicAppropriate: false,
        audioAcceptable: false,
        imagesNotDistorted: false,
        titlesCorrect: false,
        durationMatches: false,
        exportPlaysCorrectly: false,
      }),
      now
    );

    // Create initial order/invoice (PENDING until payment confirmed)
    const invoiceNum = `LEG-${new Date().getFullYear()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;
    db.prepare(`
      INSERT INTO orders_payments (
        id, project_id, customer_user_id, customer_name,
        service_type, package_label, amount, currency,
        payment_status, invoice_number, created_at
      ) VALUES (?, ?, ?, ?, 'FILM_PRODUCTION', ?, ?, ?, 'PENDING', ?, ?)
    `).run(
      `ord_${crypto.randomBytes(5).toString("hex")}`,
      projectId,
      user.id,
      user.role === "FUNERAL_HOME" ? user.name : ownerName,
      `${FILM_DURATION_LABELS[filmDurationTier]} Memorial Film`,
      tierPrice,
      pricing.currency,
      invoiceNum,
      now
    );

    // Create archive record
    db.prepare(`
      INSERT INTO archives (
        id, project_id, storage_location, retention_status, updated_at
      ) VALUES (?, ?, ?, 'ACTIVE', ?)
    `).run(
      `arc_${crypto.randomBytes(5).toString("hex")}`,
      projectId,
      `private-vault/${projectId}`,
      now
    );

    queueNotification({
      recipientEmail: ownerEmail,
      recipientRole: "FAMILY_OWNER",
      projectId,
      eventType: "PROJECT_CREATED",
      subject: `Memorial project created for ${deceasedFullName}`,
      body: `Your private contribution link is ready: /contribute/${secureToken}`,
    });

    recordAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      action: "PROJECT_CREATED",
      targetType: "project",
      targetId: projectId,
      details: `Deceased: ${deceasedFullName}, Market: ${pricing.country_code}`,
    });

    return NextResponse.json({
      projectId,
      secureToken,
      contributionPath: `/contribute/${secureToken}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create project." },
      { status: 500 }
    );
  }
}
