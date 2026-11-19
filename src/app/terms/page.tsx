import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export default async function TermsPage() {
  ensureSeeded();
  const user = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#202020]">
      <Navbar user={user} />
      <main className="flex-1 py-14 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto bg-white border border-[#E8E6E0] rounded-2xl p-8 sm:p-10 space-y-6 text-sm text-[#77746F] leading-relaxed">
          <h1 className="font-editorial text-3xl text-[#202020]">
            Terms and Conditions
          </h1>
          <p>
            These terms govern the use of Jukira by families, funeral home
            partners, and contributors.
          </p>
          <section id="contributor-terms" className="space-y-2">
            <h2 className="font-editorial text-xl text-[#202020]">
              Contributor Submission Terms (v1.0-2026)
            </h2>
            <p>By submitting photographs or videos to a Jukira project, you confirm that:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                You have the right or necessary permission to submit the
                photographs and videos.
              </li>
              <li>
                You authorise Jukira to use the submitted material for the
                production of the memorial film.
              </li>
              <li>
                You understand that the material may be edited, arranged, and
                incorporated into the finished film.
              </li>
              <li>
                You understand that the family or authorised project owner may
                receive the resulting film.
              </li>
            </ul>
          </section>
          <section className="space-y-2">
            <h2 className="font-editorial text-xl text-[#202020]">
              AI-Assisted Editing &amp; Quality Control
            </h2>
            <p>
              Where footage enhancement is requested, Jukira never invents
              missing details, alters identities, or changes a person’s
              appearance. Original files are preserved separately, and every
              finished film undergoes human quality review before delivery.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
