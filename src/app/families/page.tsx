import Link from "next/link";
import { Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LocationPricingCard } from "@/components/LocationPricingCard";
import { getSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { getAllPricingConfigs } from "@/lib/pricing";

export default async function FamiliesPage() {
  ensureSeeded();
  const user = await getSession();
  const configs = getAllPricingConfigs();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#202020]">
      <Navbar user={user} />
      <main className="flex-1 py-14 sm:py-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
              For Families
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl text-[#202020]">
              For the people who want to keep their memories close.
            </h1>
            <p className="mt-4 text-base text-[#77746F] leading-relaxed">
              A memorial film can be started before or after the funeral, giving
              family and friends time to gather photographs and videos from
              every chapter of a person’s life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-8">
              <h2 className="font-editorial text-2xl mb-4">What is included</h2>
              <ul className="space-y-3 text-sm text-[#77746F]">
                {[
                  "Private contribution link with optional closing date",
                  "Unlimited contributor invites without account registration",
                  "Private family review gallery with Approve All option",
                  "AI-assisted chronological or thematic organisation",
                  "Human quality review before delivery",
                  "Downloadable high-definition memorial film",
                  "Optional raw footage archive & monthly cloud preservation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#718875] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <LocationPricingCard configs={configs} mode="family" />
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex px-8 py-3.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
            >
              Create a Family Project
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
