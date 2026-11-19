import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeContent } from "@/components/HomeContent";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { getAllPricingConfigs } from "@/lib/pricing";
import type { DigitalFlowerRecord, MemorialPlotRecord } from "@/lib/types";

export default async function HomePage() {
  ensureSeeded();
  const user = await getSession();
  const configs = getAllPricingConfigs();
  const db = getDb();
  const showcasePlots = (
    db
      .prepare(
        `SELECT p.*, pr.secure_token
         FROM memorial_plots p
         JOIN projects pr ON pr.id = p.project_id
         WHERE p.privacy_level = 'PUBLIC' AND pr.secure_token IS NOT NULL
         ORDER BY p.created_at ASC
         LIMIT 2`
      )
      .all() as (MemorialPlotRecord & { secure_token: string })[]
  ).map((p) => {
    const flowers = (
      db
        .prepare("SELECT * FROM digital_flowers WHERE plot_id = ?")
        .all(p.id) as unknown as DigitalFlowerRecord[]
    ).map((f) => ({ ...f }));
    return {
      plot: { ...p },
      flowers,
      secureToken: p.secure_token,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#202020]">
      <Navbar user={user} />
      <HomeContent configs={configs} showcasePlots={showcasePlots} />
      <Footer />
    </div>
  );
}
