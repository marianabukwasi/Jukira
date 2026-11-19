"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import type { MemorialMessageRecord } from "@/lib/types";

export interface DisplayMemorialMessage extends MemorialMessageRecord {
  attachmentUrl?: string | null;
  attachmentType?: string | null;
}

export function MemorialGuestbook({
  secureToken,
  initialMessages,
}: {
  secureToken: string;
  initialMessages: DisplayMemorialMessage[];
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("authorName", authorName);
      form.append("relationship", relationship);
      form.append("message", message);
      if (file) form.append("file", file);

      const res = await fetch(`/api/memorial/${secureToken}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to submit");
      setNotice(data.message);
      setAuthorName("");
      setRelationship("");
      setMessage("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E8E6E0] rounded-2xl p-6 sm:p-8 space-y-4"
      >
        <div>
          <h3 className="font-editorial text-xl text-[#202020]">
            Leave a Message, Memory, or Forgotten Photo
          </h3>
          <p className="text-xs text-[#77746F] mt-1">
            All posts and late photo/video uploads are reviewed and approved by
            an administrator before appearing on this page.
          </p>
        </div>

        {notice && (
          <div className="p-3 rounded-xl bg-[#F1EFE9] border border-[#E8E6E0] text-xs text-[#202020]">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="Your Name *"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
          <input
            type="text"
            placeholder="Relationship (e.g. Friend, Cousin)"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
          />
        </div>

        <textarea
          rows={3}
          placeholder="Share a memory, message, or update for the family..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E8E6E0] bg-[#F8F7F3] text-xs text-[#202020] cursor-pointer hover:bg-[#F1EFE9]">
            <UploadCloud className="w-4 h-4 text-[#77746F]" />
            <span>
              {file
                ? `Attached: ${file.name}`
                : "Attach forgotten photo or video (optional)"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {initialMessages.length === 0 ? (
          <p className="text-sm text-[#77746F]">
            No approved messages yet. Be the first to share a memory.
          </p>
        ) : (
          initialMessages.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-3"
            >
              <p className="text-sm text-[#202020] leading-relaxed">
                &ldquo;{m.message}&rdquo;
              </p>
              {m.attachmentUrl && (
                <div className="rounded-xl overflow-hidden border border-[#E8E6E0] max-w-sm bg-[#F8F7F3]">
                  {m.attachmentType === "VIDEO" ? (
                    <video
                      src={m.attachmentUrl}
                      controls
                      className="w-full max-h-60"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={m.attachmentUrl}
                      alt="Shared memory"
                      className="w-full max-h-60 object-cover"
                    />
                  )}
                </div>
              )}
              <p className="text-xs text-[#77746F]">
                — <strong className="text-[#202020]">{m.author_name}</strong> (
                {m.relationship}) •{" "}
                {new Date(m.created_at).toLocaleDateString("en-GB")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
