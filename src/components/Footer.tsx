import Link from "next/link";
import { LegaseeLogo } from "./LegaseeLogo";

export function Footer() {
  return (
    <footer className="bg-[#F1EFE9] border-t border-[#E8E6E0] mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1 space-y-3">
            <LegaseeLogo href="/" size="md" />
            <p className="text-sm text-[#77746F] leading-relaxed">
              A lifetime of memories. A legacy worth preserving.
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#77746F] font-sans">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-[#202020]">
              <li>
                <Link href="/#about" className="hover:text-[#77746F]">
                  About Jukira
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#77746F]">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/families" className="hover:text-[#77746F]">
                  For Families
                </Link>
              </li>
              <li>
                <Link href="/funeral-homes" className="hover:text-[#77746F]">
                  For Funeral Homes
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#77746F] font-sans">
              Support
            </h3>
            <ul className="space-y-2 text-sm text-[#202020]">
              <li>
                <Link href="/contact" className="hover:text-[#77746F]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#77746F]">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#77746F]">
                  Create a Legacy Film
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#77746F] font-sans">
              Legal &amp; Privacy
            </h3>
            <ul className="space-y-2 text-sm text-[#202020]">
              <li>
                <Link href="/privacy" className="hover:text-[#77746F]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#77746F]">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/terms#contributor-terms"
                  className="hover:text-[#77746F]"
                >
                  Contributor Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy#cookies"
                  className="hover:text-[#77746F]"
                >
                  Cookie Preferences
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E8E6E0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77746F]">
          <p>© {new Date().getFullYear()} Jukira. All rights reserved.</p>
          <p>Digital Memorial Film &amp; Legacy Preservation</p>
        </div>
      </div>
    </footer>
  );
}
