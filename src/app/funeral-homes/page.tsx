import Link from "next/link";
import { Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LocationPricingCard } from "@/components/LocationPricingCard";
import { getSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { getAllPricingConfigs } from "@/lib/pricing";

export default async function FuneralHomesPage() {
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
              For Funeral Home Partners
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl text-[#202020]">
              Give families another way to celebrate a life.
            </h1>
            <p className="mt-4 text-base text-[#77746F] leading-relaxed">
              You introduce Jukira to the family and set your own retail
              offering. We handle media collection, AI-assisted organisation,
              human quality review, and final film delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-8">
              <h2 className="font-editorial text-2xl mb-4">
                Partner Portal Capabilities
              </h2>
              <ul className="space-y-3 text-sm text-[#77746F]">
                {[
                  "Create memorial projects for families in under two minutes",
                  "Generate private contribution links & QR codes immediately",
                  "Track contribution progress and production milestones",
                  "View transparent wholesale pricing and invoice status",
                  "Private by design: partners only see their own projects",
                  "No in-house video editing team required",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#718875] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <LocationPricingCard configs={configs} mode="wholesale" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?role=FUNERAL_HOME"
              className="px-7 py-3.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
            >
              Request Partner Account
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F1EFE9]"
            >
              Partner Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
