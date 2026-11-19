"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LegaseeLogo } from "./LegaseeLogo";
import type { SessionUser } from "@/lib/types";

interface NavbarProps {
  user?: SessionUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "FUNERAL_HOME"
      ? "/partners/dashboard"
      : "/family/dashboard";

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-sm border-b border-[#E8E6E0]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <LegaseeLogo href="/" size="md" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-[#202020]">
          <Link
            href="/how-it-works"
            className="text-[#77746F] hover:text-[#202020] transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#pricing"
            className="text-[#77746F] hover:text-[#202020] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/memorial-garden"
            className="text-[#77746F] hover:text-[#202020] transition-colors"
          >
            Memorial Garden
          </Link>
          <Link
            href="/families"
            className="text-[#77746F] hover:text-[#202020] transition-colors"
          >
            For Families
          </Link>
          <Link
            href="/funeral-homes"
            className="text-[#77746F] hover:text-[#202020] transition-colors"
          >
            For Funeral Homes
          </Link>
          {user ? (
            <Link
              href={dashboardHref}
              className="px-4 py-2 rounded-full bg-[#242424] text-white font-medium hover:bg-[#383838] transition-colors"
            >
              My Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[#202020] font-medium hover:text-[#77746F] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-[#242424] text-white font-medium hover:bg-[#383838] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-md text-[#202020] hover:bg-[#F1EFE9]"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#E8E6E0] bg-[#F8F7F3] px-5 py-4 space-y-3 text-sm">
          <Link
            href="/how-it-works"
            onClick={() => setOpen(false)}
            className="block py-2 text-[#202020]"
          >
            How It Works
          </Link>
          <Link
            href="/#pricing"
            onClick={() => setOpen(false)}
            className="block py-2 text-[#202020]"
          >
            Pricing
          </Link>
          <Link
            href="/memorial-garden"
            onClick={() => setOpen(false)}
            className="block py-2 text-[#202020]"
          >
            Memorial Garden
          </Link>
          <Link
            href="/families"
            onClick={() => setOpen(false)}
            className="block py-2 text-[#202020]"
          >
            For Families
          </Link>
          <Link
            href="/funeral-homes"
            onClick={() => setOpen(false)}
            className="block py-2 text-[#202020]"
          >
            For Funeral Homes
          </Link>
          <div className="pt-2 border-t border-[#E8E6E0] flex flex-col gap-2.5">
            {user ? (
              <Link
                href={dashboardHref}
                onClick={() => setOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-[#242424] text-white font-medium"
              >
                My Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-2.5 rounded-full border border-[#E8E6E0] bg-white text-[#202020] font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#242424] text-white font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
