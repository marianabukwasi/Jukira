"use client";

import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";

interface CompileClip {
  order: number;
  mediaId: string;
  fileType: "IMAGE" | "VIDEO";
  url: string;
  filename: string;
  caption: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  contributor: string;
  enhancement: string;
  durationMs: number;
}

interface CompilePlan {
  openingTitle: string;
  closingTitle: string;
  datesLine: string;
  presentationStyle: string;
  duplicatesSkipped: string[];
  clips: CompileClip[];
}

export function AiFilmCompiler({
  projectId,
  onCompiled,
}: {
  projectId: string;
  onCompiled: () => void;
}) {
  const [plan, setPlan] = useState<CompilePlan | null>(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  async function generatePlan() {
    setBusy(true);
    setStatus("Analyzing memories, dates, locations, and duplicates...");
    try {
      const res = await fetch(`/api/projects/${projectId}/ai-compile`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to build AI plan");
      setPlan(data.plan);
      setStatus(
        `AI sequence ready: ${data.plan.clips.length} clips ordered (${data.plan.presentationStyle}).`
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error planning film.");
    } finally {
      setBusy(false);
    }
  }

  async function renderAndUploadCompilation() {
    if (!plan || plan.clips.length === 0) return;
    setBusy(true);
    setProgress(5);
    setStatus("Rendering AI-enhanced memorial film compilation...");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");

      const stream = canvas.captureStream(24);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const stopped = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
      });

      recorder.start();

      // Helper to draw title card
      const drawTitleCard = async (
        title: string,
        subtitle: string,
        ms: number
      ) => {
        const frames = Math.max(12, Math.floor((ms / 1000) * 12));
        for (let f = 0; f < frames; f++) {
          ctx.filter = "none";
          ctx.fillStyle = "#F8F7F3";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = "#202020";
          ctx.font = "500 44px Georgia, serif";
          ctx.textAlign = "center";
          ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 12, 1100);

          if (subtitle) {
            ctx.fillStyle = "#77746F";
            ctx.font = "400 22px Inter, sans-serif";
            ctx.fillText(
              subtitle,
              canvas.width / 2,
              canvas.height / 2 + 40,
              1000
            );
          }
          await new Promise((r) => setTimeout(r, 80));
        }
      };

      await drawTitleCard(plan.openingTitle, plan.datesLine, 2200);

      for (let i = 0; i < plan.clips.length; i++) {
        const clip = plan.clips[i];
        setProgress(Math.round(((i + 1) / (plan.clips.length + 1)) * 85));

        if (clip.fileType === "IMAGE") {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
            img.src = clip.url;
          });

          if (img.width > 0) {
            const frames = 24;
            for (let f = 0; f < frames; f++) {
              ctx.filter = "none";
              ctx.fillStyle = "#F1EFE9";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Apply enhancement preference
              if (clip.enhancement === "STANDARD_CORRECTION") {
                ctx.filter = "brightness(1.06) contrast(1.07) saturate(1.05)";
              } else if (clip.enhancement === "AI_ENHANCEMENT") {
                ctx.filter = "brightness(1.05) contrast(1.12) saturate(1.10)";
              } else {
                ctx.filter = "none";
              }

              const scale = 1 + (f / frames) * 0.04;
              const ratio = Math.max(
                canvas.width / img.width,
                canvas.height / img.height
              );
              const dw = img.width * ratio * scale;
              const dh = img.height * ratio * scale;
              const dx = (canvas.width - dw) / 2;
              const dy = (canvas.height - dh) / 2;
              ctx.drawImage(img, dx, dy, dw, dh);

              ctx.filter = "none";
              if (clip.caption || clip.eventDate || clip.eventLocation) {
                ctx.fillStyle = "rgba(32, 32, 32, 0.58)";
                ctx.fillRect(0, canvas.height - 96, canvas.width, 96);
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = "left";
                ctx.font = "500 24px Georgia, serif";
                ctx.fillText(
                  clip.caption || clip.filename,
                  48,
                  canvas.height - 50,
                  1180
                );
                const meta = [clip.eventDate, clip.eventLocation, clip.contributor]
                  .filter(Boolean)
                  .join(" • ");
                ctx.fillStyle = "#E8E6E0";
                ctx.font = "400 15px Inter, sans-serif";
                ctx.fillText(meta, 48, canvas.height - 22, 1180);
              }
              await new Promise((r) => setTimeout(r, 95));
            }
          }
        }
      }

      await drawTitleCard(plan.closingTitle, "Preserved with Jukira", 1800);

      recorder.stop();
      const blob = await stopped;
      setProgress(92);
      setStatus("Uploading AI-compiled film for Human Quality Review...");

      const form = new FormData();
      form.append(
        "filmFile",
        new File([blob], `jukira-ai-compiled-${projectId}.webm`, {
          type: mimeType,
        })
      );
      form.append("kind", "film");

      const uploadRes = await fetch(`/api/projects/${projectId}/film`, {
        method: "POST",
        body: form,
      });
      if (!uploadRes.ok) throw new Error("Failed to save compiled film.");

      setProgress(100);
      setStatus(
        "AI compilation complete and uploaded! Please complete the Human Quality Review checklist below before delivering to the family."
      );
      onCompiled();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Compilation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B6A995]" />
            <h2 className="font-editorial text-xl text-[#202020]">
              AI-Assisted Editing &amp; Video Compilation
            </h2>
          </div>
          <p className="text-xs text-[#77746F] mt-1">
            Automatically organises approved memories, removes duplicates,
            applies requested enhancements, and compiles a draft film for human
            quality review.
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={generatePlan}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#242424] text-xs font-medium text-[#202020] hover:bg-[#F1EFE9] disabled:opacity-50 self-start"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Analyse &amp; Sequence Media</span>
        </button>
      </div>

      {status && (
        <div className="p-3 rounded-xl bg-[#F8F7F3] border border-[#E8E6E0] text-xs text-[#202020]">
          {status}
        </div>
      )}

      {progress > 0 && progress < 100 && (
        <div className="w-full h-2 rounded-full bg-[#E8E6E0] overflow-hidden">
          <div
            className="h-full bg-[#718875] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {plan && (
        <div className="space-y-4 pt-2">
          {plan.duplicatesSkipped.length > 0 && (
            <p className="text-xs text-[#B68C55]">
              Skipped {plan.duplicatesSkipped.length} duplicate file(s):{" "}
              {plan.duplicatesSkipped.join(", ")}
            </p>
          )}

          <div className="max-h-48 overflow-y-auto divide-y divide-[#E8E6E0] border border-[#E8E6E0] rounded-xl text-xs">
            {plan.clips.map((c) => (
              <div
                key={c.mediaId}
                className="px-3.5 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#202020] truncate">
                    {c.order}. {c.caption || c.filename}
                  </p>
                  <p className="text-[#77746F] truncate">
                    {[c.eventDate, c.eventLocation, c.contributor]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#F1EFE9] text-[10px] shrink-0">
                  {c.enhancement}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={busy || plan.clips.length === 0}
            onClick={renderAndUploadCompilation}
            className="px-5 py-2.5 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838] disabled:opacity-50"
          >
            {busy ? "Compiling Video..." : "Render & Upload AI Compilation"}
          </button>
        </div>
      )}
    </section>
  );
}
