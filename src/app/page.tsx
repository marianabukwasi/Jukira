import Link from "next/link";
import { Check, Film, HeartHandshake, Link2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSequence } from "@/components/HeroSequence";
import { SampleFilmPlayer } from "@/components/SampleFilmPlayer";
import { LocationPricingCard } from "@/components/LocationPricingCard";
import { Home3DShowcase } from "@/components/Home3DShowcase";
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

      <main className="flex-1">
        {/* 3.2 Hero Section */}
        <section className="pt-10 pb-16 sm:pt-14 sm:pb-20 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[54px] font-medium leading-[1.12] text-[#202020]">
                A lifetime of memories. A legacy worth preserving.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-[#77746F] leading-relaxed max-w-2xl mx-auto">
                Bring together photographs and videos from family and friends,
                and turn them into a beautiful film celebrating the life of
                someone you love.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] transition-colors"
                >
                  Create a Legacy Film
                </Link>
                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F1EFE9] transition-colors"
                >
                  See How It Works
                </Link>
                <Link
                  href="#pricing"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F1EFE9] transition-colors"
                >
                  Pricing
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
                Their story lives in more than one photograph.
              </h2>
              <p className="mt-4 text-base text-[#77746F] leading-relaxed">
                Every person has a lifetime of moments. Some are captured in
                family albums, some on old phones, and others are held by
                friends and relatives around the world. Jukira brings those
                memories together so their story can be celebrated and
                preserved.
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
                Simple by design
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
                How Jukira works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white border border-[#E8E6E0] rounded-2xl p-7">
                <div className="w-10 h-10 rounded-full bg-[#F1EFE9] flex items-center justify-center text-[#202020] mb-5">
                  <Link2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#B6A995] mb-1">
                  Step 1
                </p>
                <h3 className="font-editorial text-xl text-[#202020] mb-2.5">
                  Invite family and friends
                </h3>
                <p className="text-sm text-[#77746F] leading-relaxed">
                  Create a private collection and share its upload link with the
                  people who knew the person. No app download or account
                  required for contributors.
                </p>
              </div>

              <div className="bg-white border border-[#E8E6E0] rounded-2xl p-7">
                <div className="w-10 h-10 rounded-full bg-[#F1EFE9] flex items-center justify-center text-[#202020] mb-5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#B6A995] mb-1">
                  Step 2
                </p>
                <h3 className="font-editorial text-xl text-[#202020] mb-2.5">
                  Bring the memories together
                </h3>
                <p className="text-sm text-[#77746F] leading-relaxed">
                  Everyone can contribute photographs and videos from different
                  stages of the person’s life, straight from their phone or
                  computer.
                </p>
              </div>

              <div className="bg-white border border-[#E8E6E0] rounded-2xl p-7">
                <div className="w-10 h-10 rounded-full bg-[#F1EFE9] flex items-center justify-center text-[#202020] mb-5">
                  <Film className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#B6A995] mb-1">
                  Step 3
                </p>
                <h3 className="font-editorial text-xl text-[#202020] mb-2.5">
                  Create their legacy film
                </h3>
                <p className="text-sm text-[#77746F] leading-relaxed">
                  Jukira organises the material with AI-assisted editing and
                  human quality control to produce a film the family can watch,
                  download and keep.
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
                A life remembered, beautifully brought together.
              </h2>
              <p className="mt-3 text-base text-[#77746F]">
                See how scattered photographs and videos from childhood,
                friendships, marriage and family life are woven into one calm,
                coherent celebration of a life.
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
                Jukira Memorial Gardens
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
                Take a peaceful walk to their resting place.
              </h2>
              <p className="mt-3 text-base text-[#77746F]">
                Walk through landscaped cemetery grounds from anywhere in the
                world, visit their personalised headstone, leave digital flowers,
                and watch their life story.
              </p>
            </div>
            <Home3DShowcase items={showcasePlots} />
          </div>
        </section>

        {/* 3.6 Family, Pet Memorial & 3.7 Funeral Home Sections */}
        <section className="py-16 sm:py-24 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Family */}
            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
                  For Families
                </p>
                <h2 className="font-editorial text-2xl text-[#202020] mb-4">
                  For the people who want to keep their memories close.
                </h2>
                <ul className="space-y-2.5 text-sm text-[#77746F] mb-8">
                  {[
                    "Invite relatives and friends with a private link",
                    "Collect photographs and videos from every decade",
                    "Review submitted material in a calm private gallery",
                    "Choose your desired finished-film length",
                    "Receive and download the finished MP4 film",
                    "Optionally add a dedicated memorial website",
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
                  Create a Family Project
                </Link>
              </div>
            </div>

            {/* Pet Memorials */}
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
                  Pet Memorials
                </p>
                <h2 className="font-editorial text-2xl text-[#202020] mb-4">
                  For beloved pets who were part of the family.
                </h2>
                <p className="text-sm text-[#77746F] mb-5 leading-relaxed">
                  Dogs, cats, and lifelong companions leave just as many
                  everyday moments across family phones. Gather everyone’s
                  favourite photos and videos into a tribute film or slideshow.
                </p>
                <ul className="space-y-2.5 text-sm text-[#77746F] mb-8">
                  {[
                    "Collect clips from family, walkers, and friends",
                    "Photo slideshow or full video & photo tribute film",
                    "Optional dedicated pet memorial website",
                    "Human quality review before delivery",
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
                  Create a Pet Memorial
                </Link>
              </div>
            </div>

            {/* Funeral Homes */}
            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
                  <HeartHandshake className="w-4 h-4" />
                  <span>For Funeral Homes</span>
                </div>
                <h2 className="font-editorial text-2xl text-[#202020] mb-4">
                  Give families another way to celebrate a life.
                </h2>
                <p className="text-sm text-[#77746F] mb-5 leading-relaxed">
                  Offer Jukira as a meaningful service to the families you
                  support. You introduce the service, and Jukira manages the
                  collection, production and delivery.
                </p>
                <ul className="space-y-2.5 text-sm text-[#77746F] mb-8">
                  {[
                    "An additional service to offer families",
                    "A simple contribution process via WhatsApp or email",
                    "Professionally produced memorial films",
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
                  Partner With Jukira
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section on Homepage */}
        <section
          id="pricing"
          className="py-16 sm:py-24 px-5 sm:px-8 bg-[#F1EFE9] border-t border-[#E8E6E0]"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
                Transparent Pricing
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
                Simple packages by format and location.
              </h2>
            </div>
            <LocationPricingCard configs={configs} mode="family" />
          </div>
        </section>

        {/* 3.8 Final CTA */}
        <section className="py-16 sm:py-24 px-5 sm:px-8 bg-[#F1EFE9] border-t border-[#E8E6E0]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#202020]">
              Every life leaves a story. Let’s preserve it.
            </h2>
            <p className="mt-4 text-base text-[#77746F]">
              Start a private memorial collection today, or preview how a
              contributor shares a memory.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] transition-colors"
              >
                Create a Legacy Film
              </Link>
              <Link
                href="/contribute/margaret-vance-memories"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F8F7F3] transition-colors"
              >
                Try Sample Contributor Link
              </Link>
              <Link
                href="/memorial/margaret-vance-memories"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F8F7F3] transition-colors"
              >
                View Sample Memorial Website
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
