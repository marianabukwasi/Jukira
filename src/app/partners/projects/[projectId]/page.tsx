import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import { formatCurrency } from "@/lib/pricing";
import { DashboardShell } from "@/components/DashboardShell";
import { ShareLinkCard } from "@/components/ShareLinkCard";
import {
  FILM_DURATION_LABELS,
  PROJECT_STATUS_STEPS,
  type OrderPaymentRecord,
} from "@/lib/types";

export default async function PartnerProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  ensureSeeded();
  const user = await requireRole(["FUNERAL_HOME", "ADMIN"]);
  if (!user) redirect("/login");

  const { projectId } = await params;
  const project = getAuthorizedProject(user, projectId);
  if (!project) notFound();

  const db = getDb();
  const contributorsCount = (
    db
      .prepare("SELECT COUNT(*) as c FROM contributors WHERE project_id = ?")
      .get(projectId) as { c: number }
  ).c;
  const mediaCount = (
    db
      .prepare("SELECT COUNT(*) as c FROM media WHERE project_id = ?")
      .get(projectId) as { c: number }
  ).c;
  const payments = db
    .prepare("SELECT * FROM orders_payments WHERE project_id = ? ORDER BY created_at DESC")
    .all(projectId) as unknown as OrderPaymentRecord[];

  const statusLabel =
    PROJECT_STATUS_STEPS.find((s) => s.key === project.project_status)
      ?.label || project.project_status;

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
        <span className="inline-block px-3 py-1 rounded-full bg-[#F1EFE9] text-xs font-medium text-[#77746F] mb-2">
          {statusLabel}
        </span>
        <h1 className="font-editorial text-3xl text-[#202020]">
          {project.deceased_full_name}
        </h1>
        <p className="text-sm text-[#77746F] mt-1">
          Family owner: {project.owner_name} ({project.owner_email}) • Package:{" "}
          {FILM_DURATION_LABELS[project.film_duration_tier]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E8E6E0] rounded-xl p-4">
          <p className="text-xs text-[#77746F]">Contributors</p>
          <p className="font-editorial text-2xl mt-1">{contributorsCount}</p>
        </div>
        <div className="bg-white border border-[#E8E6E0] rounded-xl p-4">
          <p className="text-xs text-[#77746F]">Uploaded Memories</p>
          <p className="font-editorial text-2xl mt-1">{mediaCount}</p>
        </div>
        <div className="bg-white border border-[#E8E6E0] rounded-xl p-4">
          <p className="text-xs text-[#77746F]">Private Media Access</p>
          <p className="text-xs text-[#77746F] mt-1.5">
            Family uploads remain private to the family and Jukira production.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShareLinkCard
          projectId={project.id}
          secureToken={project.secure_token}
          deceasedName={project.deceased_preferred_name}
        />

        <div className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
          <h3 className="font-editorial text-xl text-[#202020]">
            Wholesale Pricing &amp; Invoices
          </h3>
          {payments.length === 0 ? (
            <p className="text-sm text-[#77746F]">No invoices recorded.</p>
          ) : (
            <div className="divide-y divide-[#E8E6E0] text-sm">
              {payments.map((pay) => (
                <div
                  key={pay.id}
                  className="py-3 flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-medium text-[#202020]">
                      {pay.package_label}
                    </p>
                    <p className="text-xs text-[#77746F]">
                      Invoice {pay.invoice_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(pay.amount, pay.currency)}
                    </p>
                    <span className="text-[11px] text-[#77746F]">
                      {pay.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
