import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { ADMIN_NAV } from "../dashboard/page";
import { DeleteExpiredArchiveButton } from "@/components/AdminControls";

export default async function AdminSubscriptionsPage() {
  ensureSeeded();
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const archives = db
    .prepare(
      `SELECT a.*, p.deceased_full_name
       FROM archives a
       JOIN projects p ON p.id = a.project_id
       ORDER BY a.updated_at DESC`
    )
    .all() as {
    id: string;
    project_id: string;
    deceased_full_name: string;
    storage_location: string;
    retention_status: string;
    deletion_date: string | null;
  }[];

  return (
    <DashboardShell user={user} portalLabel="Jukira Admin" navItems={ADMIN_NAV}>
      <h1 className="font-editorial text-3xl text-[#202020] mb-6">
        Archive Subscriptions &amp; Retention
      </h1>
      <div className="bg-white border border-[#E8E6E0] rounded-2xl divide-y divide-[#E8E6E0]">
        {archives.map((a) => (
          <div
            key={a.id}
            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <p className="font-medium text-sm text-[#202020]">
                {a.deceased_full_name}
              </p>
              <p className="text-xs text-[#77746F]">
                Vault: {a.storage_location} • Status: {a.retention_status}
                {a.deletion_date
                  ? ` • Deletion date: ${a.deletion_date.slice(0, 10)}`
                  : ""}
              </p>
            </div>
            {a.retention_status !== "DELETED" && (
              <DeleteExpiredArchiveButton projectId={a.project_id} />
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
