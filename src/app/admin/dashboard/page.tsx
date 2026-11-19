import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { DashboardShell } from "@/components/DashboardShell";
import type { OrderPaymentRecord, ProjectRecord } from "@/lib/types";

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/production", label: "Production Queue" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/subscriptions", label: "Archives" },
  { href: "/admin/settings", label: "Audit & Emails" },
];

export default async function AdminDashboardPage() {
  ensureSeeded();
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const projects = db
    .prepare("SELECT * FROM projects ORDER BY created_at DESC")
    .all() as unknown as ProjectRecord[];
  const payments = db
    .prepare("SELECT * FROM orders_payments")
    .all() as unknown as OrderPaymentRecord[];
  const partnersCount = (
    db.prepare("SELECT COUNT(*) as c FROM funeral_homes").get() as { c: number }
  ).c;
  const activeSubs = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM subscriptions WHERE status = 'ACTIVE'"
      )
      .get() as { c: number }
  ).c;
  const storageBytes = await storage.getStorageUsageBytes();

  const paidRevenue = payments
    .filter((p) => p.payment_status === "PAID")
    .reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.payment_status === "PENDING")
    .reduce((acc, p) => acc + p.amount, 0);

  const stats = [
    { label: "Total Projects", value: projects.length },
    {
      label: "Active Collections",
      value: projects.filter(
        (p) => p.project_status === "COLLECTING_CONTRIBUTIONS"
      ).length,
    },
    {
      label: "In Production",
      value: projects.filter((p) => p.project_status === "IN_PRODUCTION")
        .length,
    },
    {
      label: "Awaiting Quality Review",
      value: projects.filter((p) => p.project_status === "QUALITY_REVIEW")
        .length,
    },
    {
      label: "Completed Films",
      value: projects.filter(
        (p) => p.project_status === "FINAL_FILM_DELIVERED"
      ).length,
    },
    { label: "Paid Revenue (Recorded)", value: `${paidRevenue.toFixed(0)}` },
    { label: "Outstanding Invoices", value: `${pendingAmount.toFixed(0)}` },
    { label: "Funeral Home Partners", value: partnersCount },
    { label: "Archive Subscriptions", value: activeSubs },
    {
      label: "Object Storage Used",
      value: `${(storageBytes / (1024 * 1024)).toFixed(2)} MB`,
    },
  ];

  return (
    <DashboardShell user={user} portalLabel="Jukira Admin" navItems={ADMIN_NAV}>
      <div className="mb-8">
        <h1 className="font-editorial text-3xl text-[#202020]">
          Operations Overview
        </h1>
        <p className="text-sm text-[#77746F] mt-1">
          Manage projects, production quality review, partners, pricing, and
          retention.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#E8E6E0] rounded-xl p-4"
          >
            <p className="text-xs text-[#77746F]">{s.label}</p>
            <p className="font-editorial text-2xl text-[#202020] mt-1">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E6E0] flex items-center justify-between">
          <h2 className="font-editorial text-xl">Recent Projects</h2>
          <Link
            href="/admin/projects"
            className="text-xs underline text-[#77746F] hover:text-[#202020]"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-[#E8E6E0]">
          {projects.slice(0, 8).map((p) => (
            <Link
              key={p.id}
              href={`/admin/projects/${p.id}`}
              className="px-6 py-3.5 flex items-center justify-between hover:bg-[#F8F7F3] text-sm"
            >
              <div>
                <p className="font-medium text-[#202020]">
                  {p.deceased_full_name}
                </p>
                <p className="text-xs text-[#77746F]">
                  Owner: {p.owner_name} • Market: {p.country_market}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#F1EFE9] text-xs text-[#202020]">
                {p.project_status.replaceAll("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
