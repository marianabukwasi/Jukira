import { redirect } from "next/navigation";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { getAllPricingConfigs } from "@/lib/pricing";
import { DashboardShell } from "@/components/DashboardShell";
import { CreateProjectForm } from "@/components/CreateProjectForm";

export default async function NewFamilyProjectPage() {
  ensureSeeded();
  const user = await requireRole(["FAMILY_OWNER", "ADMIN"]);
  if (!user) redirect("/login");

  const pricingConfigs = getAllPricingConfigs();
  const navItems = [
    { href: "/family/dashboard", label: "Dashboard" },
    { href: "/family/projects", label: "My Projects" },
    { href: "/family/projects/new", label: "Create Project" },
  ];

  return (
    <DashboardShell user={user} portalLabel="Family Portal" navItems={navItems}>
      <div className="mb-6">
        <h1 className="font-editorial text-3xl text-[#202020]">
          Create a Family Memorial Project
        </h1>
        <p className="text-sm text-[#77746F] mt-1">
          Enter your loved one’s details to generate a private contribution link
          for family and friends.
        </p>
      </div>
      <CreateProjectForm
        defaultOwnerName={user.name}
        defaultOwnerEmail={user.email}
        pricingConfigs={pricingConfigs}
        redirectPrefix="/family/projects"
      />
    </DashboardShell>
  );
}
