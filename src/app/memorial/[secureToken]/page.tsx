import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { LegaseeLogo } from "@/components/LegaseeLogo";
import { MemorialGuestbook } from "@/components/MemorialGuestbook";
import { createExpiringDownloadToken } from "@/lib/storage";
import type {
  MediaRecord,
  MemorialMessageRecord,
  MemorialMilestone,
  MemorialWebsiteRecord,
  ProductionJobRecord,
} from "@/lib/types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DedicatedMemorialWebsitePage({
  params,
}: {
  params: Promise<{ secureToken: string }>;
}) {
  ensureSeeded();
  const { secureToken } = await params;
  const db = getDb();

  const project = db
    .prepare(
      `SELECT p.*, fh.white_label_enabled, fh.white_label_name, fh.business_name
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
        project_status: string;
        white_label_enabled: number | null;
        white_label_name: string | null;
        business_name: string | null;
      }
    | undefined;

  if (!project) notFound();

  const website = db
    .prepare("SELECT * FROM memorial_websites WHERE project_id = ?")
    .get(project.id) as unknown as MemorialWebsiteRecord | undefined;

  if (!website || !website.enabled) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-[#E8E6E0] rounded-2xl p-8 space-y-4">
          <h1 className="font-editorial text-2xl text-[#202020]">
            Memorial Website Not Active
          </h1>
          <p className="text-sm text-[#77746F]">
            The family has not activated the dedicated memorial website for{" "}
            {project.deceased_full_name} yet, or its hosting period has ended.
          </p>
          <Link
            href={`/contribute/${secureToken}`}
            className="inline-flex px-6 py-2.5 rounded-full bg-[#242424] text-white text-xs font-medium"
          >
            Go to Memory Contribution Page
          </Link>
        </div>
      </div>
    );
  }

  let milestones: MemorialMilestone[] = [];
  try {
    milestones = JSON.parse(website.milestones_json || "[]");
  } catch {
    milestones = [];
  }

  const photos = db
    .prepare(
      `SELECT * FROM media
       WHERE project_id = ? AND file_type = 'IMAGE' AND approval_status = 'APPROVED'
       ORDER BY created_at ASC`
    )
    .all(project.id) as unknown as MediaRecord[];

  const job = db
    .prepare("SELECT * FROM production_jobs WHERE project_id = ?")
    .get(project.id) as unknown as ProductionJobRecord | undefined;

  const messages = db
    .prepare(
      `SELECT mm.*, m.file_type as attachment_type
       FROM memorial_messages mm
       LEFT JOIN media m ON m.id = mm.attachment_media_id
       WHERE mm.project_id = ? AND mm.status = 'APPROVED'
       ORDER BY mm.created_at DESC`
    )
    .all(project.id) as unknown as (MemorialMessageRecord & {
    attachment_type: string | null;
  })[];

  const displayMessages = messages.map((m) => {
    const attachmentUrl = m.attachment_media_id
      ? `/api/media/${m.attachment_media_id}/file?token=${encodeURIComponent(
          createExpiringDownloadToken(
            {
              projectId: project.id,
              kind: "media",
              targetId: m.attachment_media_id,
            },
            3600
          )
        )}`
      : null;
    return {
      ...m,
      attachmentUrl,
      attachmentType: m.attachment_type,
    };
  });

  const brandName =
    project.white_label_enabled &&
    (project.white_label_name || project.business_name)
      ? project.white_label_name || project.business_name
      : null;

  const birthYear = project.date_of_birth
    ? project.date_of_birth.slice(0, 4)
    : "";
  const passYear = project.date_of_passing
    ? project.date_of_passing.slice(0, 4)
    : "";

  const filmReady =
    project.project_status === "FINAL_FILM_DELIVERED" &&
    job?.review_status === "PASSED" &&
    job?.output_file_key;

  const filmToken = filmReady
    ? createExpiringDownloadToken({ projectId: project.id, kind: "film" }, 3600)
    : null;

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202020] flex flex-col">
      <header className="bg-white border-b border-[#E8E6E0] px-5 sm:px-8 h-16 flex items-center justify-between">
        {brandName ? (
          <span className="font-editorial text-lg font-medium text-[#202020]">
            {brandName}
          </span>
        ) : (
          <LegaseeLogo href="/" size="sm" />
        )}
        <Link
          href={`/contribute/${secureToken}`}
          className="px-4 py-1.5 rounded-full border border-[#E8E6E0] text-xs font-medium hover:bg-[#F1EFE9]"
        >
          Share Photos &amp; Videos
        </Link>
      </header>

      <main className="flex-1">
        {/* Welcome Hero */}
        <section className="py-14 sm:py-20 px-5 sm:px-8 bg-[#F1EFE9] border-b border-[#E8E6E0]">
          <div className="max-w-3xl mx-auto text-center">
            {project.main_photo_url && (
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-white shadow-xs mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.main_photo_url}
                  alt={project.deceased_full_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
              In Loving Memory
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[#202020]">
              {project.deceased_full_name}
            </h1>
            {(birthYear || passYear) && (
              <p className="mt-2 text-sm text-[#77746F] tracking-widest">
                {birthYear} – {passYear}
              </p>
            )}
            {website.welcome_message && (
              <p className="mt-6 text-base sm:text-lg text-[#77746F] leading-relaxed max-w-2xl mx-auto">
                {website.welcome_message}
              </p>
            )}
          </div>
        </section>

        {/* Story */}
        {website.life_story && (
          <section className="py-14 px-5 sm:px-8 max-w-3xl mx-auto">
            <h2 className="font-editorial text-3xl text-[#202020] mb-4">
              {project.deceased_preferred_name}&rsquo;s Story
            </h2>
            <p className="text-base text-[#77746F] leading-relaxed whitespace-pre-line">
              {website.life_story}
            </p>
          </section>
        )}

        {/* Milestones & Achievements */}
        {milestones.length > 0 && (
          <section className="py-14 px-5 sm:px-8 bg-[#F1EFE9] border-y border-[#E8E6E0]">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-editorial text-3xl text-[#202020] mb-8 text-center">
                Milestones &amp; Achievements
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {milestones.map((ms, idx) => (
                  <div
                    key={`${ms.year}-${idx}`}
                    className="bg-white border border-[#E8E6E0] rounded-2xl p-6"
                  >
                    <p className="text-xs font-medium uppercase tracking-widest text-[#B6A995]">
                      {ms.year}
                    </p>
                    <h3 className="font-editorial text-xl text-[#202020] mt-1">
                      {ms.title}
                    </h3>
                    <p className="text-sm text-[#77746F] mt-2 leading-relaxed">
                      {ms.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Memorial Film */}
        <section className="py-14 px-5 sm:px-8 max-w-4xl mx-auto">
          <h2 className="font-editorial text-3xl text-[#202020] mb-4">
            Memorial Film
          </h2>
          {filmReady && filmToken ? (
            <video
              src={`/api/projects/${project.id}/film?token=${encodeURIComponent(
                filmToken
              )}`}
              controls
              className="w-full rounded-2xl border border-[#E8E6E0] bg-black max-h-[480px]"
            />
          ) : (
            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-8 text-center text-sm text-[#77746F]">
              The family’s memorial film is currently being prepared and will
              appear here once completed.
            </div>
          )}
        </section>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <section className="py-14 px-5 sm:px-8 bg-[#F1EFE9] border-y border-[#E8E6E0]">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-editorial text-3xl text-[#202020] mb-8 text-center">
                Photo Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {photos.map((photo) => {
                  const token = createExpiringDownloadToken(
                    {
                      projectId: project.id,
                      kind: "media",
                      targetId: photo.id,
                    },
                    3600
                  );
                  return (
                    <div
                      key={photo.id}
                      className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden"
                    >
                      <div className="aspect-[4/3] bg-[#F8F7F3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/media/${photo.id}/file?token=${encodeURIComponent(
                            token
                          )}`}
                          alt={photo.caption || photo.original_filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {(photo.caption ||
                        photo.event_date ||
                        photo.event_location) && (
                        <div className="p-4">
                          {photo.caption && (
                            <p className="text-sm text-[#202020]">
                              {photo.caption}
                            </p>
                          )}
                          {(photo.event_date || photo.event_location) && (
                            <p className="text-xs text-[#77746F] mt-1">
                              {[photo.event_date, photo.event_location]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Messages & Memories */}
        <section className="py-14 px-5 sm:px-8 max-w-3xl mx-auto">
          <h2 className="font-editorial text-3xl text-[#202020] mb-2">
            Messages &amp; Memories
          </h2>
          <p className="text-sm text-[#77746F] mb-6">
            Share a memory, story, or update for {project.deceased_preferred_name}
            ’s family.
          </p>
          <MemorialGuestbook
            secureToken={secureToken}
            initialMessages={displayMessages}
          />
        </section>
      </main>
    </div>
  );
}
