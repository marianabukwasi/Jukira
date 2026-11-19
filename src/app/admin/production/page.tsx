import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { ADMIN_NAV } from "../dashboard/page";

export default async function AdminProductionQueuePage() {
  ensureSeeded();
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const jobs = db
    .prepare(
      `SELECT j.*, p.deceased_full_name, p.project_status, p.film_duration_tier
       FROM production_jobs j
       JOIN projects p ON p.id = j.project_id
       ORDER BY j.updated_at DESC`
    )
    .all() as {
    id: string;
    project_id: string;
    deceased_full_name: string;
    project_status: string;
    editing_status: string;
    review_status: string;
    film_duration_tier: string;
  }[];

  return (
    <DashboardShell user={user} portalLabel="Jukira Admin" navItems={ADMIN_NAV}>
      <h1 className="font-editorial text-3xl text-[#202020] mb-6">
        Production &amp; Quality Review Queue
      </h1>

      <div className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden divide-y divide-[#E8E6E0]">
        {jobs.map((j) => (
          <Link
            key={j.id}
            href={`/admin/projects/${j.project_id}`}
            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F8F7F3]"
          >
            <div>
              <p className="font-medium text-sm text-[#202020]">
                {j.deceased_full_name}
              </p>
              <p className="text-xs text-[#77746F]">
                Stage: {j.project_status.replaceAll("_", " ")} • QC:{" "}
                {j.review_status}
              </p>
            </div>
            <span className="text-xs font-medium underline text-[#202020]">
              Open Production Workspace →
            </span>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
