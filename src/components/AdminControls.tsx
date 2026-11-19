"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PricingConfigRecord } from "@/lib/types";

export function PartnerStatusControls({
  partnerId,
  currentStatus,
}: {
  partnerId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);

  async function update(nextStatus: string) {
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_PARTNER_STATUS",
        partnerId,
        status: nextStatus,
      }),
    });
    if (res.ok) {
      setStatus(nextStatus);
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="px-2.5 py-1 rounded-full bg-[#F1EFE9] text-xs font-medium">
        {status}
      </span>
      {status !== "ACTIVE" && (
        <button
          type="button"
          onClick={() => update("ACTIVE")}
          className="px-3 py-1 rounded-full bg-[#242424] text-white text-xs font-medium"
        >
          Approve
        </button>
      )}
      {status !== "SUSPENDED" && (
        <button
          type="button"
          onClick={() => update("SUSPENDED")}
          className="px-3 py-1 rounded-full border border-[#E8E6E0] text-xs text-[#77746F] hover:text-[#202020]"
        >
          Suspend
        </button>
      )}
    </div>
  );
}

export function PricingConfigEditor({
  config,
}: {
  config: PricingConfigRecord;
}) {
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_PRICING", ...form }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <form
      onSubmit={save}
      className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-editorial text-xl text-[#202020]">
          {form.country_name} ({form.currency})
        </h2>
        {saved && (
          <span className="text-xs text-[#718875] font-medium">Saved</span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        {[
          ["tier_collection", "Collection Only"],
          ["tier_slideshow", "Slideshow"],
          ["tier_10", "Short Film (10m)"],
          ["tier_20", "10–20m"],
          ["tier_30", "20–30m"],
          ["tier_45", "30–45m"],
          ["tier_60", "45–60m"],
          ["raw_footage_price", "Raw Footage"],
          ["website_setup_price", "Website (1yr)"],
          ["website_annual_renewal", "Web Renewal/yr"],
          ["archive_monthly_price", "Archive / mo"],
          ["estimated_production_cost", "Est. Cost"],
          ["upload_allowance_gb", "Upload GB"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block text-[#77746F] mb-1">{label}</label>
            <input
              type="number"
              step="0.01"
              value={form[key as keyof PricingConfigRecord] as number}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  [key]: Number(e.target.value),
                }))
              }
              className="w-full px-2.5 py-2 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3]"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        className="px-5 py-2 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838]"
      >
        Update {form.country_code} Pricing
      </button>
    </form>
  );
}

export function DeleteExpiredArchiveButton({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(false);

  async function handleDelete() {
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_EXPIRED_ARCHIVE", projectId }),
    });
    if (res.ok) {
      setDone(true);
      router.refresh();
    }
  }

  return done ? (
    <span className="text-xs text-[#718875]">Deleted</span>
  ) : (
    <button
      type="button"
      onClick={handleDelete}
      className="px-3 py-1 rounded-full border border-[#E8E6E0] text-xs text-[#202020] hover:bg-[#F1EFE9]"
    >
      Execute Retention Deletion
    </button>
  );
}

export function PartnerWhiteLabelControls({
  partnerId,
  initialEnabled,
  initialName,
  initialMonthlyFee,
}: {
  partnerId: string;
  initialEnabled: boolean;
  initialName: string;
  initialMonthlyFee: number;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [brandName, setBrandName] = useState(initialName);
  const [monthlyFee, setMonthlyFee] = useState(initialMonthlyFee);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_PARTNER_WHITE_LABEL",
        partnerId,
        white_label_enabled: enabled,
        white_label_name: brandName,
        white_label_monthly_fee: monthlyFee,
      }),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={save}
      className="mt-3 pt-3 border-t border-[#E8E6E0] flex flex-wrap items-center gap-3 text-xs"
    >
      <label className="inline-flex items-center gap-1.5 font-medium text-[#202020]">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-3.5 h-3.5 accent-[#242424]"
        />
        <span>White-Label Active</span>
      </label>
      <input
        type="text"
        value={brandName}
        onChange={(e) => setBrandName(e.target.value)}
        placeholder="Display brand (e.g. Aplus Funeral Homes)"
        className="px-2.5 py-1.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] min-w-[220px]"
      />
      <div className="inline-flex items-center gap-1">
        <span className="text-[#77746F]">Monthly fee:</span>
        <input
          type="number"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(Number(e.target.value))}
          className="w-20 px-2 py-1.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3]"
        />
      </div>
      <button
        type="submit"
        className="px-3.5 py-1.5 rounded-full bg-[#242424] text-white font-medium"
      >
        Save Branding
      </button>
      {saved && <span className="text-[#718875]">Saved</span>}
    </form>
  );
}
