"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const LIFE_STAGES = [
  {
    src: "/images/stage-childhood.png",
    alt: "Childhood in a sunlit garden",
    caption: "Early Years — 1949",
  },
  {
    src: "/images/stage-wedding.png",
    alt: "Couple laughing on their wedding day",
    caption: "New Beginnings — 1966",
  },
  {
    src: "/images/stage-family.png",
    alt: "Multi-generational family gathering around an outdoor table",
    caption: "Family Gatherings — 2004",
  },
  {
    src: "/images/stage-grandparent.png",
    alt: "Older grandmother laughing with grandchildren",
    caption: "With the Grandchildren — 2022",
  },
];

export function HeroSequence() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % LIFE_STAGES.length);
    }, 5200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  function toggleSound() {
    if (muted) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!audioCtxRef.current) {
          const ctx = new AudioCtx();
          const master = ctx.createGain();
          master.gain.value = 0.04;
          master.connect(ctx.destination);

          // Gentle warm major-7th ambient pad
          const freqs = [220, 277.18, 329.63, 415.3];
          freqs.forEach((f) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = f;
            osc.connect(master);
            osc.start();
          });

          audioCtxRef.current = ctx;
          gainRef.current = master;
        } else if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
        if (gainRef.current) gainRef.current.gain.value = 0.04;
        setMuted(false);
      } catch {
        setMuted(true);
      }
    } else {
      if (gainRef.current) gainRef.current.gain.value = 0;
      setMuted(true);
    }
  }

  return (
    <div className="relative w-full aspect-[16/9] max-h-[540px] rounded-2xl overflow-hidden border border-[#E8E6E0] bg-[#F1EFE9] shadow-sm">
      {LIFE_STAGES.map((stage, idx) => (
        <div
          key={stage.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stage.src}
            alt={stage.alt}
            className="w-full h-full object-cover animate-gentle-pan"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#202020]/55 via-transparent to-[#202020]/20" />
        </div>
      ))}

      {/* Subtle sample opening title card */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#F8F7F3]/92 backdrop-blur-sm border border-[#E8E6E0] px-4 py-2 rounded-lg">
        <p className="text-[11px] uppercase tracking-widest text-[#77746F]">
          Sample Memorial Film
        </p>
        <p className="font-editorial text-sm sm:text-base text-[#202020]">
          Celebrating the life of Margaret
        </p>
      </div>

      {/* Sound control */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Unmute ambient film music" : "Mute ambient film music"}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F7F3]/90 hover:bg-white border border-[#E8E6E0] text-xs font-medium text-[#202020] transition-colors"
      >
        {muted ? (
          <>
            <VolumeX className="w-3.5 h-3.5 text-[#77746F]" />
            <span>Muted</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-[#718875]" />
            <span>Sound on</span>
          </>
        )}
      </button>

      {/* Bottom timeline & caption */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="text-white">
          <p className="text-xs uppercase tracking-widest text-white/80">
            Chapter {activeIndex + 1} of {LIFE_STAGES.length}
          </p>
          <p className="font-editorial text-lg sm:text-xl">
            {LIFE_STAGES[activeIndex].caption}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {LIFE_STAGES.map((stage, idx) => (
            <button
              key={stage.src}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`View ${stage.caption}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeIndex
                  ? "w-8 bg-white"
                  : "w-3 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
