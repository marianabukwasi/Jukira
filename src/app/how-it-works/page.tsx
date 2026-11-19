import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export default async function HowItWorksPage() {
  ensureSeeded();
  const user = await getSession();

  const steps = [
    {
      num: "01",
      title: "Create a private memorial project",
      body: "Enter the person's name, optional dates, a main photograph, and choose your preferred finished film duration. Jukira generates a private, secure contribution link.",
    },
    {
      num: "02",
      title: "Share the link with family and friends",
      body: "Send the link via WhatsApp, email, or a printed QR code. Relatives and friends open it directly on their phone — no account, password, or app download needed.",
    },
    {
      num: "03",
      title: "Collect photographs and videos across decades",
      body: "Contributors add photos and videos from childhood, friendships, weddings, and everyday life, with optional dates or short context and footage enhancement preferences.",
    },
    {
      num: "04",
      title: "AI-assisted organisation and human quality review",
      body: "Our production team organises the material chronologically or thematically, removes duplicates, applies requested enhancements, and verifies every frame through human quality control.",
    },
    {
      num: "05",
      title: "Watch, download, and preserve",
      body: "The family receives the finished MP4 film to watch and download forever, with optional raw footage download and ongoing cloud archive storage.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#202020]">
      <Navbar user={user} />
      <main className="flex-1 py-14 sm:py-20 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B6A995] font-medium mb-2">
              How It Works
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl text-[#202020]">
              From scattered memories to a lasting film.
            </h1>
            <p className="mt-4 text-base text-[#77746F] max-w-2xl mx-auto">
              Jukira is designed so even less technical relatives can
              contribute effortlessly, while families and funeral homes remain
              in complete control.
            </p>
          </div>

          <div className="space-y-5">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-white border border-[#E8E6E0] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-5"
              >
                <span className="font-editorial text-2xl text-[#B6A995] shrink-0">
                  {s.num}
                </span>
                <div>
                  <h2 className="font-editorial text-xl sm:text-2xl text-[#202020] mb-2">
                    {s.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#77746F] leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
            >
              Create a Legacy Film
            </Link>
            <Link
              href="/contribute/margaret-vance-memories"
              className="px-7 py-3.5 rounded-full bg-white border border-[#E8E6E0] text-[#202020] text-sm font-medium hover:bg-[#F1EFE9]"
            >
              Preview Contributor Experience
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
