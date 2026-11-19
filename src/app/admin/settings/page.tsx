import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { ADMIN_NAV } from "../dashboard/page";
import type { AuditLogRecord, NotificationRecord } from "@/lib/types";

export default async function AdminSettingsPage() {
  ensureSeeded();
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const audits = db
    .prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 30")
    .all() as unknown as AuditLogRecord[];
  const notifications = db
    .prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 30")
    .all() as unknown as NotificationRecord[];

  return (
    <DashboardShell user={user} portalLabel="Jukira Admin" navItems={ADMIN_NAV}>
      <h1 className="font-editorial text-3xl text-[#202020] mb-6">
        Audit Logs &amp; Email Notifications
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6">
          <h2 className="font-editorial text-xl mb-4">Recent Audit Events</h2>
          <div className="space-y-3 text-xs">
            {audits.map((a) => (
              <div
                key={a.id}
                className="pb-2.5 border-b border-[#E8E6E0] last:border-none"
              >
                <p className="font-medium text-[#202020]">
                  {a.action}, {a.target_type} ({a.target_id})
                </p>
                <p className="text-[#77746F]">
                  {a.actor_email || "System"} •{" "}
                  {new Date(a.created_at).toLocaleString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-[#E8E6E0] rounded-2xl p-6">
          <h2 className="font-editorial text-xl mb-4">
            Email Notification Log
          </h2>
          <div className="space-y-3 text-xs">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="pb-2.5 border-b border-[#E8E6E0] last:border-none"
              >
                <p className="font-medium text-[#202020]">{n.subject}</p>
                <p className="text-[#77746F]">
                  To: {n.recipient_email} ({n.recipient_role}) • {n.event_type}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
