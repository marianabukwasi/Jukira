import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import { FamilyProjectNav } from "@/components/FamilyProjectNav";
import { LegaseeLogo } from "@/components/LegaseeLogo";
import { PROJECT_STATUS_STEPS, type ProductionJobRecord } from "@/lib/types";

export default async function FamilyProductionPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  ensureSeeded();
  const user = await requireRole(["FAMILY_OWNER", "ADMIN"]);
  if (!user) redirect("/login");

  const { projectId } = await params;
  const project = getAuthorizedProject(user, projectId);
  if (!project) notFound();

  const db = getDb();
  const job = db
    .prepare("SELECT * FROM production_jobs WHERE project_id = ?")
    .get(projectId) as unknown as ProductionJobRecord | undefined;

  const currentIdx = PROJECT_STATUS_STEPS.findIndex(
    (s) => s.key === project.project_status
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

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="font-editorial text-3xl text-[#202020] mb-2">
          Production Status
        </h1>
        <p className="text-sm text-[#77746F] mb-6">
          Every Jukira film goes through AI-assisted organisation and human
          quality review before delivery.
        </p>

        <FamilyProjectNav projectId={projectId} />

        <div className="bg-white border border-[#E8E6E0] rounded-2xl p-6 sm:p-8 space-y-6">
          <ol className="space-y-4">
            {PROJECT_STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentIdx;
              return (
                <li key={step.key} className="flex items-start gap-3.5">
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-[#718875] mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#E8E6E0] mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        done ? "text-[#202020]" : "text-[#77746F]"
                      }`}
                    >
                      {idx + 1}. {step.label}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {job && (
            <div className="pt-5 border-t border-[#E8E6E0] text-xs text-[#77746F] space-y-1">
              <p>
                Human Quality Review:{" "}
                <strong className="text-[#202020]">{job.review_status}</strong>
              </p>
              {job.notes && <p>Production notes: {job.notes}</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
