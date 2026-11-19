"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Footprints, Globe, Search, SkipForward, Trees } from "lucide-react";
import { HeadstoneCard } from "./HeadstoneCard";
import type { DigitalFlowerRecord, MemorialPlotRecord } from "@/lib/types";

interface PlotWithMeta extends MemorialPlotRecord {
  secure_token?: string | null;
  flowers?: DigitalFlowerRecord[];
}

const COUNTRIES = [
  "ALL",
  "United Kingdom",
  "Uganda",
  "United States",
  "France",
  "Germany",
  "Canada",
  "Kenya",
  "South Africa",
];

export function CemeteryGrounds({
  initialPlots,
  defaultGardenType = "HUMAN",
}: {
  initialPlots: PlotWithMeta[];
  defaultGardenType?: "HUMAN" | "PET";
}) {
  const router = useRouter();
  const [gardenType, setGardenType] = useState<"HUMAN" | "PET">(
    defaultGardenType
  );
  const [country, setCountry] = useState("ALL");
  const [query, setQuery] = useState("");
  const [walkingPlot, setWalkingPlot] = useState<PlotWithMeta | null>(null);
  const [walkStep, setWalkStep] = useState(0);

  const filtered = initialPlots.filter((p) => {
    if (p.garden_type !== gardenType) return false;
    if (country !== "ALL" && p.country !== country) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        p.deceased_name.toLowerCase().includes(q) ||
        p.plot_reference.toLowerCase().includes(q) ||
        (p.family_plot_name || "").toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Gentle virtual walk progression
  useEffect(() => {
    if (!walkingPlot) return;
    if (walkStep >= 3) {
      const dest = walkingPlot.secure_token
        ? `/memorial/${walkingPlot.secure_token}`
        : null;
      const t = setTimeout(() => {
        if (dest) router.push(dest);
        else setWalkingPlot(null);
      }, 900);
      return () => clearTimeout(t);
    }
    const timer = setTimeout(() => setWalkStep((s) => s + 1), 1300);
    return () => clearTimeout(timer);
  }, [walkingPlot, walkStep, router]);

  function startWalk(plot: PlotWithMeta) {
    setWalkStep(0);
    setWalkingPlot(plot);
  }

  const walkStages = walkingPlot
    ? [
        `Entering ${
          gardenType === "PET"
            ? "Jukira Pet Memorial Garden"
            : "Jukira Memorial Gardens"
        } (${walkingPlot.country})...`,
        `Walking along ${walkingPlot.pathway_template} through ${walkingPlot.environment_template}...`,
        `Passing ${walkingPlot.section_name}...`,
        `Arriving at ${walkingPlot.deceased_name} (${walkingPlot.plot_reference})`,
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Garden Switch & Filters */}
      <div className="bg-white border border-[#E8E6E0] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-full bg-[#F1EFE9]">
            <button
              type="button"
              onClick={() => setGardenType("HUMAN")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                gardenType === "HUMAN"
                  ? "bg-[#242424] text-white"
                  : "text-[#77746F] hover:text-[#202020]"
              }`}
            >
              Jukira Memorial Gardens
            </button>
            <button
              type="button"
              onClick={() => setGardenType("PET")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                gardenType === "PET"
                  ? "bg-[#242424] text-white"
                  : "text-[#77746F] hover:text-[#202020]"
              }`}
            >
              Jukira Pet Memorial Garden
            </button>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#E8E6E0] bg-[#F8F7F3] text-xs">
            <Globe className="w-3.5 h-3.5 text-[#77746F]" />
            <select
              aria-label="Choose country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-transparent font-medium text-[#202020] focus:outline-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Countries" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#77746F] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Locate a grave by name, plot reference (e.g. JUK-UK-A014), or family plot..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
          />
        </div>
      </div>

      {/* Virtual Walk Overlay */}
      {walkingPlot && (
        <div className="bg-[#EFECE4] border border-[#B6A995] rounded-2xl p-8 text-center space-y-5">
          <Trees className="w-8 h-8 text-[#718875] mx-auto" />
          <p className="text-xs uppercase tracking-[0.2em] text-[#77746F]">
            Cemetery Pathway Walk
          </p>
          <h3 className="font-editorial text-2xl text-[#202020]">
            {walkStages[walkStep]}
          </h3>
          <div className="max-w-md mx-auto h-2 rounded-full bg-white overflow-hidden">
            <div
              className="h-full bg-[#718875] transition-all duration-700"
              style={{ width: `${((walkStep + 1) / 4) * 100}%` }}
            />
          </div>
          <div className="flex justify-center gap-3">
            {walkingPlot.secure_token && (
              <button
                type="button"
                onClick={() => router.push(`/memorial/${walkingPlot.secure_token}`)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#242424] text-white text-xs font-medium"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip Walk — Go Directly to Grave</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setWalkingPlot(null)}
              className="px-4 py-2 rounded-full border border-[#E8E6E0] bg-white text-xs text-[#77746F]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Landscaped Grounds Layout */}
      <div className="rounded-3xl border border-[#D8D3C6] bg-gradient-to-b from-[#EDF0EA] via-[#F4F3EE] to-[#EAE7DF] p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8D3C6] pb-4">
          <div className="flex items-center gap-2 text-xs text-[#718875] font-medium">
            <Trees className="w-4 h-4" />
            <span>
              {gardenType === "PET"
                ? "Jukira Pet Memorial Garden — Sunlit Meadow & Willow Walk"
                : "Jukira Memorial Gardens — Landscaped Lawns & Stone Walkways"}
            </span>
          </div>
          <span className="text-xs text-[#77746F]">
            {filtered.length}{" "}
            {filtered.length === 1 ? "resting place" : "resting places"} shown
          </span>
        </div>

        {/* Paved Pathway Strip */}
        <div className="h-3 rounded-full bg-[#DED9CE] border border-[#CFC9BC] flex items-center justify-around px-4">
          <span className="w-12 h-0.5 bg-[#B6A995]/50 rounded-full" />
          <span className="w-12 h-0.5 bg-[#B6A995]/50 rounded-full" />
          <span className="w-12 h-0.5 bg-[#B6A995]/50 rounded-full" />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white/90 border border-[#E8E6E0] rounded-2xl p-10 text-center text-sm text-[#77746F]">
            No resting places found in this country or search filter yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((plot) => (
              <div key={plot.id} className="space-y-3">
                <HeadstoneCard
                  plot={plot}
                  flowers={plot.flowers || []}
                  href={
                    plot.secure_token
                      ? `/memorial/${plot.secure_token}`
                      : undefined
                  }
                  compact
                />
                <div className="flex items-center justify-center gap-2">
                  {plot.secure_token && (
                    <>
                      <button
                        type="button"
                        onClick={() => startWalk(plot)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F8F7F3]"
                      >
                        <Footprints className="w-3.5 h-3.5 text-[#718875]" />
                        <span>Walk to Grave</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/memorial/${plot.secure_token}`)
                        }
                        className="px-3.5 py-1.5 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838]"
                      >
                        Visit Directly
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
