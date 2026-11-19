import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface GardenRow {
  id: string;
  secure_token: string;
  project_type: "PERSON" | "PET";
  deceased_full_name: string;
  date_of_birth: string | null;
  date_of_passing: string | null;
  main_photo_url: string | null;
  garden_location: string | null;
  garden_tribute: string | null;
}

export default async function MemorialGardenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  ensureSeeded();
  const user = await getSession();
  const sp = await searchParams;
  const query = (sp.q || "").trim().toLowerCase();
  const typeFilter = sp.type === "PET" || sp.type === "PERSON" ? sp.type : "ALL";

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT p.id, p.secure_token, p.project_type, p.deceased_full_name,
              p.date_of_birth, p.date_of_passing, p.main_photo_url,
              w.garden_location, w.garden_tribute
       FROM projects p
       JOIN memorial_websites w ON w.project_id = p.id
       WHERE w.enabled = 1 AND w.listed_in_garden = 1
       ORDER BY p.created_at DESC`
    )
    .all() as unknown as GardenRow[];

  const filtered = rows.filter((r) => {
    if (typeFilter !== "ALL" && r.project_type !== typeFilter) return false;
    if (!query) return true;
    return (
      r.deceased_full_name.toLowerCase().includes(query) ||
      (r.garden_location || "").toLowerCase().includes(query) ||
      (r.garden_tribute || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#202020]">
      <Navbar user={user} />

      <main className="flex-1 py-14 sm:py-20 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
              Global Memorial Garden
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl text-[#202020]">
              Lives remembered, around the world.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#77746F] leading-relaxed">
              A quiet, opt-in remembrance garden of dedicated memorial websites
              shared by families across the globe.
            </p>
          </div>

          {/* Search & Filter */}
          <form className="max-w-2xl mx-auto mb-12 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#77746F] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="q"
                defaultValue={sp.q || ""}
                placeholder="Search by name, city, or country..."
                className="w-full pl-10 pr-4 py-3 rounded-full border border-[#E8E6E0] bg-white text-sm focus:outline-none focus:border-[#242424]"
              />
            </div>
            <select
              name="type"
              defaultValue={typeFilter}
              className="px-4 py-3 rounded-full border border-[#E8E6E0] bg-white text-sm"
            >
              <option value="ALL">All Memorials</option>
              <option value="PERSON">Loved Ones</option>
              <option value="PET">Beloved Pets</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
            >
              Search
            </button>
          </form>

          {filtered.length === 0 ? (
            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-10 text-center text-sm text-[#77746F] max-w-xl mx-auto">
              No memorials match your search yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => {
                const birth = item.date_of_birth
                  ? item.date_of_birth.slice(0, 4)
                  : "";
                const pass = item.date_of_passing
                  ? item.date_of_passing.slice(0, 4)
                  : "";
                return (
                  <Link
                    key={item.id}
                    href={`/memorial/${item.secure_token}`}
                    className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden hover:border-[#B6A995] transition-colors flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-[#F1EFE9] relative">
                      {item.main_photo_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.main_photo_url}
                          alt={item.deceased_full_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.project_type === "PET" && (
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 text-[11px] font-medium text-[#202020]">
                          Pet Memorial
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h2 className="font-editorial text-2xl text-[#202020]">
                          {item.deceased_full_name}
                        </h2>
                        {(birth || pass) && (
                          <p className="text-xs text-[#77746F] mt-0.5">
                            {birth} – {pass}
                          </p>
                        )}
                        {item.garden_tribute && (
                          <p className="text-sm text-[#77746F] mt-3 leading-relaxed">
                            {item.garden_tribute}
                          </p>
                        )}
                      </div>
                      <div className="pt-3 border-t border-[#E8E6E0] flex items-center justify-between text-xs text-[#77746F]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#B6A995]" />
                          {item.garden_location || "Worldwide"}
                        </span>
                        <span className="text-[#202020] font-medium">
                          Visit Memorial →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
