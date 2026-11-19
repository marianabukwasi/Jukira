import Link from "next/link";
import { Flower2, MapPin, ShieldCheck } from "lucide-react";
import type { DigitalFlowerRecord, MemorialPlotRecord } from "@/lib/types";

function getFlowerFreshness(placedAt: string): {
  opacityClass: string;
  label: string;
} {
  const days = Math.floor(
    (Date.now() - new Date(placedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 10) return { opacityClass: "opacity-100", label: "Fresh" };
  if (days <= 20) return { opacityClass: "opacity-80", label: `${days}d ago` };
  if (days <= 30)
    return { opacityClass: "opacity-55 grayscale-[35%]", label: "Withering" };
  return { opacityClass: "opacity-40 grayscale-[70%]", label: "Faded (30d+)" };
}

export function HeadstoneCard({
  plot,
  flowers = [],
  href,
  compact = false,
}: {
  plot: MemorialPlotRecord;
  flowers?: DigitalFlowerRecord[];
  href?: string;
  compact?: boolean;
}) {
  const stoneStyles =
    plot.headstone_color === "Charcoal Granite"
      ? "bg-[#2C2C2A] text-[#F8F7F3] border-[#3F3F3C]"
      : plot.headstone_color === "Ivory Marble"
      ? "bg-[#FAF9F6] text-[#202020] border-[#DFDDD6]"
      : "bg-[#EFECE4] text-[#202020] border-[#D8D3C6]";

  const subTextColor =
    plot.headstone_color === "Charcoal Granite"
      ? "text-[#C5C2BA]"
      : "text-[#77746F]";

  const birthYear = plot.date_of_birth ? plot.date_of_birth.slice(0, 4) : "";
  const deathYear = plot.date_of_death ? plot.date_of_death.slice(0, 4) : "";

  const isArch = plot.headstone_style.includes("Arch");

  const card = (
    <div
      className={`border shadow-sm transition-all ${stoneStyles} ${
        isArch ? "rounded-t-[48px] rounded-b-xl" : "rounded-2xl"
      } ${compact ? "p-5" : "p-7 sm:p-9"} text-center flex flex-col items-center`}
    >
      {plot.photo_url && (
        <div
          className={`${
            compact ? "w-16 h-16" : "w-24 h-24"
          } rounded-full overflow-hidden border-2 border-[#B6A995]/70 mb-4 bg-[#F1EFE9]`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={plot.photo_url}
            alt={plot.deceased_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {plot.family_plot_name && (
        <p className={`text-[10px] uppercase tracking-[0.2em] mb-1 ${subTextColor}`}>
          {plot.family_plot_name}
        </p>
      )}

      <h3
        className={`font-editorial ${
          compact ? "text-xl" : "text-2xl sm:text-3xl"
        } leading-snug`}
      >
        {plot.deceased_name}
      </h3>

      {(birthYear || deathYear) && (
        <p className={`text-xs tracking-widest mt-1 ${subTextColor}`}>
          {birthYear} – {deathYear}
        </p>
      )}

      <p
        className={`mt-3 text-xs sm:text-sm italic max-w-xs leading-relaxed ${subTextColor}`}
      >
        &ldquo;{plot.inscription}&rdquo;
      </p>

      {/* Digital Flowers placed at the base */}
      {flowers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-current/10 w-full flex flex-wrap items-center justify-center gap-2">
          {flowers.slice(0, compact ? 3 : 6).map((f) => {
            const fresh = getFlowerFreshness(f.placed_at);
            return (
              <span
                key={f.id}
                title={`${f.flower_type}${
                  f.is_anonymous
                    ? " (Anonymous)"
                    : f.sender_name
                    ? ` from ${f.sender_name}`
                    : ""
                } • ${fresh.label}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 text-[#202020] text-[11px] border border-[#E8E6E0] ${fresh.opacityClass}`}
              >
                <Flower2 className="w-3 h-3 text-[#718875]" />
                <span>{f.flower_type}</span>
              </span>
            );
          })}
        </div>
      )}

      <div
        className={`mt-4 pt-3 border-t border-current/10 w-full flex flex-wrap items-center justify-between gap-2 text-[10px] ${subTextColor}`}
      >
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {plot.country} • {plot.section_name}
        </span>
        <span className="inline-flex items-center gap-1 font-mono">
          {plot.verification_status === "PARTNER_VERIFIED" && (
            <ShieldCheck className="w-3 h-3 text-[#718875]" />
          )}
          {plot.plot_reference}
        </span>
      </div>
    </div>
  );

  if (!href) return card;
  return (
    <Link href={href} className="block hover:-translate-y-0.5 transition-transform">
      {card}
    </Link>
  );
}
