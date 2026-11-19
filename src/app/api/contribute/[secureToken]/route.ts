import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export async function GET(
  _request: Request,
  context: { params: Promise<{ secureToken: string }> }
) {
  ensureSeeded();
  const { secureToken } = await context.params;
  const db = getDb();

  const project = db
    .prepare(
      `SELECT p.id, p.secure_token, p.deceased_full_name, p.deceased_preferred_name,
              p.date_of_birth, p.date_of_passing, p.main_photo_url, p.closing_date,
              p.project_status,
              fh.white_label_enabled, fh.white_label_name, fh.business_name as partner_business_name
       FROM projects p
       LEFT JOIN funeral_homes fh ON fh.id = p.funeral_home_id
       WHERE p.secure_token = ?`
    )
    .get(secureToken);

  if (!project) {
    return NextResponse.json(
      { error: "Contribution link not found or expired." },
      { status: 404 }
    );
  }

  return NextResponse.json({ project });
}
