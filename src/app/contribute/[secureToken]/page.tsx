import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Heart } from "lucide-react";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { LegaseeLogo } from "@/components/LegaseeLogo";

export default async function ContributeLandingPage({
  params,
}: {
  params: Promise<{ secureToken: string }>;
}) {
  ensureSeeded();
  const { secureToken } = await params;
  const db = getDb();

  const project = db
    .prepare(
      `SELECT p.id, p.secure_token, p.deceased_full_name, p.deceased_preferred_name,
              p.date_of_birth, p.date_of_passing, p.main_photo_url, p.closing_date,
              p.project_status,
              fh.white_label_enabled, fh.white_label_name, fh.business_name
       FROM projects p
       LEFT JOIN funeral_homes fh ON fh.id = p.funeral_home_id
       WHERE p.secure_token = ?`
    )
    .get(secureToken) as
    | {
        id: string;
        secure_token: string;
        deceased_full_name: string;
        deceased_preferred_name: string;
        date_of_birth: string | null;
        date_of_passing: string | null;
        main_photo_url: string | null;
        closing_date: string | null;
        project_status: string;
        white_label_enabled: number | null;
        white_label_name: string | null;
        business_name: string | null;
      }
    | undefined;

  if (!project) {
    notFound();
  }

  const brandName =
    project.white_label_enabled && (project.white_label_name || project.business_name)
      ? project.white_label_name || project.business_name
      : null;

  const isClosed =
    project.project_status !== "COLLECTING_CONTRIBUTIONS" &&
    project.project_status !== "PROJECT_CREATED";

  const birthYear = project.date_of_birth
    ? project.date_of_birth.slice(0, 4)
    : null;
  const passYear = project.date_of_passing
    ? project.date_of_passing.slice(0, 4)
    : null;

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202020] flex flex-col">
      <header className="border-b border-[#E8E6E0] bg-[#F8F7F3] px-5 py-4 flex items-center justify-center">
        {brandName ? (
          <span className="font-editorial text-xl font-medium text-[#202020]">
            {brandName}
          </span>
        ) : (
          <LegaseeLogo href="/" size="md" />
        )}
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="max-w-lg w-full bg-white border border-[#E8E6E0] rounded-2xl p-7 sm:p-10 text-center shadow-xs">
          {project.main_photo_url && (
            <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-2 border-[#E8E6E0] mb-6 bg-[#F1EFE9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.main_photo_url}
                alt={project.deceased_full_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
            Private Memory Collection
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#202020] leading-tight">
            Help us celebrate the life of {project.deceased_preferred_name}.
          </h1>

          {(birthYear || passYear) && (
            <p className="mt-2 text-sm text-[#77746F]">
              {project.deceased_full_name}
              {birthYear && passYear ? ` • ${birthYear} – ${passYear}` : ""}
            </p>
          )}

          <p className="mt-5 text-sm sm:text-base text-[#77746F] leading-relaxed">
            Do you have photographs or videos of {project.deceased_preferred_name}
            ? Share them with the family as part of a collection of memories
            celebrating their life.
          </p>

          {project.closing_date && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F1EFE9] text-xs text-[#77746F]">
              <Calendar className="w-3.5 h-3.5 text-[#B6A995]" />
              <span>
                Contributions open until{" "}
                {new Date(project.closing_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          <div className="mt-8">
            {isClosed ? (
              <div className="p-4 rounded-xl bg-[#F1EFE9] text-sm text-[#77746F]">
                This collection is now closed for new uploads as the family’s
                film is in production.
              </div>
            ) : (
              <Link
                href={`/contribute/${project.secure_token}/upload`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#242424] text-white text-base font-medium hover:bg-[#383838] transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Share Your Memories</span>
              </Link>
            )}
          </div>

          <p className="mt-6 text-xs text-[#77746F]">
            No account or app download is needed. Your original files are kept
            privately for the family.
          </p>
        </div>
      </main>
    </div>
  );
}
