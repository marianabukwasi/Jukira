import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CemeteryGrounds } from "@/components/CemeteryGrounds";
import type { DigitalFlowerRecord, MemorialPlotRecord } from "@/lib/types";

export default async function MemorialGardenPage() {
  ensureSeeded();
  const user = await getSession();
  const db = getDb();

  const plots = db
    .prepare(
      `SELECT p.*, pr.secure_token
       FROM memorial_plots p
       LEFT JOIN projects pr ON pr.id = p.project_id
       WHERE p.privacy_level = 'PUBLIC'
         AND p.verification_status IN ('APPROVED', 'PARTNER_VERIFIED')
       ORDER BY p.created_at DESC`
    )
    .all() as (MemorialPlotRecord & { secure_token: string | null })[];

  const flowers = db
    .prepare("SELECT * FROM digital_flowers ORDER BY placed_at DESC")
    .all() as unknown as DigitalFlowerRecord[];

  const plotsWithFlowers = plots.map((plot) => ({
    ...plot,
    flowers: flowers
      .filter((f) => f.plot_id === plot.id)
      .map((f) => ({ ...f })),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#202020]">
      <Navbar user={user} />

      <main className="flex-1 py-12 sm:py-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
              Jukira Memorial Gardens
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl text-[#202020]">
              A peaceful resting place to visit from anywhere.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#77746F] leading-relaxed">
              Explore landscaped garden sections by country, walk the pathways
              to a loved one’s headstone, place digital flowers, and preserve
              their life story.
            </p>
          </div>

          <CemeteryGrounds initialPlots={plotsWithFlowers} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
