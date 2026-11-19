import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import {
  FILM_DURATION_LABELS,
  PROJECT_STATUS_STEPS,
  type FuneralHomeRecord,
  type ProjectRecord,
} from "@/lib/types";

export default async function PartnersDashboardPage() {
  ensureSeeded();
  const user = await requireRole(["FUNERAL_HOME", "ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const partner = user.funeralHomeId
    ? (db
        .prepare("SELECT * FROM funeral_homes WHERE id = ?")
        .get(user.funeralHomeId) as unknown as FuneralHomeRecord | undefined)
    : undefined;

  const projects = (
    user.role === "ADMIN"
      ? db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all()
      : db
          .prepare(
            "SELECT * FROM projects WHERE funeral_home_id = ? ORDER BY created_at DESC"
          )
          .all(user.funeralHomeId || "")
  ) as unknown as ProjectRecord[];

  const navItems = [
    { href: "/partners/dashboard", label: "Dashboard" },
    { href: "/partners/projects", label: "Projects" },
    { href: "/partners/projects/new", label: "New Project" },
    { href: "/partners/account", label: "Partner Account" },
  ];

  return (
    <DashboardShell
      user={user}
      portalLabel={partner?.business_name || "Funeral Home Partner"}
      navItems={navItems}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-editorial text-3xl text-[#202020]">
            {partner?.business_name || "Partner Portal"}
          </h1>
          <p className="text-sm text-[#77746F] mt-1">
            Create memorial film projects for families, share contribution
            links, and track production and wholesale invoices.
          </p>
        </div>
        <Link
          href="/partners/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create Family Project</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#E8E6E0] rounded-xl p-5">
          <p className="text-xs text-[#77746F]">Total Partner Projects</p>
          <p className="font-editorial text-3xl mt-1">{projects.length}</p>
        </div>
        <div className="bg-white border border-[#E8E6E0] rounded-xl p-5">
          <p className="text-xs text-[#77746F]">Active Collections</p>
          <p className="font-editorial text-3xl mt-1">
            {
              projects.filter(
                (p) => p.project_status === "COLLECTING_CONTRIBUTIONS"
              ).length
            }
          </p>
        </div>
        <div className="bg-white border border-[#E8E6E0] rounded-xl p-5">
          <p className="text-xs text-[#77746F]">Delivered Films</p>
          <p className="font-editorial text-3xl mt-1">
            {
              projects.filter(
                (p) => p.project_status === "FINAL_FILM_DELIVERED"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E6E0]">
          <h2 className="font-editorial text-xl">Your Memorial Projects</h2>
        </div>
        <div className="divide-y divide-[#E8E6E0]">
          {projects.length === 0 ? (
            <p className="p-6 text-sm text-[#77746F]">
              No projects created yet.
            </p>
          ) : (
            projects.map((p) => {
              const statusLabel =
                PROJECT_STATUS_STEPS.find((s) => s.key === p.project_status)
                  ?.label || p.project_status;
              return (
                <Link
                  key={p.id}
                  href={`/partners/projects/${p.id}`}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F8F7F3] transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-[#202020]">
                      {p.deceased_full_name}
                    </p>
                    <p className="text-xs text-[#77746F]">
                      Family owner: {p.owner_name} •{" "}
                      {FILM_DURATION_LABELS[p.film_duration_tier]}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F1EFE9] text-xs text-[#202020] self-start sm:self-auto">
                    {statusLabel}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
