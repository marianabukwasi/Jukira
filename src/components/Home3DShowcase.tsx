"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cemetery3DWalk } from "./Cemetery3DWalk";
import type { DigitalFlowerRecord, MemorialPlotRecord } from "@/lib/types";

interface ShowcaseItem {
  plot: MemorialPlotRecord;
  flowers: DigitalFlowerRecord[];
  secureToken: string;
}

export function Home3DShowcase({ items }: { items: ShowcaseItem[] }) {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [walkKey, setWalkKey] = useState(0);

  if (items.length === 0) return null;
  const active = items[activeIdx] || items[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((item, idx) => (
          <button
            key={item.plot.id}
            type="button"
            onClick={() => {
              setActiveIdx(idx);
              setWalkKey((k) => k + 1);
            }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
              idx === activeIdx
                ? "bg-[#242424] text-white"
                : "bg-white border border-[#E8E6E0] text-[#77746F] hover:text-[#202020]"
            }`}
          >
            {item.plot.garden_type === "PET"
              ? `Pet Memorial: ${item.plot.deceased_name}`
              : `Memorial Gardens: ${item.plot.deceased_name}`}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setWalkKey((k) => k + 1)}
          className="px-4 py-2 rounded-full border border-[#E8E6E0] bg-white text-xs text-[#202020] hover:bg-[#F8F7F3]"
        >
          Replay Walk
        </button>
      </div>

      <Cemetery3DWalk
        key={`${active.plot.id}-${walkKey}`}
        plot={active.plot}
        flowers={active.flowers}
        onArrive={() => router.push(`/memorial/${active.secureToken}`)}
        onCancel={() => router.push("/memorial-garden")}
      />
    </div>
  );
}
