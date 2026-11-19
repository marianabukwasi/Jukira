"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { FamilyProjectNav } from "@/components/FamilyProjectNav";
import { LegaseeLogo } from "@/components/LegaseeLogo";
import type {
  MemorialMessageRecord,
  MemorialMilestone,
  MemorialWebsiteRecord,
} from "@/lib/types";

export default function FamilyWebsitePage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [secureToken, setSecureToken] = useState("");
  const [website, setWebsite] = useState<MemorialWebsiteRecord | null>(null);
  const [messages, setMessages] = useState<MemorialMessageRecord[]>([]);
  const [setupPrice, setSetupPrice] = useState(49);
  const [monthlyPrice, setMonthlyPrice] = useState(4.99);
  const [currency, setCurrency] = useState("EUR");

  const [welcome, setWelcome] = useState("");
  const [story, setStory] = useState("");
  const [milestones, setMilestones] = useState<MemorialMilestone[]>([]);
  const [moderationRequired, setModerationRequired] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  const load = useCallback(async () => {
    const [pRes, wRes] = await Promise.all([
      fetch(`/api/projects/${projectId}`),
      fetch(`/api/projects/${projectId}/website`),
    ]);
    if (pRes.ok) {
      const pData = await pRes.json();
      setSecureToken(pData.project?.secure_token || "");
    }
    if (wRes.ok) {
      const wData = await wRes.json();
      setWebsite(wData.website);
      setMessages(wData.messages || []);
      setSetupPrice(wData.setupPrice ?? 49);
      setMonthlyPrice(wData.monthlyHostingPrice ?? 4.99);
      setCurrency(wData.currency || "EUR");
      if (wData.website) {
        setWelcome(wData.website.welcome_message || "");
        setStory(wData.website.life_story || "");
        setModerationRequired(Boolean(wData.website.moderation_required));
        try {
          setMilestones(JSON.parse(wData.website.milestones_json || "[]"));
        } catch {
          setMilestones([]);
        }
      }
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function activateOrRenew() {
    setStatusMsg("");
    const res = await fetch(`/api/projects/${projectId}/website`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (res.ok) {
      setStatusMsg(
        `Memorial website active until ${new Date(
          data.expiresAt
        ).toLocaleDateString("en-GB")} (Invoice ${data.invoiceNumber}).`
      );
      load();
    } else {
      setStatusMsg(data.error || "Unable to activate website.");
    }
  }

  async function saveContent(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg("");
    const res = await fetch(`/api/projects/${projectId}/website`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        welcome_message: welcome,
        life_story: story,
        milestones,
        moderation_required: moderationRequired,
      }),
    });
    if (res.ok) setStatusMsg("Memorial website content saved.");
  }

  async function moderateMessage(
    messageId: string,
    status: "APPROVED" | "HIDDEN"
  ) {
    await fetch(`/api/projects/${projectId}/website`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, status }),
    });
    load();
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

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-editorial text-3xl text-[#202020]">
              Dedicated Memorial Website
            </h1>
            <p className="text-sm text-[#77746F]">
              A private, dedicated online home with their story, milestones,
              gallery, film, and messages.
            </p>
          </div>
          {website?.enabled && secureToken && (
            <Link
              href={`/memorial/${secureToken}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242424] text-white text-xs font-medium self-start"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <FamilyProjectNav projectId={projectId} />

        {statusMsg && (
          <div className="p-4 rounded-xl bg-[#F1EFE9] border border-[#E8E6E0] text-sm text-[#202020]">
            {statusMsg}
          </div>
        )}

        {/* Hosting & Activation Card */}
        <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-editorial text-xl">
                {website?.enabled
                  ? "Website Hosting Active"
                  : `Add Dedicated Memorial Website (${setupPrice} ${currency})`}
              </h2>
              <p className="text-xs text-[#77746F] mt-1">
                {website?.enabled && website.expires_at
                  ? `Active until ${new Date(
                      website.expires_at
                    ).toLocaleDateString(
                      "en-GB"
                    )}. After the initial 6 months free hosting, hosting is ${monthlyPrice} ${currency}/month.`
                  : `Includes 6 months free hosting, then ${monthlyPrice} ${currency}/month.`}
              </p>
            </div>
            <button
              type="button"
              onClick={activateOrRenew}
              className="px-5 py-2 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838]"
            >
              {website?.enabled
                ? `Extend 1 Month (${monthlyPrice} ${currency})`
                : `Activate (${setupPrice} ${currency})`}
            </button>
          </div>
        </section>

        {/* Story & Milestones Editor */}
        {website?.enabled && (
          <>
            <form
              onSubmit={saveContent}
              className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-5"
            >
              <h2 className="font-editorial text-xl">
                Story, Welcome &amp; Milestones
              </h2>

              <div>
                <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                  Welcome Message
                </label>
                <textarea
                  rows={2}
                  value={welcome}
                  onChange={(e) => setWelcome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                  Life Story
                </label>
                <textarea
                  rows={5}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Write about their life, values, passions, and what made them special..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#77746F]">
                    Milestones &amp; Achievements
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setMilestones((prev) => [
                        ...prev,
                        { year: "", title: "", description: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#202020] underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Milestone
                  </button>
                </div>

                {milestones.map((ms, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E8E6E0] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-start"
                  >
                    <input
                      type="text"
                      placeholder="Year"
                      value={ms.year}
                      onChange={(e) =>
                        setMilestones((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, year: e.target.value } : item
                          )
                        )
                      }
                      className="sm:col-span-2 px-2.5 py-2 rounded-lg border border-[#E8E6E0] bg-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Milestone title"
                      value={ms.title}
                      onChange={(e) =>
                        setMilestones((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, title: e.target.value } : item
                          )
                        )
                      }
                      className="sm:col-span-4 px-2.5 py-2 rounded-lg border border-[#E8E6E0] bg-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Short description"
                      value={ms.description}
                      onChange={(e) =>
                        setMilestones((prev) =>
                          prev.map((item, i) =>
                            i === idx
                              ? { ...item, description: e.target.value }
                              : item
                          )
                        )
                      }
                      className="sm:col-span-5 px-2.5 py-2 rounded-lg border border-[#E8E6E0] bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMilestones((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="sm:col-span-1 p-2 text-[#77746F] hover:text-[#202020]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs text-[#202020]">
                <input
                  type="checkbox"
                  checked={moderationRequired}
                  onChange={(e) => setModerationRequired(e.target.checked)}
                  className="w-4 h-4 accent-[#242424]"
                />
                <span>
                  Require family approval before guestbook messages appear
                  publicly
                </span>
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838]"
              >
                Save Memorial Website
              </button>
            </form>

            {/* Messages Moderation */}
            <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
              <h2 className="font-editorial text-xl">
                Messages &amp; Memories ({messages.length})
              </h2>
              {messages.length === 0 ? (
                <p className="text-xs text-[#77746F]">No messages yet.</p>
              ) : (
                <div className="divide-y divide-[#E8E6E0]">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm text-[#202020]">{m.message}</p>
                        <p className="text-xs text-[#77746F] mt-1">
                          {m.author_name} ({m.relationship}) • Status:{" "}
                          <strong>{m.status}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => moderateMessage(m.id, "APPROVED")}
                          className="px-3 py-1 rounded-full border border-[#E8E6E0] text-xs hover:bg-[#F1EFE9]"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => moderateMessage(m.id, "HIDDEN")}
                          className="px-3 py-1 rounded-full border border-[#E8E6E0] text-xs text-[#77746F] hover:bg-[#F1EFE9]"
                        >
                          Hide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
