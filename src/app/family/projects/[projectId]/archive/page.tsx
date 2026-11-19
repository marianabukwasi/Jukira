"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FamilyProjectNav } from "@/components/FamilyProjectNav";
import { LegaseeLogo } from "@/components/LegaseeLogo";
import type { SubscriptionRecord } from "@/lib/types";

export default function FamilyArchivePage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(
    null
  );
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setSubscription(data.subscription || null);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(action: "START_ARCHIVE" | "CANCEL_ARCHIVE") {
    setMessage("");
    const res = await fetch(`/api/projects/${projectId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(
        action === "START_ARCHIVE"
          ? "Optional Cloud Archive subscription activated."
          : "Archive subscription cancelled. You have a 30-day grace period to download your files before deletion."
      );
      load();
    } else {
      setMessage(data.error || "Unable to update subscription.");
    }
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
        <div>
          <h1 className="font-editorial text-3xl text-[#202020]">
            Optional Cloud Archive
          </h1>
          <p className="text-sm text-[#77746F]">
            Ongoing cloud preservation is completely optional. You can download
            your film anytime without subscribing.
          </p>
        </div>

        <FamilyProjectNav projectId={projectId} />

        {message && (
          <div className="p-4 rounded-xl bg-[#F1EFE9] border border-[#E8E6E0] text-sm text-[#202020]">
            {message}
          </div>
        )}

        <div className="bg-white border border-[#E8E6E0] rounded-2xl p-6 sm:p-8 space-y-5">
          {subscription?.status === "ACTIVE" ? (
            <>
              <span className="inline-block px-3 py-1 rounded-full bg-[#718875]/15 text-[#718875] text-xs font-medium">
                Active Archive Subscription
              </span>
              <p className="text-sm text-[#77746F]">
                Your finished memorial film and selected project material are
                preserved in private cloud storage. Next renewal:{" "}
                <strong className="text-[#202020]">
                  {new Date(subscription.renewal_date).toLocaleDateString(
                    "en-GB"
                  )}
                </strong>
                .
              </p>
              <button
                type="button"
                onClick={() => handleAction("CANCEL_ARCHIVE")}
                className="px-5 py-2.5 rounded-full border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F1EFE9]"
              >
                Cancel Archive Subscription
              </button>
            </>
          ) : subscription?.status === "CANCELLED" ? (
            <>
              <span className="inline-block px-3 py-1 rounded-full bg-[#B68C55]/15 text-[#B68C55] text-xs font-medium">
                Cancelled, Grace Period Active
              </span>
              <p className="text-sm text-[#77746F]">
                Your archive subscription is ending. Please download your
                finished film and any purchased raw footage before{" "}
                <strong className="text-[#202020]">
                  {subscription.expiry_date
                    ? new Date(subscription.expiry_date).toLocaleDateString(
                        "en-GB"
                      )
                    : "the end of the retention period"}
                </strong>
                , after which archived files will be permanently deleted.
              </p>
              <button
                type="button"
                onClick={() => handleAction("START_ARCHIVE")}
                className="px-5 py-2.5 rounded-full bg-[#242424] text-white text-xs font-medium"
              >
                Renew Cloud Archive
              </button>
            </>
          ) : (
            <>
              <h2 className="font-editorial text-2xl text-[#202020]">
                Preserve this collection online
              </h2>
              <p className="text-sm text-[#77746F]">
                Without an ongoing archive subscription, basic working files are
                retained temporarily for production and the download window,
                then deleted. Subscribe to keep your memorial collection
                safely preserved online.
              </p>
              <button
                type="button"
                onClick={() => handleAction("START_ARCHIVE")}
                className="px-6 py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
              >
                Subscribe to Cloud Archive
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
