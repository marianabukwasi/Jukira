import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";
import { DashboardShell } from "@/components/DashboardShell";
import { FamilyProjectNav } from "@/components/FamilyProjectNav";
import { ShareLinkCard } from "@/components/ShareLinkCard";
import { FILM_DURATION_LABELS, PROJECT_STATUS_STEPS } from "@/lib/types";

export default async function FamilyProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  ensureSeeded();
  const user = await requireRole(["FAMILY_OWNER", "ADMIN"]);
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
  const photosCount = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM media WHERE project_id = ? AND file_type = 'IMAGE'"
      )
      .get(projectId) as { c: number }
  ).c;
  const videosCount = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM media WHERE project_id = ? AND file_type = 'VIDEO'"
      )
      .get(projectId) as { c: number }
  ).c;
  const totalVideoSec = (
    db
      .prepare(
        "SELECT COALESCE(SUM(video_duration_sec), 0) as s FROM media WHERE project_id = ? AND file_type = 'VIDEO'"
      )
      .get(projectId) as { s: number }
  ).s;

  const navItems = [
    { href: "/family/dashboard", label: "Dashboard" },
    { href: "/family/projects", label: "My Projects" },
    { href: "/family/projects/new", label: "Create Project" },
  ];

  const currentStepIdx = PROJECT_STATUS_STEPS.findIndex(
    (s) => s.key === project.project_status
  );

  return (
    <DashboardShell user={user} portalLabel="Family Portal" navItems={navItems}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {project.main_photo_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={project.main_photo_url}
              alt={project.deceased_full_name}
              className="w-16 h-16 rounded-full object-cover border border-[#E8E6E0]"
            />
          )}
          <div>
            <h1 className="font-editorial text-3xl text-[#202020]">
              {project.deceased_full_name}
            </h1>
            <p className="text-xs text-[#77746F] mt-1">
              Package: {FILM_DURATION_LABELS[project.film_duration_tier]}
              {project.closing_date
                ? ` • Contributions close ${new Date(
                    project.closing_date
                  ).toLocaleDateString("en-GB")}`
                : ""}
            </p>
          </div>
        </div>
        <Link
          href={`/contribute/${project.secure_token}/upload?owner=${encodeURIComponent(
            user.name
          )}`}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838] self-start"
        >
          Upload Photos &amp; Videos Myself
        </Link>
      </div>

      <FamilyProjectNav projectId={projectId} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Contributors", value: contributorsCount },
          { label: "Photographs", value: photosCount },
          { label: "Videos", value: videosCount },
          {
            label: "Submitted Video",
            value:
              totalVideoSec > 0
                ? `${Math.ceil(totalVideoSec / 60)} min`
                : `${videosCount} clips`,
          },
          {
            label: "Chosen Film Length",
            value: FILM_DURATION_LABELS[project.film_duration_tier],
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#E8E6E0] rounded-xl p-4"
          >
            <p className="text-xs text-[#77746F]">{stat.label}</p>
            <p className="font-editorial text-2xl text-[#202020] mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShareLinkCard
          projectId={project.id}
          secureToken={project.secure_token}
          deceasedName={project.deceased_preferred_name}
        />

        {/* Progress Tracker */}
        <div className="bg-white border border-[#E8E6E0] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-editorial text-xl text-[#202020]">
              Project Progress
            </h3>
            <Link
              href={`/family/projects/${projectId}/production`}
              className="text-xs underline text-[#77746F] hover:text-[#202020]"
            >
              Details
            </Link>
          </div>
          <ol className="space-y-2.5">
            {PROJECT_STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStepIdx;
              const current = idx === currentStepIdx;
              return (
                <li key={step.key} className="flex items-center gap-3 text-sm">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 ${
                      done
                        ? "bg-[#718875] text-white"
                        : "bg-[#F1EFE9] text-[#77746F]"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={
                      current
                        ? "font-medium text-[#202020]"
                        : done
                        ? "text-[#202020]"
                        : "text-[#77746F]"
                    }
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </DashboardShell>
  );
}
