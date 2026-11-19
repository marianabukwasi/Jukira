import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { ADMIN_NAV } from "../dashboard/page";
import type { ProjectRecord } from "@/lib/types";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  ensureSeeded();
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const sp = await searchParams;
  const query = (sp.q || "").trim().toLowerCase();

  const db = getDb();
  const all = db
    .prepare("SELECT * FROM projects ORDER BY created_at DESC")
    .all() as unknown as ProjectRecord[];

  const filtered = query
    ? all.filter(
        (p) =>
          p.deceased_full_name.toLowerCase().includes(query) ||
          p.owner_name.toLowerCase().includes(query) ||
          p.owner_email.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query)
      )
    : all;

  return (
    <DashboardShell user={user} portalLabel="Jukira Admin" navItems={ADMIN_NAV}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-editorial text-3xl text-[#202020]">
          All Projects ({filtered.length})
        </h1>
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={sp.q || ""}
            placeholder="Search deceased or owner..."
            className="px-4 py-2 rounded-full border border-[#E8E6E0] bg-white text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-[#242424] text-white text-xs font-medium"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden divide-y divide-[#E8E6E0]">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/admin/projects/${p.id}`}
            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F8F7F3]"
          >
            <div>
              <p className="font-medium text-sm text-[#202020]">
                {p.deceased_full_name}
              </p>
              <p className="text-xs text-[#77746F]">
                {p.id} • {p.owner_name} ({p.owner_email}) • {p.country_market}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#F1EFE9] text-xs text-[#202020] self-start sm:self-auto">
              {p.project_status.replaceAll("_", " ")}
            </span>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
