"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, CheckCheck, X } from "lucide-react";
import { FamilyProjectNav } from "@/components/FamilyProjectNav";
import { LegaseeLogo } from "@/components/LegaseeLogo";

interface MediaItem {
  id: string;
  file_type: "IMAGE" | "VIDEO";
  original_filename: string;
  caption: string | null;
  event_date: string | null;
  event_location: string | null;
  enhancement_preference: string;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  contributor_id: string;
  contributor_name: string;
  contributor_relationship: string;
}

export default function FamilyContributionsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [projectName, setProjectName] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "IMAGE" | "VIDEO">(
    "ALL"
  );
  const [filterContributor, setFilterContributor] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setProjectName(data.project?.deceased_full_name || "");
      setMedia(data.media || []);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function approveAll() {
    await fetch(`/api/projects/${projectId}/media`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "APPROVE_ALL" }),
    });
    loadData();
  }

  async function updateApproval(
    mediaId: string,
    approval_status: "APPROVED" | "REJECTED"
  ) {
    await fetch(`/api/projects/${projectId}/media`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId, approval_status }),
    });
    setMedia((prev) =>
      prev.map((m) => (m.id === mediaId ? { ...m, approval_status } : m))
    );
  }

  const contributors = Array.from(
    new Map(
      media.map((m) => [m.contributor_id, m.contributor_name])
    ).entries()
  );

  const filtered = media.filter((m) => {
    if (filterType !== "ALL" && m.file_type !== filterType) return false;
    if (
      filterContributor !== "ALL" &&
      m.contributor_id !== filterContributor
    )
      return false;
    return true;
  });

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

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-editorial text-3xl text-[#202020]">
              {projectName || "Contributions"}
            </h1>
            <p className="text-sm text-[#77746F]">
              Review photographs and videos shared by family and friends.
            </p>
          </div>
          <button
            type="button"
            onClick={approveAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838] self-start"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Approve All Contributions</span>
          </button>
        </div>

        <FamilyProjectNav projectId={projectId} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "ALL" | "IMAGE" | "VIDEO")
            }
            className="px-3.5 py-2 rounded-full border border-[#E8E6E0] bg-white text-xs"
          >
            <option value="ALL">All media types</option>
            <option value="IMAGE">Photographs only</option>
            <option value="VIDEO">Videos only</option>
          </select>

          <select
            value={filterContributor}
            onChange={(e) => setFilterContributor(e.target.value)}
            className="px-3.5 py-2 rounded-full border border-[#E8E6E0] bg-white text-xs"
          >
            <option value="ALL">All contributors</option>
            {contributors.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-[#77746F]">Loading contributions...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#E8E6E0] rounded-2xl p-10 text-center text-sm text-[#77746F]">
            No contributions match your current filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-[#F1EFE9] relative">
                  {item.file_type === "VIDEO" ? (
                    <video
                      src={`/api/media/${item.id}/file`}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`/api/media/${item.id}/file`}
                      alt={item.caption || item.original_filename}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      item.approval_status === "APPROVED"
                        ? "bg-[#718875] text-white"
                        : item.approval_status === "REJECTED"
                        ? "bg-[#242424] text-white"
                        : "bg-white/90 text-[#202020]"
                    }`}
                  >
                    {item.approval_status}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#202020]">
                      {item.contributor_name}{" "}
                      <span className="text-xs font-normal text-[#77746F]">
                        ({item.contributor_relationship})
                      </span>
                    </p>
                    {item.caption && (
                      <p className="text-xs text-[#202020] mt-1">
                        {item.caption}
                      </p>
                    )}
                    {(item.event_date || item.event_location) && (
                      <p className="text-[11px] text-[#77746F] mt-0.5">
                        {[
                          item.event_date ? `When: ${item.event_date}` : null,
                          item.event_location
                            ? `Where: ${item.event_location}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E8E6E0] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateApproval(item.id, "APPROVED")}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#E8E6E0] text-xs font-medium hover:bg-[#F1EFE9]"
                    >
                      <Check className="w-3.5 h-3.5 text-[#718875]" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateApproval(item.id, "REJECTED")}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#E8E6E0] text-xs font-medium hover:bg-[#F1EFE9]"
                    >
                      <X className="w-3.5 h-3.5 text-[#B68C55]" />
                      <span>Exclude</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
