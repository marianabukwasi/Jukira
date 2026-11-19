import { redirect } from "next/navigation";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { getAllPricingConfigs } from "@/lib/pricing";
import { DashboardShell } from "@/components/DashboardShell";
import { ADMIN_NAV } from "../dashboard/page";
import { PricingConfigEditor } from "@/components/AdminControls";

export default async function AdminPricingPage() {
  ensureSeeded();
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const configs = getAllPricingConfigs();

  return (
    <DashboardShell user={user} portalLabel="Jukira Admin" navItems={ADMIN_NAV}>
      <div className="mb-6">
        <h1 className="font-editorial text-3xl text-[#202020]">
          Market &amp; Duration Pricing Configuration
        </h1>
        <p className="text-sm text-[#77746F] mt-1">
          Configure wholesale prices, raw footage packages, archive
          subscriptions, and production cost planning figures by market.
        </p>
      </div>
      <div className="space-y-6">
        {configs.map((cfg) => (
          <PricingConfigEditor key={cfg.id} config={cfg} />
        ))}
      </div>
    </DashboardShell>
  );
}
