"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, Upload } from "lucide-react";
import { LegaseeLogo } from "@/components/LegaseeLogo";
import { AiFilmCompiler } from "@/components/AiFilmCompiler";
import {
  PROJECT_STATUS_STEPS,
  type ProductionJobRecord,
  type ProjectRecord,
  type ProjectStatus,
} from "@/lib/types";

interface AdminMediaRow {
  id: string;
  file_type: string;
  original_filename: string;
  file_size: number;
  caption: string | null;
  event_date: string | null;
  event_location: string | null;
  enhancement_preference: string;
  approval_status: string;
  contributor_name: string;
}

const QC_ITEMS: { key: string; label: string }[] = [
  { key: "correctPerson", label: "The correct person is represented" },
  { key: "sensibleSequence", label: "The film follows a sensible sequence" },
  {
    key: "noInappropriateMaterial",
    label: "No inappropriate or irrelevant material is included",
  },
  { key: "smoothTransitions", label: "Transitions are smooth" },
  { key: "musicAppropriate", label: "Music is appropriate and licensed" },
  { key: "audioAcceptable", label: "Audio is acceptable and normalised" },
  { key: "imagesNotDistorted", label: "Images are not unintentionally distorted" },
  { key: "titlesCorrect", label: "Opening and closing titles are correct" },
  { key: "durationMatches", label: "Film duration matches the package" },
  { key: "exportPlaysCorrectly", label: "Final MP4 export plays correctly" },
];

export default function AdminProjectProductionPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [media, setMedia] = useState<AdminMediaRow[]>([]);
  const [job, setJob] = useState<ProductionJobRecord | null>(null);
  const [qc, setQc] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [filmFile, setFilmFile] = useState<File | null>(null);
  const [shorterFile, setShorterFile] = useState<File | null>(null);
  const [webMessages, setWebMessages] = useState<
    {
      id: string;
      author_name: string;
      relationship: string;
      message: string;
      attachment_media_id: string | null;
      status: string;
    }[]
  >([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [res, webRes] = await Promise.all([
      fetch(`/api/projects/${projectId}`),
      fetch(`/api/projects/${projectId}/website`),
    ]);
    if (res.ok) {
      const data = await res.json();
      setProject(data.project);
      setMedia(data.media || []);
      setJob(data.productionJob);
      setNotes(data.productionJob?.notes || "");
      try {
        setQc(JSON.parse(data.productionJob?.qc_checklist_json || "{}"));
      } catch {
        setQc({});
      }
    }
    if (webRes.ok) {
      const wData = await webRes.json();
      setWebMessages(wData.messages || []);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(project_status: ProjectStatus) {
    setMessage("");
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_status }),
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Failed to update status.");
    else {
      setMessage(`Status updated to ${project_status.replaceAll("_", " ")}.`);
      load();
    }
  }

  async function uploadExport(file: File | null, kind: "film" | "shorter") {
    if (!file) return;
    setMessage("");
    const form = new FormData();
    form.append("filmFile", file);
    form.append("kind", kind);
    const res = await fetch(`/api/projects/${projectId}/film`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Uploaded ${kind} export successfully.`);
      load();
    } else {
      setMessage(data.error || "Upload failed.");
    }
  }

  async function saveQc(deliverNow: boolean) {
    setMessage("");
    const res = await fetch(`/api/projects/${projectId}/film`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qcChecklist: qc, notes, deliverNow }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(
        deliverNow && data.reviewStatus === "PASSED"
          ? "Human Quality Review passed and final film delivered to family!"
          : `Quality checklist saved (${data.reviewStatus}).`
      );
      load();
    } else {
      setMessage(data.error || "Failed to save quality review.");
    }
  }

    return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202020]">
      <header className="bg-white border-b border-[#E8E6E0] px-4 sm:px-8 h-16 flex items-center justify-between">
        <LegaseeLogo href="/admin/dashboard" size="sm" />
        <Link
          href="/admin/projects"
          className="text-xs text-[#77746F] hover:text-[#202020]"
        >
          ← All Projects
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-editorial text-3xl text-[#202020]">
              {project?.deceased_full_name || "Project Production"}
            </h1>
            <p className="text-xs text-[#77746F] mt-1">
              Project ID: {projectId} • Current Status:{" "}
              <strong>{project?.project_status.replaceAll("_", " ")}</strong>
            </p>
          </div>

          <select
            value={project?.project_status || "COLLECTING_CONTRIBUTIONS"}
            onChange={(e) => updateStatus(e.target.value as ProjectStatus)}
            className="px-4 py-2 rounded-full border border-[#E8E6E0] bg-white text-xs font-medium"
          >
            {PROJECT_STATUS_STEPS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-[#F1EFE9] border border-[#E8E6E0] text-sm text-[#202020]">
            {message}
          </div>
        )}

        {/* Media Organisation Table */}
        <section className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E6E0]">
            <h2 className="font-editorial text-xl">
              Collected Media ({media.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F3] text-[#77746F] border-b border-[#E8E6E0]">
                <tr>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Contributor</th>
                  <th className="px-4 py-3">Description / When &amp; Where</th>
                  <th className="px-4 py-3">Enhancement</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Original</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6E0]">
                {media.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium">
                      {m.original_filename} ({m.file_type})
                    </td>
                    <td className="px-4 py-3">{m.contributor_name}</td>
                    <td className="px-4 py-3 text-[#77746F]">
                      {m.caption || "—"}{" "}
                      {(m.event_date || m.event_location) &&
                        `(${[m.event_date, m.event_location]
                          .filter(Boolean)
                          .join(" • ")})`}
                    </td>
                    <td className="px-4 py-3">{m.enhancement_preference}</td>
                    <td className="px-4 py-3">{m.approval_status}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`/api/media/${m.id}/file?download=1`}
                        className="inline-flex items-center gap-1 underline text-[#202020]"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI-Assisted Editing & Compilation */}
        <AiFilmCompiler projectId={projectId} onCompiled={load} />

        {/* Final Export Upload & Human Quality Review */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-5">
            <h2 className="font-editorial text-xl">Final Film Export Upload</h2>
            <div>
              <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                Main Memorial Film (MP4)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="video/mp4,video/*"
                  onChange={(e) => setFilmFile(e.target.files?.[0] || null)}
                  className="text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => uploadExport(filmFile, "film")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242424] text-white text-xs font-medium"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload MP4</span>
                </button>
              </div>
              {job?.output_file_key && (
                <p className="text-xs text-[#718875] mt-1.5">
                  Main export uploaded: {job.output_file_key}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                Optional Shorter Highlight Version (MP4)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="video/mp4,video/*"
                  onChange={(e) => setShorterFile(e.target.files?.[0] || null)}
                  className="text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => uploadExport(shorterFile, "shorter")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E8E6E0] text-xs font-medium"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-xl">
                Human Quality Review Checklist
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F1EFE9] text-xs">
                {job?.review_status || "PENDING"}
              </span>
            </div>

            <div className="space-y-2">
              {QC_ITEMS.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 text-xs text-[#202020] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(qc[item.key])}
                    onChange={(e) =>
                      setQc((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-[#242424]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <textarea
              rows={2}
              placeholder="Internal production & QC notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-xs"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => saveQc(false)}
                className="px-4 py-2 rounded-full border border-[#E8E6E0] text-xs font-medium hover:bg-[#F1EFE9]"
              >
                Save Checklist
              </button>
              <button
                type="button"
                onClick={() => saveQc(true)}
                className="px-5 py-2 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838]"
              >
                Pass QC &amp; Deliver Final Film
              </button>
            </div>
          </section>
        </div>

        {/* Memorial Website Posts & Late Upload Approvals */}
        <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
          <h2 className="font-editorial text-xl">
            Memorial Website Posts &amp; Late Uploads ({webMessages.length})
          </h2>
          {webMessages.length === 0 ? (
            <p className="text-xs text-[#77746F]">
              No memorial website posts yet.
            </p>
          ) : (
            <div className="divide-y divide-[#E8E6E0]">
              {webMessages.map((wm) => (
                <div
                  key={wm.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="text-sm text-[#202020]">{wm.message}</p>
                    <p className="text-[#77746F] mt-0.5">
                      {wm.author_name} ({wm.relationship}) • Status:{" "}
                      <strong>{wm.status}</strong>
                      {wm.attachment_media_id ? " • Includes photo/video" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/projects/${projectId}/website`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            messageId: wm.id,
                            status: "APPROVED",
                          }),
                        });
                        load();
                      }}
                      className="px-3 py-1 rounded-full bg-[#242424] text-white font-medium"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/projects/${projectId}/website`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            messageId: wm.id,
                            status: "HIDDEN",
                          }),
                        });
                        load();
                      }}
                      className="px-3 py-1 rounded-full border border-[#E8E6E0] text-[#77746F]"
                    >
                      Hide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
