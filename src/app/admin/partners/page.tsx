import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { ADMIN_NAV } from "../dashboard/page";
import {
  PartnerStatusControls,
  PartnerWhiteLabelControls,
} from "@/components/AdminControls";
import type { FuneralHomeRecord } from "@/lib/types";

export default async function AdminPartnersPage() {
  ensureSeeded();
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const partners = db
    .prepare("SELECT * FROM funeral_homes ORDER BY created_at DESC")
    .all() as unknown as FuneralHomeRecord[];

  return (
    <DashboardShell user={user} portalLabel="Jukira Admin" navItems={ADMIN_NAV}>
      <h1 className="font-editorial text-3xl text-[#202020] mb-6">
        Funeral Home Partners
      </h1>
      <div className="bg-white border border-[#E8E6E0] rounded-2xl divide-y divide-[#E8E6E0]">
        {partners.map((p) => (
          <div key={p.id} className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm text-[#202020]">
                  {p.business_name}
                </p>
                <p className="text-xs text-[#77746F]">
                  {p.contact_name} • {p.contact_email} • {p.country} (
                  {p.currency})
                </p>
              </div>
              <PartnerStatusControls
                partnerId={p.id}
                currentStatus={p.account_status}
              />
            </div>
            <PartnerWhiteLabelControls
              partnerId={p.id}
              initialEnabled={Boolean(p.white_label_enabled)}
              initialName={p.white_label_name || p.business_name}
              initialMonthlyFee={p.white_label_monthly_fee ?? 49}
            />
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
