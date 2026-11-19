import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DATA_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", "jukira-data")
    : path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "jukira.db");

declare global {
  var __legaseeDb: DatabaseSync | undefined;
}

function createDatabase(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  initSchema(db);
  return db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS funeral_homes (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL UNIQUE,
      contact_phone TEXT,
      country TEXT NOT NULL DEFAULT 'EU',
      currency TEXT NOT NULL DEFAULT 'EUR',
      account_status TEXT NOT NULL DEFAULT 'PENDING',
      white_label_enabled INTEGER NOT NULL DEFAULT 0,
      white_label_name TEXT,
      white_label_monthly_fee REAL NOT NULL DEFAULT 49,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telephone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      account_status TEXT NOT NULL DEFAULT 'ACTIVE',
      funeral_home_id TEXT REFERENCES funeral_homes(id),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      secure_token TEXT NOT NULL UNIQUE,
      project_type TEXT NOT NULL DEFAULT 'PERSON',
      deceased_full_name TEXT NOT NULL,
      deceased_preferred_name TEXT NOT NULL,
      date_of_birth TEXT,
      date_of_passing TEXT,
      main_photo_url TEXT,
      owner_id TEXT REFERENCES users(id),
      owner_name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      owner_phone TEXT,
      funeral_home_id TEXT REFERENCES funeral_homes(id),
      film_duration_tier TEXT NOT NULL DEFAULT '20_TO_30',
      preferred_language TEXT NOT NULL DEFAULT 'English',
      country_market TEXT NOT NULL DEFAULT 'EU',
      currency TEXT NOT NULL DEFAULT 'EUR',
      project_status TEXT NOT NULL DEFAULT 'COLLECTING_CONTRIBUTIONS',
      closing_date TEXT,
      opening_title TEXT,
      closing_title TEXT,
      music_choice TEXT DEFAULT 'Warm Acoustic & Piano',
      presentation_style TEXT DEFAULT 'Chronological',
      include_shorter_version INTEGER NOT NULL DEFAULT 0,
      review_required INTEGER NOT NULL DEFAULT 0,
      raw_footage_purchased INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contributors (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      relationship_custom TEXT,
      contact_info TEXT,
      accepted_terms_version TEXT NOT NULL,
      accepted_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
      file_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      storage_key TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      video_duration_sec INTEGER,
      upload_status TEXT NOT NULL DEFAULT 'UPLOADED',
      caption TEXT,
      event_date TEXT,
      event_location TEXT,
      enhancement_preference TEXT NOT NULL DEFAULT 'KEEP_ORIGINAL',
      approval_status TEXT NOT NULL DEFAULT 'APPROVED',
      flagged INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_jobs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
      assigned_to TEXT,
      editing_status TEXT NOT NULL DEFAULT 'AWAITING_MEDIA',
      review_status TEXT NOT NULL DEFAULT 'PENDING',
      qc_checklist_json TEXT NOT NULL DEFAULT '{}',
      output_file_key TEXT,
      shorter_file_key TEXT,
      raw_archive_key TEXT,
      notes TEXT,
      completed_at TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pricing_configs (
      id TEXT PRIMARY KEY,
      country_code TEXT NOT NULL UNIQUE,
      country_name TEXT NOT NULL,
      currency TEXT NOT NULL,
      tier_collection REAL NOT NULL DEFAULT 35,
      tier_slideshow REAL NOT NULL DEFAULT 55,
      tier_10 REAL NOT NULL,
      tier_20 REAL NOT NULL,
      tier_30 REAL NOT NULL,
      tier_45 REAL NOT NULL,
      tier_60 REAL NOT NULL,
      raw_footage_price REAL NOT NULL,
      archive_monthly_price REAL NOT NULL,
      website_setup_price REAL NOT NULL DEFAULT 49,
      website_annual_renewal REAL NOT NULL DEFAULT 19,
      estimated_production_cost REAL NOT NULL,
      upload_allowance_gb INTEGER NOT NULL DEFAULT 25,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders_payments (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      customer_user_id TEXT REFERENCES users(id),
      customer_name TEXT NOT NULL,
      service_type TEXT NOT NULL,
      package_label TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'PENDING',
      provider_reference TEXT,
      invoice_number TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      customer_user_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      monthly_price REAL NOT NULL,
      currency TEXT NOT NULL,
      renewal_date TEXT NOT NULL,
      expiry_date TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS archives (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
      storage_location TEXT NOT NULL,
      retention_status TEXT NOT NULL DEFAULT 'ACTIVE',
      deletion_date TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_email TEXT NOT NULL,
      recipient_role TEXT NOT NULL,
      project_id TEXT,
      event_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'SENT',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      actor_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      inquiry_type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memorial_websites (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
      enabled INTEGER NOT NULL DEFAULT 0,
      welcome_message TEXT NOT NULL DEFAULT '',
      life_story TEXT NOT NULL DEFAULT '',
      milestones_json TEXT NOT NULL DEFAULT '[]',
      hosting_term TEXT NOT NULL DEFAULT 'ANNUAL',
      expires_at TEXT,
      moderation_required INTEGER NOT NULL DEFAULT 1,
      listed_in_garden INTEGER NOT NULL DEFAULT 0,
      garden_location TEXT,
      garden_tribute TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memorial_messages (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      message TEXT NOT NULL,
      attachment_media_id TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL
    );
  `);

  try {
    db.exec("ALTER TABLE media ADD COLUMN event_location TEXT;");
  } catch {
    // Column already exists
  }
  try {
    db.exec("ALTER TABLE pricing_configs ADD COLUMN tier_collection REAL NOT NULL DEFAULT 35;");
  } catch {
    // Column already exists
  }
  try {
    db.exec("ALTER TABLE pricing_configs ADD COLUMN tier_slideshow REAL NOT NULL DEFAULT 55;");
  } catch {
    // Column already exists
  }
  try {
    db.exec("ALTER TABLE funeral_homes ADD COLUMN white_label_enabled INTEGER NOT NULL DEFAULT 0;");
    db.exec("ALTER TABLE funeral_homes ADD COLUMN white_label_name TEXT;");
    db.exec("ALTER TABLE funeral_homes ADD COLUMN white_label_monthly_fee REAL NOT NULL DEFAULT 49;");
  } catch {
    // Columns already exist
  }
  try {
    db.exec("ALTER TABLE pricing_configs ADD COLUMN website_setup_price REAL NOT NULL DEFAULT 49;");
    db.exec("ALTER TABLE pricing_configs ADD COLUMN website_annual_renewal REAL NOT NULL DEFAULT 4.99;");
  } catch {
    // Column already exists
  }
  try {
    db.exec("ALTER TABLE memorial_messages ADD COLUMN attachment_media_id TEXT;");
  } catch {
    // Column already exists
  }
  try {
    db.exec("ALTER TABLE projects ADD COLUMN project_type TEXT NOT NULL DEFAULT 'PERSON';");
  } catch {
    // Column already exists
  }
  try {
    db.exec("ALTER TABLE memorial_websites ADD COLUMN listed_in_garden INTEGER NOT NULL DEFAULT 0;");
    db.exec("ALTER TABLE memorial_websites ADD COLUMN garden_location TEXT;");
    db.exec("ALTER TABLE memorial_websites ADD COLUMN garden_tribute TEXT;");
  } catch {
    // Columns already exist
  }
}

export function getDb(): DatabaseSync {
  if (!global.__legaseeDb) {
    global.__legaseeDb = createDatabase();
  }
  return global.__legaseeDb;
}
