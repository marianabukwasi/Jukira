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
  type ProjectRecord,
} from "@/lib/types";

export default async function FamilyDashboardPage() {
  ensureSeeded();
  const user = await requireRole(["FAMILY_OWNER", "ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const projects = db
    .prepare(
      "SELECT * FROM projects WHERE owner_id = ? OR LOWER(owner_email) = LOWER(?) ORDER BY created_at DESC"
    )
    .all(user.id, user.email) as unknown as ProjectRecord[];

  const navItems = [
    { href: "/family/dashboard", label: "Dashboard" },
    { href: "/family/projects", label: "My Projects" },
    { href: "/family/projects/new", label: "Create Project" },
  ];

  return (
    <DashboardShell user={user} portalLabel="Family Portal" navItems={navItems}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-editorial text-3xl text-[#202020]">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-[#77746F] mt-1">
            Manage your memorial film collections, review contributions, and
            watch finished films.
          </p>
        </div>
        <Link
          href="/family/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Memorial Project</span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-[#E8E6E0] rounded-2xl p-10 text-center space-y-4">
          <h2 className="font-editorial text-2xl text-[#202020]">
            No memorial projects yet
          </h2>
          <p className="text-sm text-[#77746F] max-w-md mx-auto">
            Create your first memorial project to receive a private contribution
            link to share with family and friends.
          </p>
          <Link
            href="/family/projects/new"
            className="inline-flex px-6 py-3 rounded-full bg-[#242424] text-white text-sm font-medium"
          >
            Create a Family Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => {
            const mediaCount = (
              db
                .prepare("SELECT COUNT(*) as c FROM media WHERE project_id = ?")
                .get(p.id) as { c: number }
            ).c;
            const contributorCount = (
              db
                .prepare(
                  "SELECT COUNT(*) as c FROM contributors WHERE project_id = ?"
                )
                .get(p.id) as { c: number }
            ).c;
            const statusLabel =
              PROJECT_STATUS_STEPS.find((s) => s.key === p.project_status)
                ?.label || p.project_status;

            return (
              <Link
                key={p.id}
                href={`/family/projects/${p.id}`}
                className="bg-white border border-[#E8E6E0] rounded-2xl p-6 hover:border-[#B6A995] transition-colors flex flex-col justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  {p.main_photo_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.main_photo_url}
                      alt={p.deceased_full_name}
                      className="w-16 h-16 rounded-full object-cover border border-[#E8E6E0] shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F1EFE9] text-[11px] font-medium text-[#77746F] mb-1.5">
                      {statusLabel}
                    </span>
                    <h2 className="font-editorial text-xl text-[#202020] truncate">
                      {p.deceased_full_name}
                    </h2>
                    <p className="text-xs text-[#77746F] mt-0.5">
                      {FILM_DURATION_LABELS[p.film_duration_tier]} •{" "}
                      {p.country_market}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E6E0] flex items-center justify-between text-xs text-[#77746F]">
                  <span>{contributorCount} contributors</span>
                  <span>{mediaCount} memories shared</span>
                  <span className="text-[#202020] font-medium">Open →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
