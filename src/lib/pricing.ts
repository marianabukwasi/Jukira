import { getDb } from "./db";
import type { FilmDurationTier, PricingConfigRecord } from "./types";

export function getAllPricingConfigs(): PricingConfigRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM pricing_configs ORDER BY country_name ASC")
    .all() as unknown as PricingConfigRecord[];
  return rows.map((r) => ({ ...r }));
}

export function getPricingByMarket(countryCode: string): PricingConfigRecord {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM pricing_configs WHERE country_code = ?")
    .get(countryCode) as unknown as PricingConfigRecord | undefined;

  if (row) return { ...row };

  const fallback = db
    .prepare("SELECT * FROM pricing_configs WHERE country_code = 'EU'")
    .get() as unknown as PricingConfigRecord | undefined;

  if (fallback) return { ...fallback };

  return {
    id: "prc_eu",
    country_code: "EU",
    country_name: "Europe (EUR)",
    currency: "EUR",
    tier_collection: 35,
    tier_slideshow: 55,
    tier_10: 79,
    tier_20: 149,
    tier_30: 199,
    tier_45: 249,
    tier_60: 299,
    raw_footage_price: 15,
    archive_monthly_price: 4.99,
    website_setup_price: 49,
    website_annual_renewal: 4.99,
    estimated_production_cost: 12,
    upload_allowance_gb: 25,
    updated_at: new Date().toISOString(),
  };
}

export function getTierPrice(
  config: PricingConfigRecord,
  tier: FilmDurationTier
): number {
  switch (tier) {
    case "MEMORY_COLLECTION":
      return config.tier_collection ?? 35;
    case "PHOTO_SLIDESHOW":
      return config.tier_slideshow ?? 55;
    case "UP_TO_10":
      return config.tier_10;
    case "10_TO_20":
      return config.tier_20;
    case "20_TO_30":
      return config.tier_30;
    case "30_TO_45":
      return config.tier_45;
    case "45_TO_60":
      return config.tier_60;
    default:
      return config.tier_20;
  }
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === "UGX") {
    return `UGX ${Math.round(amount).toLocaleString("en-US")}`;
  }
  const symbolMap: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
  };
  const sym = symbolMap[currency] || `${currency} `;
  return `${sym}${Number(amount).toFixed(amount % 1 === 0 ? 0 : 2)}`;
}
