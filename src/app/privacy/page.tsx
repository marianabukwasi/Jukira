import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export default async function PrivacyPage() {
  ensureSeeded();
  const user = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#202020]">
      <Navbar user={user} />
      <main className="flex-1 py-14 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto bg-white border border-[#E8E6E0] rounded-2xl p-8 sm:p-10 space-y-6 text-sm text-[#77746F] leading-relaxed">
          <h1 className="font-editorial text-3xl text-[#202020]">
            Privacy Policy
          </h1>
          <p>
            Jukira processes personal data, photographs, and videos solely to
            produce private memorial films for authorised families and partner
            funeral homes, in accordance with GDPR principles.
          </p>
          <section className="space-y-2">
            <h2 className="font-editorial text-xl text-[#202020]">
              1. Private Storage &amp; Access
            </h2>
            <p>
              All uploaded photographs and videos are stored in private,
              access-controlled storage. Memorial projects are never published
              to public feeds or search engines.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-editorial text-xl text-[#202020]">
              2. Retention &amp; Deletion
            </h2>
            <p>
              Original working files are retained temporarily for film
              production and the disclosed download window, after which they are
              permanently deleted unless the family chooses an optional ongoing
              cloud archive subscription.
            </p>
          </section>
          <section id="cookies" className="space-y-2">
            <h2 className="font-editorial text-xl text-[#202020]">
              3. Cookie Preferences
            </h2>
            <p>
              Jukira uses essential, HTTP-only session cookies solely for
              secure authentication and role-based access control. We do not use
              third-party advertising trackers.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
