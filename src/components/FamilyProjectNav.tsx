"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FamilyProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/family/projects/${projectId}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/contributions`, label: "Contributions" },
    { href: `${base}/preferences`, label: "Film Preferences" },
    { href: `${base}/production`, label: "Production Status" },
    { href: `${base}/film`, label: "Final Film & Raw Footage" },
    { href: `${base}/website`, label: "Headstone & Garden" },
    { href: `${base}/archive`, label: "Archive" },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#E8E6E0]">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              active
                ? "bg-[#242424] text-white"
                : "bg-white border border-[#E8E6E0] text-[#77746F] hover:text-[#202020]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
