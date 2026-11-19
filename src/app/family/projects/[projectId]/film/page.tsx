"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, Film, FolderArchive, Lock } from "lucide-react";
import { FamilyProjectNav } from "@/components/FamilyProjectNav";
import { LegaseeLogo } from "@/components/LegaseeLogo";
import type {
  OrderPaymentRecord,
  ProductionJobRecord,
  ProjectRecord,
} from "@/lib/types";

export default function FamilyFilmPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [job, setJob] = useState<ProductionJobRecord | null>(null);
  const [payments, setPayments] = useState<OrderPaymentRecord[]>([]);
  const [filmUrl, setFilmUrl] = useState<string | null>(null);
  const [shorterUrl, setShorterUrl] = useState<string | null>(null);
  const [rawUrl, setRawUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data.project);
      setJob(data.productionJob);
      setPayments(data.payments || []);

      if (data.productionJob?.output_file_key) {
        const f = await fetch(`/api/projects/${projectId}/film?kind=film`);
        if (f.ok) setFilmUrl((await f.json()).downloadUrl);
      }
      if (data.productionJob?.shorter_file_key) {
        const s = await fetch(`/api/projects/${projectId}/film?kind=shorter`);
        if (s.ok) setShorterUrl((await s.json()).downloadUrl);
      }
      if (data.project?.raw_footage_purchased) {
        const r = await fetch(`/api/projects/${projectId}/film?kind=raw`);
        if (r.ok) setRawUrl((await r.json()).downloadUrl);
      }
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePayment(
    action: "PAY_PRODUCTION" | "PURCHASE_RAW_FOOTAGE",
    simulateFailure = false
  ) {
    setStatusMsg("");
    const res = await fetch(`/api/projects/${projectId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, simulateFailure }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusMsg(data.error || "Payment failed.");
    } else {
      setStatusMsg(`Payment confirmed (${data.invoiceNumber}).`);
      load();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] p-8 text-sm text-[#77746F]">
        Loading film delivery...
      </div>
    );
  }

  const productionPaid = payments.some(
    (p) => p.service_type === "FILM_PRODUCTION" && p.payment_status === "PAID"
  );

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
            Final Film &amp; Downloads
          </h1>
          <p className="text-sm text-[#77746F]">
            Watch and download the finished memorial film, and optionally
            purchase the raw submitted footage package.
          </p>
        </div>

        <FamilyProjectNav projectId={projectId} />

        {statusMsg && (
          <div className="p-4 rounded-xl bg-[#F1EFE9] border border-[#E8E6E0] text-sm text-[#202020]">
            {statusMsg}
          </div>
        )}

        {/* Finished Film Card */}
        <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-[#B6A995]" />
            <h2 className="font-editorial text-2xl text-[#202020]">
              Finished Memorial Film
            </h2>
          </div>

          {!productionPaid ? (
            <div className="p-5 rounded-xl bg-[#F8F7F3] border border-[#E8E6E0] space-y-3">
              <p className="text-sm text-[#202020]">
                Film production payment is currently pending. Confirm payment to
                unlock film delivery when production completes.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePayment("PAY_PRODUCTION", false)}
                  className="px-5 py-2.5 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838]"
                >
                  Pay Film Production Invoice
                </button>
                <button
                  type="button"
                  onClick={() => handlePayment("PAY_PRODUCTION", true)}
                  className="px-4 py-2.5 rounded-full border border-[#E8E6E0] text-xs text-[#77746F] hover:text-[#202020]"
                >
                  Test Declined Payment
                </button>
              </div>
            </div>
          ) : project?.project_status === "FINAL_FILM_DELIVERED" &&
            job?.review_status === "PASSED" &&
            filmUrl ? (
            <div className="space-y-4">
              <video
                src={filmUrl}
                controls
                className="w-full rounded-xl border border-[#E8E6E0] bg-black max-h-[420px]"
              />
              <div className="flex flex-wrap gap-3">
                <a
                  href={filmUrl}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Memorial Film (MP4)</span>
                </a>
                {shorterUrl && (
                  <a
                    href={shorterUrl}
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E8E6E0] bg-white text-[#202020] text-sm font-medium hover:bg-[#F1EFE9]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Shorter Highlight Version</span>
                  </a>
                )}
              </div>
              <p className="text-xs text-[#77746F]">
                Expiring secure download link (valid for 1 hour). Refresh page
                anytime to generate a new link.
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-[#F8F7F3] border border-[#E8E6E0] text-sm text-[#77746F]">
              Your film is currently in{" "}
              <strong className="text-[#202020]">
                {project?.project_status.replaceAll("_", " ")}
              </strong>
              . Once human quality review passes and the final MP4 is uploaded,
              it will appear here for streaming and download.
            </div>
          )}
        </section>

        {/* Optional Raw Footage Package */}
        <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <FolderArchive className="w-5 h-5 text-[#B6A995]" />
            <h2 className="font-editorial text-2xl text-[#202020]">
              Optional Raw Footage Package
            </h2>
          </div>
          <p className="text-sm text-[#77746F]">
            You do not need to purchase raw footage to receive your finished
            memorial film. If you would also like all original submitted
            photographs and videos organised with metadata, you can unlock the
            download package below.
          </p>

          {project?.raw_footage_purchased && rawUrl ? (
            <a
              href={rawUrl}
              download
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
            >
              <Download className="w-4 h-4" />
              <span>Download Raw Footage Archive Manifest</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => handlePayment("PURCHASE_RAW_FOOTAGE", false)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#242424] text-[#202020] text-sm font-medium hover:bg-[#F1EFE9]"
            >
              <Lock className="w-4 h-4" />
              <span>Purchase Raw Footage Package</span>
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
