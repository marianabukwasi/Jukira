"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import type { PricingConfigRecord } from "@/lib/types";

interface LocationPricingCardProps {
  configs: PricingConfigRecord[];
  initialMarket?: string;
  mode?: "family" | "wholesale";
}

function formatAmount(amount: number, currency: string): string {
  if (currency === "UGX") {
    return `UGX ${Math.round(amount).toLocaleString("en-US")}`;
  }
  const sym = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
  return `${sym}${Number(amount).toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

export function LocationPricingCard({
  configs,
  initialMarket = "EU",
  mode = "family",
}: LocationPricingCardProps) {
  const [market, setMarket] = useState(initialMarket);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const lang = navigator.language || "";
      let auto = "EU";
      if (tz.includes("Kampala") || tz.includes("Africa/Nairobi")) {
        auto = "UG";
      } else if (tz.includes("London") || lang === "en-GB") {
        auto = "UK";
      } else if (tz.startsWith("America/") || lang === "en-US") {
        auto = "US";
      }
      if (configs.some((c) => c.country_code === auto)) {
        setMarket(auto);
        const match = configs.find((c) => c.country_code === auto);
        if (match) setDetectedLabel(match.country_name);
      }
    } catch {
      // keep initialMarket
    }
  }, [configs]);

  const active =
    configs.find((c) => c.country_code === market) || configs[0];

  if (!active) return null;

  const tiers = [
    {
      label:
        "Jukira Individual Memorial (Headstone + Garden + Website + 2-Min Video)",
      price: active.website_setup_price ?? 99.99,
    },
    {
      label: "Jukira Films: Short Memorial Film (Up to 10 min)",
      price: active.tier_10,
    },
    {
      label: "Jukira Films: Standard Memorial Film (10–20 min)",
      price: active.tier_20,
    },
    {
      label: "Jukira Films: Extended Memorial Film (20–30 min)",
      price: active.tier_30,
    },
    {
      label: "Jukira Films: Feature Memorial Film (30–45 min)",
      price: active.tier_45,
    },
    {
      label: "Jukira Films: Full Life Documentary (45–60 min)",
      price: active.tier_60,
    },
  ];

  return (
    <div className="bg-white border border-[#E8E6E0] rounded-2xl p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <h2 className="font-editorial text-2xl">
          {mode === "wholesale"
            ? "Wholesale Pricing Structure"
            : "Finished film packages"}
        </h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F7F3] border border-[#E8E6E0]">
          <Globe className="w-3.5 h-3.5 text-[#77746F]" />
          <select
            aria-label="Select pricing location"
            value={market}
            onChange={(e) => {
              setMarket(e.target.value);
              setDetectedLabel(null);
            }}
            className="bg-transparent text-xs font-medium text-[#202020] focus:outline-none"
          >
            {configs.map((c) => (
              <option key={c.country_code} value={c.country_code}>
                {c.country_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-[#77746F] mb-5">
        {detectedLabel
          ? `Showing local pricing for ${detectedLabel}. `
          : `Showing pricing for ${active.country_name}. `}
        {mode === "wholesale"
          ? "Funeral homes are free to set their own retail price or include Jukira within a service package."
          : `Contributors can upload up to ${active.upload_allowance_gb} GB of footage regardless of finished film length.`}
      </p>

      <div className="divide-y divide-[#E8E6E0] text-sm">
        {tiers.map((t) => (
          <div
            key={t.label}
            className="py-3 flex items-center justify-between"
          >
            <span className="text-[#202020]">{t.label}</span>
            <span className="font-medium text-[#202020]">
              {formatAmount(t.price, active.currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-[#E8E6E0] text-xs text-[#77746F] space-y-1">
        <p>
          Annual Memorial Renewal:{" "}
          <strong className="text-[#202020]">
            {formatAmount(active.website_annual_renewal ?? 19.99, active.currency)}
            /year
          </strong>
        </p>
        <p>
          Digital Flowers (Visitor Tributes):{" "}
          <strong className="text-[#202020]">
            {formatAmount(2, active.currency)}
          </strong>{" "}
          per bouquet (30-day display)
        </p>
        <p>
          Optional Raw Footage Download:{" "}
          <strong className="text-[#202020]">
            {formatAmount(active.raw_footage_price, active.currency)}
          </strong>
        </p>
      </div>
    </div>
  );
}
