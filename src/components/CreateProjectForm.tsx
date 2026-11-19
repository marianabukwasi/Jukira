"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FILM_DURATION_LABELS,
  type FilmDurationTier,
  type PricingConfigRecord,
} from "@/lib/types";

interface CreateProjectFormProps {
  defaultOwnerName?: string;
  defaultOwnerEmail?: string;
  pricingConfigs: PricingConfigRecord[];
  redirectPrefix: "/family/projects" | "/partners/projects";
}

export function CreateProjectForm({
  defaultOwnerName = "",
  defaultOwnerEmail = "",
  pricingConfigs,
  redirectPrefix,
}: CreateProjectFormProps) {
  const router = useRouter();
  const [projectType, setProjectType] = useState<"PERSON" | "PET">("PERSON");
  const [deceasedFullName, setDeceasedFullName] = useState("");
  const [deceasedPreferredName, setDeceasedPreferredName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfPassing, setDateOfPassing] = useState("");
  const [filmDurationTier, setFilmDurationTier] =
    useState<FilmDurationTier>("20_TO_30");
  const [ownerName, setOwnerName] = useState(defaultOwnerName);
  const [ownerEmail, setOwnerEmail] = useState(defaultOwnerEmail);
  const [ownerPhone, setOwnerPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [countryMarket, setCountryMarket] = useState(
    pricingConfigs[0]?.country_code || "EU"
  );
  const [closingDate, setClosingDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activePricing =
    pricingConfigs.find((p) => p.country_code === countryMarket) ||
    pricingConfigs[0];

  function formatPrice(amount: number, currency: string) {
    if (currency === "UGX") return `UGX ${Math.round(amount).toLocaleString()}`;
    const sym = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
    return `${sym}${amount}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType,
          deceasedFullName,
          deceasedPreferredName,
          dateOfBirth,
          dateOfPassing,
          filmDurationTier,
          ownerName,
          ownerEmail,
          ownerPhone,
          preferredLanguage,
          countryMarket,
          closingDate: closingDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      router.push(`${redirectPrefix}/${data.projectId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E8E6E0] rounded-2xl p-6 sm:p-8 space-y-6 max-w-2xl"
    >
      {error && (
        <div className="p-3 rounded-xl bg-[#F1EFE9] border border-[#B68C55]/40 text-xs text-[#202020]">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[#77746F] mb-1.5">
          Who is this memorial for?
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F1EFE9]">
          <button
            type="button"
            onClick={() => setProjectType("PERSON")}
            className={`py-2 rounded-lg text-xs font-medium transition-colors ${
              projectType === "PERSON"
                ? "bg-white text-[#202020] shadow-xs"
                : "text-[#77746F]"
            }`}
          >
            A Loved One
          </button>
          <button
            type="button"
            onClick={() => setProjectType("PET")}
            className={`py-2 rounded-lg text-xs font-medium transition-colors ${
              projectType === "PET"
                ? "bg-white text-[#202020] shadow-xs"
                : "text-[#77746F]"
            }`}
          >
            A Beloved Pet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            {projectType === "PET" ? "Pet's Name *" : "Full Name of the Deceased *"}
          </label>
          <input
            type="text"
            required
            value={deceasedFullName}
            onChange={(e) => setDeceasedFullName(e.target.value)}
            placeholder={
              projectType === "PET"
                ? "e.g. Barnaby (Golden Retriever)"
                : "e.g. Margaret Eleanor Vance"
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Preferred Name on Film
          </label>
          <input
            type="text"
            value={deceasedPreferredName}
            onChange={(e) => setDeceasedPreferredName(e.target.value)}
            placeholder="e.g. Margaret"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Date of Birth (optional)
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Date of Passing (optional)
          </label>
          <input
            type="date"
            value={dateOfPassing}
            onChange={(e) => setDateOfPassing(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Country / Pricing Market
          </label>
          <select
            value={countryMarket}
            onChange={(e) => setCountryMarket(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          >
            {pricingConfigs.map((cfg) => (
              <option key={cfg.country_code} value={cfg.country_code}>
                {cfg.country_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Preferred Finished Film Duration
          </label>
          <select
            value={filmDurationTier}
            onChange={(e) =>
              setFilmDurationTier(e.target.value as FilmDurationTier)
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          >
            {(Object.keys(FILM_DURATION_LABELS) as FilmDurationTier[]).map(
              (tier) => {
                const price = activePricing
                  ? tier === "MEMORY_COLLECTION"
                    ? activePricing.tier_collection ?? 35
                    : tier === "PHOTO_SLIDESHOW"
                    ? activePricing.tier_slideshow ?? 55
                    : tier === "UP_TO_10"
                    ? activePricing.tier_10
                    : tier === "10_TO_20"
                    ? activePricing.tier_20
                    : tier === "20_TO_30"
                    ? activePricing.tier_30
                    : tier === "30_TO_45"
                    ? activePricing.tier_45
                    : activePricing.tier_60
                  : 0;
                return (
                  <option key={tier} value={tier}>
                    {FILM_DURATION_LABELS[tier]} (
                    {activePricing
                      ? formatPrice(price, activePricing.currency)
                      : ""}
                    )
                  </option>
                );
              }
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Family Owner Name *
          </label>
          <input
            type="text"
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Owner Email *
          </label>
          <input
            type="email"
            required
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Owner Telephone
          </label>
          <input
            type="tel"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Preferred Language
          </label>
          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          >
            <option>English</option>
            <option>French</option>
            <option>Spanish</option>
            <option>German</option>
            <option>Luganda</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#77746F] mb-1.5">
            Contribution Closing Date (optional)
          </label>
          <input
            type="date"
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-7 py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] disabled:opacity-60"
      >
        {loading ? "Creating Memorial Project..." : "Create Project & Generate Link"}
      </button>
    </form>
  );
}
