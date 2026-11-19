"use client";

import Link from "next/link";
import { Check, Film, HeartHandshake, Link2, Sparkles } from "lucide-react";
import { HeroSequence } from "./HeroSequence";
import { SampleFilmPlayer } from "./SampleFilmPlayer";
import { Home3DShowcase } from "./Home3DShowcase";
import { LocationPricingCard } from "./LocationPricingCard";
import { useLanguage } from "./LanguageContext";
import type {
  DigitalFlowerRecord,
  MemorialPlotRecord,
  PricingConfigRecord,
} from "@/lib/types";

interface ShowcaseItem {
  plot: MemorialPlotRecord;
  flowers: DigitalFlowerRecord[];
  secureToken: string;
}

export function HomeContent({
  configs,
  showcasePlots,
}: {
  configs: PricingConfigRecord[];
  showcasePlots: ShowcaseItem[];
}) {
  const { t } = useLanguage();

  return (
    <main className="flex-1">
      {/* 3.2 Hero Section */}
      <section className="pt-10 pb-16 sm:pt-14 sm:pb-20 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[54px] font-medium leading-[1.12] text-[#202020]">
              {t.heroTitle}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#77746F] leading-relaxed max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] transition-colors"
              >
                {t.heroCtaPrimary}
              </Link>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F1EFE9] transition-colors"
              >
                {t.heroCtaSecondary}
              </Link>
              <Link
                href="#pricing"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F1EFE9] transition-colors"
              >
                {t.navPricing}
              </Link>
            </div>
          </div>

          <HeroSequence />
        </div>
      </section>

      {/* 3.3 Emotional Introduction */}
      <section
        id="about"
        className="py-16 sm:py-24 px-5 sm:px-8 bg-[#F1EFE9] border-y border-[#E8E6E0]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
              {t.introTitle}
            </h2>
            <p className="mt-4 text-base text-[#77746F] leading-relaxed">
              {t.introSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                src: "/images/stage-childhood.png",
                label: "Childhood & Early Years",
              },
              {
                src: "/images/stage-young-adult.png",
                label: "Young Adulthood",
              },
              {
                src: "/images/stage-wedding.png",
                label: "Love & Milestones",
              },
              {
                src: "/images/stage-friends.png",
                label: "Lifelong Friendships",
              },
              {
                src: "/images/stage-family.png",
                label: "Family Gatherings",
              },
              {
                src: "/images/stage-grandparent.png",
                label: "Generations Together",
              },
              {
                src: "/images/stage-pet-dog.png",
                label: "Beloved Dogs",
              },
              {
                src: "/images/stage-pet-cat.png",
                label: "Cherished Pets",
              },
            ].map((item) => (
              <div
                key={item.src}
                className="bg-white rounded-xl overflow-hidden border border-[#E8E6E0]"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="px-3.5 py-3 text-xs sm:text-sm font-medium text-[#202020]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.4 How It Works */}
      <section className="py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-[#77746F] mb-2">
              {t.howEyebrow}
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
              {t.howTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-7">
              <div className="w-10 h-10 rounded-full bg-[#F1EFE9] flex items-center justify-center text-[#202020] mb-5">
                <Link2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#B6A995] mb-1">
                1
              </p>
              <h3 className="font-editorial text-xl text-[#202020] mb-2.5">
                {t.step1Title}
              </h3>
              <p className="text-sm text-[#77746F] leading-relaxed">
                {t.step1Body}
              </p>
            </div>

            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-7">
              <div className="w-10 h-10 rounded-full bg-[#F1EFE9] flex items-center justify-center text-[#202020] mb-5">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#B6A995] mb-1">
                2
              </p>
              <h3 className="font-editorial text-xl text-[#202020] mb-2.5">
                {t.step2Title}
              </h3>
              <p className="text-sm text-[#77746F] leading-relaxed">
                {t.step2Body}
              </p>
            </div>

            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-7">
              <div className="w-10 h-10 rounded-full bg-[#F1EFE9] flex items-center justify-center text-[#202020] mb-5">
                <Film className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#B6A995] mb-1">
                3
              </p>
              <h3 className="font-editorial text-xl text-[#202020] mb-2.5">
                {t.step3Title}
              </h3>
              <p className="text-sm text-[#77746F] leading-relaxed">
                {t.step3Body}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Sample Film Section */}
      <section className="py-16 sm:py-24 px-5 sm:px-8 bg-[#F1EFE9] border-y border-[#E8E6E0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
              {t.sampleTitle}
            </h2>
            <p className="mt-3 text-base text-[#77746F]">
              {t.sampleSubtitle}
            </p>
          </div>
          <SampleFilmPlayer />
        </div>
      </section>

      {/* 3D Memorial Gardens Showcase */}
      <section className="py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
              {t.gardenEyebrow}
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
              {t.gardenTitle}
            </h2>
            <p className="mt-3 text-base text-[#77746F]">
              {t.gardenSubtitle}
            </p>
          </div>
          <Home3DShowcase items={showcasePlots} />
        </div>
      </section>

      {/* Family, Pet Memorial & Funeral Home Sections */}
      <section className="py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white border border-[#E8E6E0] rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
                {t.familiesEyebrow}
              </p>
              <h2 className="font-editorial text-2xl text-[#202020] mb-4">
                {t.familiesTitle}
              </h2>
              <ul className="space-y-2.5 text-sm text-[#77746F] mb-8">
                {[
                  "Invite relatives and friends with a private link",
                  "Collect photographs and videos from every decade",
                  "Review submitted material in a calm private gallery",
                  "Includes virtual headstone & 2-minute tribute video",
                  "Receive and download the finished MP4 film",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#718875] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] transition-colors"
              >
                {t.familiesCta}
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#E8E6E0] rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/stage-pet-dog.png"
                  alt="Golden retriever in a family garden"
                  className="w-full h-24 object-cover rounded-xl border border-[#E8E6E0]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/stage-pet-cat.png"
                  alt="Gentle cat resting on a sunlit porch"
                  className="w-full h-24 object-cover rounded-xl border border-[#E8E6E0]"
                />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
                {t.petsEyebrow}
              </p>
              <h2 className="font-editorial text-2xl text-[#202020] mb-4">
                {t.petsTitle}
              </h2>
              <p className="text-sm text-[#77746F] mb-5 leading-relaxed">
                {t.petsBody}
              </p>
            </div>
            <div>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] transition-colors"
              >
                {t.petsCta}
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#E8E6E0] rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
                <HeartHandshake className="w-4 h-4" />
                <span>{t.partnersEyebrow}</span>
              </div>
              <h2 className="font-editorial text-2xl text-[#202020] mb-4">
                {t.partnersTitle}
              </h2>
              <p className="text-sm text-[#77746F] mb-5 leading-relaxed">
                {t.partnersBody}
              </p>
              <ul className="space-y-2.5 text-sm text-[#77746F] mb-8">
                {[
                  "Partner-verified memorial submissions",
                  "Simple contribution process via WhatsApp or email",
                  "Optional white-label branding for your funeral home",
                  "No need to operate your own video production team",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#718875] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Link
                href="/funeral-homes"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[#242424] text-[#202020] text-sm font-medium hover:bg-[#F1EFE9] transition-colors"
              >
                {t.partnersCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-16 sm:py-24 px-5 sm:px-8 bg-[#F1EFE9] border-t border-[#E8E6E0]"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
              {t.pricingEyebrow}
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
              {t.pricingTitle}
            </h2>
          </div>
          <LocationPricingCard configs={configs} mode="family" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-5 sm:px-8 bg-[#F1EFE9] border-t border-[#E8E6E0]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
            {t.finalTitle}
          </h2>
          <p className="mt-4 text-base text-[#77746F]">{t.finalSubtitle}</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] transition-colors"
            >
              {t.heroCtaPrimary}
            </Link>
            <Link
              href="/contribute/margaret-vance-memories"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F8F7F3] transition-colors"
            >
              {t.finalSampleContrib}
            </Link>
            <Link
              href="/memorial/margaret-vance-memories"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F8F7F3] transition-colors"
            >
              {t.finalSampleWeb}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
