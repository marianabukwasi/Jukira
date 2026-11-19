import { redirect } from "next/navigation";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { getAllPricingConfigs } from "@/lib/pricing";
import { DashboardShell } from "@/components/DashboardShell";
import { CreateProjectForm } from "@/components/CreateProjectForm";

export default async function NewPartnerProjectPage() {
  ensureSeeded();
  const user = await requireRole(["FUNERAL_HOME", "ADMIN"]);
  if (!user) redirect("/login");

  const pricingConfigs = getAllPricingConfigs();
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
      <div className="mb-6">
        <h1 className="font-editorial text-3xl text-[#202020]">
          Create Memorial Project for a Family
        </h1>
        <p className="text-sm text-[#77746F] mt-1">
          Wholesale pricing is shown per duration tier. You set your own retail
          offering for the family.
        </p>
      </div>
      <CreateProjectForm
        pricingConfigs={pricingConfigs}
        redirectPrefix="/partners/projects"
      />
    </DashboardShell>
  );
}
