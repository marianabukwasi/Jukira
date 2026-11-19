import bcrypt from "bcryptjs";
import { getDb } from "./db";

let seeded = false;

export function ensureSeeded() {
  if (seeded) return;
  const db = getDb();

  const existingPricing = db
    .prepare("SELECT COUNT(*) as count FROM pricing_configs")
    .get() as { count: number };

  const now = new Date().toISOString();

  if (existingPricing.count === 0) {
    const insertPricing = db.prepare(`
      INSERT OR IGNORE INTO pricing_configs (
        id, country_code, country_name, currency,
        tier_collection, tier_slideshow, tier_10, tier_20, tier_30, tier_45, tier_60,
        raw_footage_price, archive_monthly_price,
        website_setup_price, website_annual_renewal,
        estimated_production_cost, upload_allowance_gb, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPricing.run(
      "prc_eu",
      "EU",
      "Europe (EUR)",
      "EUR",
      35,
      55,
      79,
      99,
      149,
      179,
      199,
      15,
      4.99,
      49,
      4.99,
      12,
      25,
      now
    );
    insertPricing.run(
      "prc_uk",
      "UK",
      "United Kingdom (GBP)",
      "GBP",
      29,
      49,
      69,
      89,
      129,
      159,
      179,
      15,
      4.49,
      45,
      4.49,
      12,
      25,
      now
    );
    insertPricing.run(
      "prc_us",
      "US",
      "United States (USD)",
      "USD",
      39,
      59,
      89,
      109,
      159,
      189,
      219,
      19,
      4.99,
      55,
      4.99,
      14,
      25,
      now
    );
    // Locally appropriate pricing for Uganda (not a raw EUR conversion)
    insertPricing.run(
      "prc_ug",
      "UG",
      "Uganda (UGX)",
      "UGX",
      110000,
      145000,
      180000,
      260000,
      350000,
      440000,
      520000,
      45000,
      12000,
      150000,
      12000,
      45000,
      20,
      now
    );
  }

  const existingUsers = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };

  if (existingUsers.count === 0) {
    // Seed funeral home partner
    db.prepare(`
      INSERT OR IGNORE INTO funeral_homes (
        id, business_name, contact_name, contact_email, contact_phone,
        country, currency, account_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "fh_oakwood",
      "Oakwood & Sons Family Funerals",
      "Arthur Pendelton",
      "partners@oakwoodfunerals.com",
      "+44 20 7946 0192",
      "EU",
      "EUR",
      "ACTIVE",
      now
    );

    const adminHash = bcrypt.hashSync("JukiraAdmin2026!", 10);
    const familyHash = bcrypt.hashSync("FamilyDemo2026!", 10);
    const partnerHash = bcrypt.hashSync("PartnerDemo2026!", 10);

    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (
        id, name, email, telephone, password_hash, role,
        account_status, funeral_home_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      "usr_admin",
      "Eleanor Shaw",
      "admin@jukira.life",
      "+44 20 7946 0001",
      adminHash,
      "ADMIN",
      "ACTIVE",
      null,
      now
    );
    insertUser.run(
      "usr_family",
      "Claire Bennett",
      "claire.bennett@example.com",
      "+44 7700 900123",
      familyHash,
      "FAMILY_OWNER",
      "ACTIVE",
      null,
      now
    );
    insertUser.run(
      "usr_partner",
      "Arthur Pendelton",
      "partners@oakwoodfunerals.com",
      "+44 20 7946 0192",
      partnerHash,
      "FUNERAL_HOME",
      "ACTIVE",
      "fh_oakwood",
      now
    );

    // Seed sample memorial project
    const closingDate = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    ).toISOString();

    db.prepare(`
      INSERT OR IGNORE INTO projects (
        id, secure_token, deceased_full_name, deceased_preferred_name,
        date_of_birth, date_of_passing, main_photo_url,
        owner_id, owner_name, owner_email, owner_phone,
        funeral_home_id, film_duration_tier, preferred_language,
        country_market, currency, project_status, closing_date,
        opening_title, closing_title, music_choice, presentation_style,
        include_shorter_version, review_required, raw_footage_purchased, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "prj_margaret",
      "margaret-vance-memories",
      "Margaret Eleanor Vance",
      "Margaret",
      "1942-05-14",
      "2025-02-03",
      "/images/stage-grandparent.png",
      "usr_family",
      "Claire Bennett",
      "claire.bennett@example.com",
      "+44 7700 900123",
      "fh_oakwood",
      "20_TO_30",
      "English",
      "EU",
      "EUR",
      "COLLECTING_CONTRIBUTIONS",
      closingDate,
      "Celebrating the Life of Margaret Eleanor Vance",
      "Forever in our hearts — With love from all the family",
      "Warm Acoustic & Piano",
      "Chronological",
      1,
      0,
      0,
      now
    );

    // Seed contributors
    const insertContributor = db.prepare(`
      INSERT OR IGNORE INTO contributors (
        id, project_id, name, relationship, relationship_custom,
        contact_info, accepted_terms_version, accepted_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertContributor.run(
      "cnt_1",
      "prj_margaret",
      "Claire Bennett",
      "Family member",
      "Daughter",
      "claire.bennett@example.com",
      "v1.0-2026",
      now,
      now
    );
    insertContributor.run(
      "cnt_2",
      "prj_margaret",
      "David Vance",
      "Family member",
      "Son",
      null,
      "v1.0-2026",
      now,
      now
    );
    insertContributor.run(
      "cnt_3",
      "prj_margaret",
      "Grace Okafor",
      "Friend",
      "Lifelong friend from university",
      null,
      "v1.0-2026",
      now,
      now
    );

    // Seed sample media pointing to our public editorial sample photos
    const insertMedia = db.prepare(`
      INSERT OR IGNORE INTO media (
        id, project_id, contributor_id, file_type, mime_type,
        storage_key, original_filename, file_size, video_duration_sec,
        upload_status, caption, event_date, event_location, enhancement_preference,
        approval_status, flagged, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMedia.run(
      "med_1",
      "prj_margaret",
      "cnt_1",
      "IMAGE",
      "image/png",
      "public:/images/stage-childhood.png",
      "margaret-garden-childhood.png",
      1240000,
      null,
      "UPLOADED",
      "In the garden at Grandmother's cottage",
      "1949",
      "Surrey, UK",
      "STANDARD_CORRECTION",
      "APPROVED",
      0,
      now
    );
    insertMedia.run(
      "med_2",
      "prj_margaret",
      "cnt_3",
      "IMAGE",
      "image/png",
      "public:/images/stage-wedding.png",
      "wedding-day-1966.png",
      1580000,
      null,
      "UPLOADED",
      "Margaret and Thomas on their wedding day",
      "1966",
      "Bath, UK",
      "KEEP_ORIGINAL",
      "APPROVED",
      0,
      now
    );
    insertMedia.run(
      "med_3",
      "prj_margaret",
      "cnt_2",
      "IMAGE",
      "image/png",
      "public:/images/stage-family.png",
      "summer-table-gathering.png",
      1920000,
      null,
      "UPLOADED",
      "Summer family lunch in the garden",
      "2004",
      "Devon, UK",
      "KEEP_ORIGINAL",
      "APPROVED",
      0,
      now
    );
    insertMedia.run(
      "med_4",
      "prj_margaret",
      "cnt_1",
      "IMAGE",
      "image/png",
      "public:/images/stage-grandparent.png",
      "with-grandchildren-autumn.png",
      1740000,
      null,
      "UPLOADED",
      "Laughing with the grandchildren in the afternoon sun",
      "2022",
      "Oxford, UK",
      "AI_ENHANCEMENT",
      "APPROVED",
      0,
      now
    );
    insertMedia.run(
      "med_5",
      "prj_margaret",
      "cnt_3",
      "IMAGE",
      "image/png",
      "public:/images/stage-friends.png",
      "afternoon-friends-1988.png",
      1610000,
      null,
      "UPLOADED",
      "Afternoon gathering with lifelong friends",
      "1988",
      "Bath, UK",
      "KEEP_ORIGINAL",
      "APPROVED",
      0,
      now
    );
    insertMedia.run(
      "med_6",
      "prj_margaret",
      "cnt_1",
      "IMAGE",
      "image/png",
      "public:/images/stage-pet-dog.png",
      "barnaby-garden.png",
      1520000,
      null,
      "UPLOADED",
      "With Barnaby in the garden on a sunny morning",
      "2016",
      "Devon, UK",
      "KEEP_ORIGINAL",
      "APPROVED",
      0,
      now
    );

    // Production job
    db.prepare(`
      INSERT OR IGNORE INTO production_jobs (
        id, project_id, assigned_to, editing_status, review_status,
        qc_checklist_json, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "job_margaret",
      "prj_margaret",
      "Eleanor Shaw",
      "COLLECTING_MEDIA",
      "PENDING",
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
      "Initial project created via Oakwood & Sons Family Funerals.",
      now
    );

    // Sample payment record
    db.prepare(`
      INSERT OR IGNORE INTO orders_payments (
        id, project_id, customer_user_id, customer_name,
        service_type, package_label, amount, currency,
        payment_status, provider_reference, invoice_number, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "ord_margaret_1",
      "prj_margaret",
      "usr_partner",
      "Oakwood & Sons Family Funerals",
      "FILM_PRODUCTION",
      "20–30 minutes Memorial Film",
      199,
      "EUR",
      "PAID",
      "INV-WHOLESALE-2026",
      "LEG-2026-0001",
      now
    );

    // Archive record
    db.prepare(`
      INSERT OR IGNORE INTO archives (
        id, project_id, storage_location, retention_status, deletion_date, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "arc_margaret",
      "prj_margaret",
      "eu-west-private-vault/prj_margaret",
      "ACTIVE",
      null,
      now
    );

    // Notification
    db.prepare(`
      INSERT OR IGNORE INTO notifications (
        id, recipient_email, recipient_role, project_id,
        event_type, subject, body, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'SENT', ?)
    `).run(
      "ntf_1",
      "claire.bennett@example.com",
      "FAMILY_OWNER",
      "prj_margaret",
      "PROJECT_CREATED",
      "Your Jukira memorial project for Margaret Eleanor Vance is ready",
      "Share your private contribution link with family and friends to begin gathering photographs and videos.",
      now
    );

    // Seed sample Memorial Website for Margaret
    const oneYearExpiry = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ).toISOString();
    db.prepare(`
      INSERT OR IGNORE INTO memorial_websites (
        id, project_id, enabled, welcome_message, life_story,
        milestones_json, hosting_term, expires_at, moderation_required,
        listed_in_garden, garden_location, garden_tribute, updated_at
      ) VALUES (?, ?, 1, ?, ?, ?, 'ANNUAL', ?, 1, 1, ?, ?, ?)
    `).run(
      "web_margaret",
      "prj_margaret",
      "Welcome to a quiet place dedicated to celebrating the warmth, kindness, and life of Margaret Eleanor Vance.",
      "Born in Surrey in 1942, Margaret spent her life bringing people together around the kitchen table, tending to her garden, and teaching music to generations of children. Her laughter, patience, and quiet generosity touched everyone who knew her.",
      JSON.stringify([
        {
          year: "1942",
          title: "Born in Surrey",
          description: "Raised in a lively household surrounded by music and books.",
        },
        {
          year: "1966",
          title: "Married Thomas in Bath",
          description: "Beginning nearly fifty-five years of partnership and family life.",
        },
        {
          year: "1974",
          title: "Community Music Teacher",
          description: "Taught piano and choir for over three decades.",
        },
        {
          year: "2010",
          title: "Grandmother of Four",
          description: "Spent every summer hosting family lunches in Devon.",
        },
      ]),
      oneYearExpiry,
      "Oxford, United Kingdom",
      "Beloved mother, grandmother, and music teacher — remembered for her warmth and family lunches.",
      now
    );

    db.prepare(`
      INSERT OR IGNORE INTO memorial_messages (
        id, project_id, author_name, relationship, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'APPROVED', ?)
    `).run(
      "msg_1",
      "prj_margaret",
      "Grace Okafor",
      "Lifelong friend",
      "Margaret had a gift for making every guest feel like family the moment they walked through her door. I will never forget our afternoons in Bath.",
      now
    );
    db.prepare(`
      INSERT OR IGNORE INTO memorial_messages (
        id, project_id, author_name, relationship, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'APPROVED', ?)
    `).run(
      "msg_2",
      "prj_margaret",
      "David Vance",
      "Son",
      "Thank you to everyone who has shared photographs and stories here — seeing Mum through your eyes means the world to us.",
      now
    );
  }

  seeded = true;
}
