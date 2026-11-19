import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import type { FuneralHomeRecord } from "@/lib/types";

export default async function PartnerAccountPage() {
  ensureSeeded();
  const user = await requireRole(["FUNERAL_HOME", "ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const partner = user.funeralHomeId
    ? (db
        .prepare("SELECT * FROM funeral_homes WHERE id = ?")
        .get(user.funeralHomeId) as unknown as FuneralHomeRecord | undefined)
    : undefined;

  const navItems = [
    { href: "/partners/dashboard", label: "Dashboard" },
    { href: "/partners/projects", label: "Projects" },
    { href: "/partners/projects/new", label: "New Project" },
    { href: "/partners/account", label: "Partner Account" },
  ];

  return (
    <DashboardShell
      user={user}
      portalLabel="Funeral Home Partner"
      navItems={navItems}
    >
      <h1 className="font-editorial text-3xl text-[#202020] mb-6">
        Partner Account
      </h1>
      <div className="bg-white border border-[#E8E6E0] rounded-2xl p-6 max-w-xl space-y-3 text-sm">
        <p>
          <span className="text-[#77746F]">Business Name:</span>{" "}
          <strong>{partner?.business_name || "-"}</strong>
        </p>
        <p>
          <span className="text-[#77746F]">Primary Contact:</span>{" "}
          {partner?.contact_name || user.name}
        </p>
        <p>
          <span className="text-[#77746F]">Email:</span>{" "}
          {partner?.contact_email || user.email}
        </p>
        <p>
          <span className="text-[#77746F]">Market / Currency:</span>{" "}
          {partner?.country || "EU"} ({partner?.currency || "EUR"})
        </p>
        <p>
          <span className="text-[#77746F]">Account Status:</span>{" "}
          <span className="px-2.5 py-0.5 rounded-full bg-[#718875]/15 text-[#718875] text-xs font-medium">
            {partner?.account_status || "ACTIVE"}
          </span>
        </p>
        <p>
          <span className="text-[#77746F]">White-Label Branding:</span>{" "}
          {partner?.white_label_enabled ? (
            <span className="text-[#202020] font-medium">
              Active, “{partner.white_label_name || partner.business_name}” (
              {partner.white_label_monthly_fee} {partner.currency}/month)
            </span>
          ) : (
            <span className="text-[#77746F]">
              Standard Co-Branded (€0/month, contact admin to enable White-Label)
            </span>
          )}
        </p>
      </div>
    </DashboardShell>
  );
}
