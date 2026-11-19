"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FamilyProjectNav } from "@/components/FamilyProjectNav";
import { LegaseeLogo } from "@/components/LegaseeLogo";
import { FILM_DURATION_LABELS, type FilmDurationTier } from "@/lib/types";

const MUSIC_OPTIONS = [
  "Warm Acoustic & Piano",
  "Gentle Strings & Cello",
  "Peaceful Folk Guitar",
  "Classic Choral & Organ (Instrumental)",
  "Family Request (Requires Licensing Review)",
];

export default function FamilyPreferencesPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [durationTier, setDurationTier] =
    useState<FilmDurationTier>("20_TO_30");
  const [musicChoice, setMusicChoice] = useState(MUSIC_OPTIONS[0]);
  const [presentationStyle, setPresentationStyle] = useState("Chronological");
  const [openingTitle, setOpeningTitle] = useState("");
  const [closingTitle, setClosingTitle] = useState("");
  const [includeShorter, setIncludeShorter] = useState(false);
  const [reviewRequired, setReviewRequired] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.project) {
          setDurationTier(d.project.film_duration_tier);
          setMusicChoice(d.project.music_choice || MUSIC_OPTIONS[0]);
          setPresentationStyle(
            d.project.presentation_style || "Chronological"
          );
          setOpeningTitle(d.project.opening_title || "");
          setClosingTitle(d.project.closing_title || "");
          setIncludeShorter(Boolean(d.project.include_shorter_version));
          setReviewRequired(Boolean(d.project.review_required));
        }
      });
  }, [projectId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        film_duration_tier: durationTier,
        music_choice: musicChoice,
        presentation_style: presentationStyle,
        opening_title: openingTitle,
        closing_title: closingTitle,
        include_shorter_version: includeShorter,
        review_required: reviewRequired,
      }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202020]">
      <header className="bg-white border-b border-[#E8E6E0] px-4 sm:px-8 h-16 flex items-center justify-between">
        <LegaseeLogo href="/family/dashboard" size="sm" />
        <Link
          href={`/family/projects/${projectId}`}
          className="text-xs text-[#77746F] hover:text-[#202020]"
        >
          ← Back to Overview
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="font-editorial text-3xl text-[#202020] mb-2">
          Film Preferences
        </h1>
        <p className="text-sm text-[#77746F] mb-6">
          Confirm the length, music, and title cards for your finished memorial
          film.
        </p>

        <FamilyProjectNav projectId={projectId} />

        <form
          onSubmit={handleSave}
          className="bg-white border border-[#E8E6E0] rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div>
            <label className="block text-xs font-medium text-[#77746F] mb-1.5">
              Desired Finished Film Length
            </label>
            <select
              value={durationTier}
              onChange={(e) =>
                setDurationTier(e.target.value as FilmDurationTier)
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
            >
              {(Object.keys(FILM_DURATION_LABELS) as FilmDurationTier[]).map(
                (t) => (
                  <option key={t} value={t}>
                    {FILM_DURATION_LABELS[t]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#77746F] mb-1.5">
              Licensed Music Selection
            </label>
            <select
              value={musicChoice}
              onChange={(e) => setMusicChoice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
            >
              {MUSIC_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {musicChoice.includes("Licensing Review") && (
              <div className="mt-2 p-3.5 rounded-xl bg-[#F8F7F3] border border-[#B68C55]/40 text-xs text-[#202020] leading-relaxed">
                Popular commercial songs require separate publisher and
                record-label licensing, which can be expensive or unavailable.
                We offer a curated library of warm, fully licensed instrumental
                music included in your package, or we can quote custom
                licensing if you’d like us to pursue rights for a specific song.
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#77746F] mb-1.5">
              Presentation Structure
            </label>
            <select
              value={presentationStyle}
              onChange={(e) => setPresentationStyle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
            >
              <option value="Chronological">
                Chronological (childhood through later years)
              </option>
              <option value="Thematic">
                Thematic (family, friendships, passions &amp; milestones)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#77746F] mb-1.5">
              Opening Title Card
            </label>
            <input
              type="text"
              value={openingTitle}
              onChange={(e) => setOpeningTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#77746F] mb-1.5">
              Optional Closing Title
            </label>
            <input
              type="text"
              value={closingTitle}
              onChange={(e) => setClosingTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-[#202020]">
            <input
              type="checkbox"
              checked={includeShorter}
              onChange={(e) => setIncludeShorter(e.target.checked)}
              className="w-4 h-4 accent-[#242424]"
            />
            <span>Also prepare a shorter highlight version (3–5 minutes)</span>
          </label>

          <label className="flex items-center gap-2.5 text-sm text-[#202020]">
            <input
              type="checkbox"
              checked={reviewRequired}
              onChange={(e) => setReviewRequired(e.target.checked)}
              className="w-4 h-4 accent-[#242424]"
            />
            <span>
              Require my manual approval before new contributions enter
              production
            </span>
          </label>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
            >
              Save Preferences
            </button>
            {saved && (
              <span className="text-xs text-[#718875] font-medium">
                Preferences saved.
              </span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
