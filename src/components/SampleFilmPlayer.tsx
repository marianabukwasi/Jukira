"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

const SAMPLE_CHAPTERS = [
  {
    id: "title",
    type: "title" as const,
    title: "Celebrating the Life of",
    name: "Margaret Eleanor Vance",
    dates: "1942 – 2025",
    label: "Opening Title",
    durationSec: 4,
  },
  {
    id: "childhood",
    type: "image" as const,
    src: "/images/stage-childhood.png",
    caption: "In the garden at Grandmother's cottage, 1949",
    contributor: "Shared by Claire (Daughter)",
    label: "Childhood",
    durationSec: 5,
  },
  {
    id: "young-adult",
    type: "image" as const,
    src: "/images/stage-young-adult.png",
    caption: "Afternoon walks in Hyde Park, 1962",
    contributor: "Shared by Grace (University friend)",
    label: "Twenties",
    durationSec: 5,
  },
  {
    id: "wedding",
    type: "image" as const,
    src: "/images/stage-wedding.png",
    caption: "Margaret and Thomas on their wedding day, 1966",
    contributor: "Shared by Grace (Lifelong friend)",
    label: "Wedding",
    durationSec: 5,
  },
  {
    id: "friends",
    type: "image" as const,
    src: "/images/stage-friends.png",
    caption: "Reunion afternoon with old friends, 1988",
    contributor: "Shared by Grace (Lifelong friend)",
    label: "Friendships",
    durationSec: 5,
  },
  {
    id: "family",
    type: "image" as const,
    src: "/images/stage-family.png",
    caption: "Summer family lunch in Devon, 2004",
    contributor: "Shared by David (Son)",
    label: "Family Years",
    durationSec: 5,
  },
  {
    id: "pet",
    type: "image" as const,
    src: "/images/stage-pet-dog.png",
    caption: "Barnaby in the garden with the family, 2016",
    contributor: "Shared by Claire (Daughter)",
    label: "Beloved Pets",
    durationSec: 5,
  },
  {
    id: "grandparent",
    type: "image" as const,
    src: "/images/stage-grandparent.png",
    caption: "Laughing with the grandchildren in the afternoon sun, 2022",
    contributor: "Shared by Claire (Daughter)",
    label: "Later Years",
    durationSec: 5,
  },
];

export function SampleFilmPlayer() {
  const [playing, setPlaying] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const current = SAMPLE_CHAPTERS[chapterIndex];
    const timer = setTimeout(() => {
      if (chapterIndex < SAMPLE_CHAPTERS.length - 1) {
        setChapterIndex((i) => i + 1);
      } else {
        setPlaying(false);
      }
    }, current.durationSec * 1000);
    return () => clearTimeout(timer);
  }, [playing, chapterIndex]);

  const current = SAMPLE_CHAPTERS[chapterIndex];

  return (
    <div className="bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden shadow-sm">
      <div className="relative aspect-[16/9] bg-[#F1EFE9] flex items-center justify-center overflow-hidden">
        {current.type === "title" ? (
          <div className="text-center px-6 py-12 max-w-xl mx-auto">
            <p className="text-xs uppercase tracking-[0.22em] text-[#77746F] mb-3">
              {current.title}
            </p>
            <h3 className="font-editorial text-3xl sm:text-4xl text-[#202020] mb-2">
              {current.name}
            </h3>
            <p className="text-sm text-[#77746F] tracking-widest">
              {current.dates}
            </p>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.caption}
              className={`w-full h-full object-cover transition-transform duration-1000 ${
                playing ? "scale-105" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#202020]/65 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="font-editorial text-lg sm:text-xl">
                {current.caption}
              </p>
              <p className="text-xs text-white/80 mt-1">
                {current.contributor}
              </p>
            </div>
          </>
        )}

        {!playing && (
          <button
            type="button"
            onClick={() => {
              if (chapterIndex === SAMPLE_CHAPTERS.length - 1) {
                setChapterIndex(0);
              }
              setPlaying(true);
            }}
            aria-label="Play sample memorial film"
            className="absolute inset-0 flex items-center justify-center bg-[#202020]/10 hover:bg-[#202020]/20 transition-colors group"
          >
            <span className="w-16 h-16 rounded-full bg-[#242424] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Play className="w-6 h-6 ml-0.5" />
            </span>
          </button>
        )}
      </div>

      {/* Controls & Chapter Selector */}
      <div className="px-5 py-4 border-t border-[#E8E6E0] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] transition-colors"
          >
            {playing ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Play Sample Film</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setChapterIndex(0);
            }}
            aria-label="Restart sample film"
            className="p-2 rounded-full border border-[#E8E6E0] text-[#77746F] hover:text-[#202020] hover:bg-[#F8F7F3]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SAMPLE_CHAPTERS.map((chap, idx) => (
            <button
              key={chap.id}
              type="button"
              onClick={() => setChapterIndex(idx)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                idx === chapterIndex
                  ? "bg-[#242424] text-white"
                  : "bg-[#F1EFE9] text-[#77746F] hover:text-[#202020]"
              }`}
            >
              {chap.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
