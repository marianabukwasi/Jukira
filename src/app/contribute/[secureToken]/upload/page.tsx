"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { LegaseeLogo } from "@/components/LegaseeLogo";
import type { EnhancementPreference, RelationshipType } from "@/lib/types";

interface QueuedFile {
  localId: string;
  file: File;
  isVideo: boolean;
  caption: string;
  eventDate: string;
  eventLocation: string;
  enhancement: EnhancementPreference;
  progress: number;
  status: "ready" | "uploading" | "done" | "error";
  error?: string;
}

const RELATIONSHIPS: RelationshipType[] = [
  "Family member",
  "Friend",
  "Colleague",
  "Neighbour",
  "Other",
];

export default function ContributeUploadPage() {
  const params = useParams<{ secureToken: string }>();
  const router = useRouter();
  const secureToken = params.secureToken;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [preferredName, setPreferredName] = useState("your loved one");
  const [whiteLabelBrand, setWhiteLabelBrand] = useState<string | null>(null);
  const [contributorName, setContributorName] = useState("");
  const [relationship, setRelationship] =
    useState<RelationshipType>("Family member");
  const [relationshipCustom, setRelationshipCustom] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    const ownerParam = new URLSearchParams(window.location.search).get("owner");
    if (ownerParam) setContributorName(ownerParam);

    fetch(`/api/contribute/${secureToken}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.project?.deceased_preferred_name) {
          setPreferredName(d.project.deceased_preferred_name);
        }
        if (d.project?.white_label_enabled) {
          setWhiteLabelBrand(
            d.project.white_label_name || d.project.partner_business_name || null
          );
        }
      })
      .catch(() => {});
  }, [secureToken]);

  function handleFileSelect(selected: FileList | null) {
    if (!selected) return;
    const next: QueuedFile[] = [];
    for (let i = 0; i < selected.length; i++) {
      const f = selected[i];
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      const isVideo =
        f.type.startsWith("video/") ||
        ["mp4", "mov", "m4v", "webm", "avi"].includes(ext);
      next.push({
        localId: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        file: f,
        isVideo,
        caption: "",
        eventDate: "",
        eventLocation: "",
        enhancement: "KEEP_ORIGINAL",
        progress: 0,
        status: "ready",
      });
    }
    setFiles((prev) => [...prev, ...next]);
  }

  function updateFile(localId: string, patch: Partial<QueuedFile>) {
    setFiles((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, ...patch } : item
      )
    );
  }

  function removeFile(localId: string) {
    setFiles((prev) => prev.filter((item) => item.localId !== localId));
  }

  function uploadSingleFile(
    item: QueuedFile,
    contributorId: string | null,
    onProgress: (loaded: number, total: number) => void
  ): Promise<{ contributorId: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/contribute/${secureToken}/upload`);

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const pct = Math.round((ev.loaded / ev.total) * 100);
          updateFile(item.localId, { progress: pct, status: "uploading" });
          onProgress(ev.loaded, ev.total);
        }
      };

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            updateFile(item.localId, { progress: 100, status: "done" });
            resolve({ contributorId: res.contributorId });
          } else {
            updateFile(item.localId, {
              status: "error",
              error: res.error || "Upload failed",
            });
            reject(new Error(res.error || "Upload failed"));
          }
        } catch {
          updateFile(item.localId, {
            status: "error",
            error: "Unexpected server response",
          });
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => {
        updateFile(item.localId, {
          status: "error",
          error: "Connection interrupted. Tap retry.",
        });
        reject(new Error("Network error"));
      };

      const form = new FormData();
      form.append("contributorName", contributorName);
      form.append("relationship", relationship);
      form.append("relationshipCustom", relationshipCustom);
      form.append("contactInfo", contactInfo);
      form.append("acceptedTerms", String(acceptedTerms));
      form.append("termsVersion", "v1.0-2026");
      if (contributorId) form.append("contributorId", contributorId);
      form.append("files", item.file);
      form.append("captions", item.caption);
      form.append("eventDates", item.eventDate);
      form.append("eventLocations", item.eventLocation);
      form.append("enhancements", item.enhancement);

      xhr.send(form);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError("");

    if (!contributorName.trim()) {
      setGlobalError("Please enter your full name.");
      return;
    }
    if (files.length === 0) {
      setGlobalError("Please add at least one photograph or video.");
      return;
    }
    if (!acceptedTerms) {
      setGlobalError(
        "Please confirm the submission agreement before sending your memories."
      );
      return;
    }

    setSubmitting(true);
    const pendingFiles = files.filter((f) => f.status !== "done");
    const totalBytes = pendingFiles.reduce((acc, f) => acc + f.file.size, 0);
    let completedBytes = 0;
    const startTime = Date.now();
    let contributorId: string | null = null;
    let uploadedSummaryCount = files.filter((f) => f.status === "done").length;

    for (const item of pendingFiles) {
      try {
        const res = await uploadSingleFile(
          item,
          contributorId,
          (loaded) => {
            const totalLoaded = completedBytes + loaded;
            const pct =
              totalBytes > 0
                ? Math.min(100, Math.round((totalLoaded / totalBytes) * 100))
                : 100;
            setOverallProgress(pct);
            const elapsedSec = (Date.now() - startTime) / 1000;
            if (elapsedSec > 0.5 && totalLoaded > 0) {
              const rate = totalLoaded / elapsedSec;
              const remaining = Math.max(0, totalBytes - totalLoaded);
              setEtaSeconds(Math.ceil(remaining / rate));
            }
          }
        );
        contributorId = res.contributorId;
        completedBytes += item.file.size;
        uploadedSummaryCount += 1;
      } catch {
        setGlobalError(
          "One or more files were interrupted. You can retry failed files below."
        );
        setSubmitting(false);
        return;
      }
    }

    setOverallProgress(100);
    setEtaSeconds(0);
    router.push(
      `/contribute/${secureToken}/confirmation?count=${uploadedSummaryCount}&name=${encodeURIComponent(
        contributorName
      )}`
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202020] flex flex-col">
      <header className="border-b border-[#E8E6E0] bg-[#F8F7F3] px-5 py-4 flex items-center justify-between max-w-3xl w-full mx-auto">
        {whiteLabelBrand ? (
          <Link
            href={`/contribute/${secureToken}`}
            className="font-editorial text-lg font-medium text-[#202020]"
          >
            {whiteLabelBrand}
          </Link>
        ) : (
          <LegaseeLogo href={`/contribute/${secureToken}`} size="sm" />
        )}
        <span className="text-xs text-[#77746F]">
          For {preferredName}
        </span>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-2xl w-full mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Contributor details */}
          <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
            <h1 className="font-editorial text-2xl text-[#202020]">
              Your details
            </h1>
            <div>
              <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E6E0] bg-[#F8F7F3] text-base focus:outline-none focus:border-[#242424]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                How did you know {preferredName}? *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RELATIONSHIPS.map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setRelationship(rel)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors ${
                      relationship === rel
                        ? "bg-[#242424] text-white border-[#242424]"
                        : "bg-[#F8F7F3] text-[#202020] border-[#E8E6E0]"
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                Optional description (e.g. &ldquo;Cousin&rdquo; or &ldquo;College roommate&rdquo;)
              </label>
              <input
                type="text"
                value={relationshipCustom}
                onChange={(e) => setRelationshipCustom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                Email for confirmation receipt (optional)
              </label>
              <input
                type="email"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
              />
            </div>
          </section>

          {/* Step 2: Upload area */}
          <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-editorial text-2xl text-[#202020]">
                Add your photographs and videos
              </h2>
              <p className="text-sm text-[#77746F] mt-1">
                Share moments from any stage of {preferredName}&rsquo;s life. You
                can upload more than one photograph or video. No trimming or
                editing needed.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-10 px-4 rounded-2xl border-2 border-dashed border-[#B6A995] bg-[#F8F7F3] hover:bg-[#F1EFE9] transition-colors flex flex-col items-center justify-center gap-2 text-center"
            >
              <UploadCloud className="w-8 h-8 text-[#242424]" />
              <span className="text-base font-medium text-[#202020]">
                Select photos &amp; videos from your device
              </span>
              <span className="text-xs text-[#77746F]">
                Works with your phone camera roll, iCloud, or computer files
              </span>
            </button>

            {/* Queued files */}
            {files.length > 0 && (
              <div className="space-y-4 pt-2">
                {files.map((item) => (
                  <div
                    key={item.localId}
                    className="p-4 rounded-xl border border-[#E8E6E0] bg-[#F8F7F3] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.isVideo ? (
                          <Film className="w-5 h-5 text-[#B6A995] shrink-0" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-[#B6A995] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#202020] truncate">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-[#77746F]">
                            {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                      </div>

                      {item.status === "done" ? (
                        <CheckCircle2 className="w-5 h-5 text-[#718875] shrink-0" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeFile(item.localId)}
                          aria-label="Remove file"
                          className="p-1.5 text-[#77746F] hover:text-[#202020]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Progress bar */}
                    {(item.status === "uploading" || item.status === "done") && (
                      <div className="w-full h-1.5 rounded-full bg-[#E8E6E0] overflow-hidden">
                        <div
                          className="h-full bg-[#718875] transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}

                    {item.status === "error" && (
                      <div className="flex items-center justify-between text-xs text-[#B68C55]">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {item.error}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateFile(item.localId, {
                              status: "ready",
                              progress: 0,
                            })
                          }
                          className="inline-flex items-center gap-1 font-medium underline"
                        >
                          <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                      </div>
                    )}

                    {/* Description, When, and Where */}
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-medium text-[#77746F] mb-1">
                          Description of this photograph or video (optional)
                        </label>
                        <input
                          type="text"
                          placeholder='e.g. "Laughing together after Sunday lunch"'
                          value={item.caption}
                          onChange={(e) =>
                            updateFile(item.localId, { caption: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#E8E6E0] bg-white text-xs focus:outline-none focus:border-[#242424]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-[#77746F] mb-1">
                            When it happened (optional)
                          </label>
                          <input
                            type="text"
                            placeholder='e.g. "Summer 1985" or "2012"'
                            value={item.eventDate}
                            onChange={(e) =>
                              updateFile(item.localId, {
                                eventDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-[#E8E6E0] bg-white text-xs focus:outline-none focus:border-[#242424]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#77746F] mb-1">
                            Where it happened (optional)
                          </label>
                          <input
                            type="text"
                            placeholder='e.g. "Devon, UK" or "Grandmother’s garden"'
                            value={item.eventLocation}
                            onChange={(e) =>
                              updateFile(item.localId, {
                                eventLocation: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-[#E8E6E0] bg-white text-xs focus:outline-none focus:border-[#242424]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Video enhancement preference */}
                    {item.isVideo && (
                      <div className="pt-1">
                        <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                          Video enhancement preference (original is always kept)
                        </label>
                        <select
                          value={item.enhancement}
                          onChange={(e) =>
                            updateFile(item.localId, {
                              enhancement: e.target
                                .value as EnhancementPreference,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#E8E6E0] bg-white text-xs focus:outline-none focus:border-[#242424]"
                        >
                          <option value="KEEP_ORIGINAL">
                            Keep original, Use uploaded footage without enhancement
                          </option>
                          <option value="STANDARD_CORRECTION">
                            Standard correction, Brightness, contrast, colour &amp; audio balance
                          </option>
                          <option value="AI_ENHANCEMENT">
                            AI enhancement, Clarity &amp; noise improvement without altering faces
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Step 3: Submission Agreement */}
          <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#242424]"
              />
              <span className="text-xs sm:text-sm text-[#77746F] leading-relaxed">
                I confirm that I have the right or permission to submit these
                photographs and videos, authorise Jukira to use them to produce
                the memorial film, understand they may be edited and arranged,
                and understand the family or authorised project owner may
                receive the finished film.{" "}
                <Link
                  href="/terms#contributor-terms"
                  target="_blank"
                  className="underline text-[#202020]"
                >
                  Read contributor terms
                </Link>
                .
              </span>
            </label>

            {globalError && (
              <div className="p-3 rounded-xl bg-[#F1EFE9] border border-[#B68C55]/40 text-xs text-[#202020]">
                {globalError}
              </div>
            )}

            {submitting && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#77746F]">
                  <span>Uploading memories... {overallProgress}%</span>
                  {etaSeconds !== null && etaSeconds > 0 && (
                    <span>About {etaSeconds}s remaining</span>
                  )}
                </div>
                <div className="w-full h-2 rounded-full bg-[#E8E6E0] overflow-hidden">
                  <div
                    className="h-full bg-[#242424] transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-full bg-[#242424] text-white text-base font-medium hover:bg-[#383838] disabled:opacity-60 transition-colors"
            >
              {submitting ? "Sending your memories..." : "Submit Memories"}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}
