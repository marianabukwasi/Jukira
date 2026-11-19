import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import { recordAuditLog } from "@/lib/audit";
import type { MemorialPlotRecord } from "@/lib/types";

export async function GET(request: Request) {
  ensureSeeded();
  const url = new URL(request.url);
  const checkDuplicate = (url.searchParams.get("checkDuplicate") || "").trim();
  const gardenType = url.searchParams.get("gardenType");
  const country = url.searchParams.get("country");
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  const db = getDb();

  if (checkDuplicate) {
    const matches = db
      .prepare(
        `SELECT id, plot_reference, deceased_name, date_of_birth, date_of_death, country, section_name
         FROM memorial_plots
         WHERE LOWER(deceased_name) LIKE ? AND verification_status != 'REMOVED'
         LIMIT 10`
      )
      .all(`%${checkDuplicate.toLowerCase()}%`);
    return NextResponse.json({ matches });
  }

  const allPlots = db
    .prepare(
      `SELECT p.*, pr.secure_token
       FROM memorial_plots p
       LEFT JOIN projects pr ON pr.id = p.project_id
       WHERE p.privacy_level = 'PUBLIC'
         AND p.verification_status IN ('APPROVED', 'PARTNER_VERIFIED')
       ORDER BY p.created_at DESC`
    )
    .all() as (MemorialPlotRecord & { secure_token: string | null })[];

  const filtered = allPlots.filter((plot) => {
    if (gardenType && plot.garden_type !== gardenType) return false;
    if (country && country !== "ALL" && plot.country !== country) return false;
    if (q) {
      return (
        plot.deceased_name.toLowerCase().includes(q) ||
        plot.plot_reference.toLowerCase().includes(q) ||
        (plot.family_plot_name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return NextResponse.json({ plots: filtered });
}

export async function POST(request: Request) {
  ensureSeeded();
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const projectId = String(body.projectId || "");
  const project = getAuthorizedProject(user, projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM memorial_plots WHERE project_id = ?")
    .get(projectId) as unknown as MemorialPlotRecord | undefined;

  const gardenType = project.project_type === "PET" ? "PET" : "HUMAN";
  const country = String(body.country || "United Kingdom").trim();
  const virtualCity = String(body.virtual_city || "").trim() || null;
  const actualBurialLocation =
    String(body.actual_burial_location || "").trim() || null;
  const meaningfulRestingPlace =
    String(body.meaningful_resting_place || "").trim() || null;
  const sectionName = String(
    body.section_name ||
      (gardenType === "PET" ? "Sunlit Meadow • Row B" : "Oak Grove • Row A")
  ).trim();
  const plotType = body.plot_type === "FAMILY_PLOT" ? "FAMILY_PLOT" : "INDIVIDUAL";
  const familyPlotName =
    plotType === "FAMILY_PLOT"
      ? String(body.family_plot_name || "").trim() || null
      : null;
  const environmentTemplate = String(
    body.environment_template || "European Oak Lawn"
  ).trim();
  const pathwayTemplate = String(
    body.pathway_template || "Stone Paving"
  ).trim();
  const headstoneStyle = String(
    body.headstone_style || "Warm Limestone Arch"
  ).trim();
  const headstoneColor = String(
    body.headstone_color || "Warm Limestone"
  ).trim();
  const inscription = String(
    body.inscription || "Forever remembered with love"
  ).trim();
  const privacyLevel = ["PUBLIC", "UNLISTED", "PRIVATE"].includes(
    body.privacy_level
  )
    ? body.privacy_level
    : "PUBLIC";
  const allowVisits = body.allow_visits === false ? 0 : 1;
  const allowFlowers = body.allow_flowers === false ? 0 : 1;
  const allowMessages = body.allow_messages === false ? 0 : 1;
  const supportFamilyLabel =
    String(body.support_family_label || "").trim() || null;
  const supportFamilyUrl =
    String(body.support_family_url || "").trim() || null;

  if (existing) {
    db.prepare(`
      UPDATE memorial_plots
      SET country = ?, virtual_city = ?, actual_burial_location = ?,
          meaningful_resting_place = ?, section_name = ?, plot_type = ?,
          family_plot_name = ?, environment_template = ?, pathway_template = ?,
          headstone_style = ?, headstone_color = ?, inscription = ?,
          privacy_level = ?, allow_visits = ?, allow_flowers = ?,
          allow_messages = ?, support_family_label = ?, support_family_url = ?
      WHERE id = ?
    `).run(
      country,
      virtualCity,
      actualBurialLocation,
      meaningfulRestingPlace,
      sectionName,
      plotType,
      familyPlotName,
      environmentTemplate,
      pathwayTemplate,
      headstoneStyle,
      headstoneColor,
      inscription,
      privacyLevel,
      allowVisits,
      allowFlowers,
      allowMessages,
      supportFamilyLabel,
      supportFamilyUrl,
      existing.id
    );
    return NextResponse.json({ ok: true, plotId: existing.id, plotReference: existing.plot_reference });
  }

  const plotId = `plt_${crypto.randomBytes(5).toString("hex")}`;
  const code = country.slice(0, 2).toUpperCase();
  const refPrefix = gardenType === "PET" ? "JUK-PET" : `JUK-${code}`;
  const plotReference = `${refPrefix}-${crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;
  const verificationStatus =
    user.role === "FUNERAL_HOME" || user.role === "ADMIN"
      ? "PARTNER_VERIFIED"
      : "APPROVED";

  db.prepare(`
    INSERT INTO memorial_plots (
      id, project_id, garden_type, country, virtual_city,
      actual_burial_location, meaningful_resting_place,
      section_name, plot_reference,
      plot_type, family_plot_name, deceased_name, date_of_birth, date_of_death,
      photo_url, environment_template, pathway_template, headstone_style,
      headstone_color, inscription, verification_status, privacy_level,
      allow_visits, allow_flowers, allow_messages,
      support_family_label, support_family_url, visit_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    plotId,
    projectId,
    gardenType,
    country,
    virtualCity,
    actualBurialLocation,
    meaningfulRestingPlace,
    sectionName,
    plotReference,
    plotType,
    familyPlotName,
    project.deceased_full_name,
    project.date_of_birth,
    project.date_of_passing,
    project.main_photo_url,
    environmentTemplate,
    pathwayTemplate,
    headstoneStyle,
    headstoneColor,
    inscription,
    verificationStatus,
    privacyLevel,
    allowVisits,
    allowFlowers,
    allowMessages,
    supportFamilyLabel,
    supportFamilyUrl,
    new Date().toISOString()
  );

  recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: "MEMORIAL_PLOT_CREATED",
    targetType: "memorial_plot",
    targetId: plotId,
    details: `Ref: ${plotReference}, Country: ${country}, Status: ${verificationStatus}`,
  });

  return NextResponse.json({ ok: true, plotId, plotReference });
}
