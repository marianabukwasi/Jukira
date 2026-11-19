"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { LegaseeLogo } from "./LegaseeLogo";
import type { SessionUser } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
}

interface DashboardShellProps {
  user: SessionUser;
  portalLabel: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  portalLabel,
  navItems,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#202020]">
      <header className="bg-white border-b border-[#E8E6E0] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <LegaseeLogo href="/" size="sm" />
            <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full bg-[#F1EFE9] text-[#77746F] font-medium">
              {portalLabel}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs text-[#77746F]">
              {user.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F1EFE9]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-6 overflow-x-auto border-t border-[#E8E6E0]/70 text-sm">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/family/dashboard" &&
                item.href !== "/partners/dashboard" &&
                item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "border-[#242424] text-[#202020] font-medium"
                    : "border-transparent text-[#77746F] hover:text-[#202020]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
