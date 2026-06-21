"use client";

import React from "react";
import { useBoardStore } from "../stores/useBoardStore";

export const PortraitOverlay: React.FC = () => {
  const isMobile = useBoardStore((state) => state.isMobile);
  const isPortrait = useBoardStore((state) => state.isPortrait);

  if (!isMobile || !isPortrait) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 w-full h-full bg-[#080808] z-[60] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 40%, rgba(200, 169, 110, 0.08) 0%, transparent 60%),
          radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.95) 100%)
        `
      }}
    >
      {/* Flickering film grain */}
      <div
        className="absolute w-[120%] h-[120%] top-[-10%] left-[-10%] pointer-events-none z-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: "grain 8s steps(10) infinite",
        }}
      />

      {/* Animated rotating phone icon */}
      <div
        style={{
          animation: "suggestRotate 2.5s ease-in-out infinite",
          transformOrigin: "center",
        }}
        className="mb-8 z-10"
      >
        <svg
          width="64"
          height="108"
          viewBox="0 0 64 108"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#c8a96e]"
        >
          <rect
            x="3"
            y="3"
            width="58"
            height="102"
            rx="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <line
            x1="24"
            y1="10"
            x2="40"
            y2="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="32"
            cy="94"
            r="5"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </div>

      {/* Typography */}
      <h2 className="font-display text-[#c8a96e] text-2xl sm:text-3xl tracking-widest text-center uppercase z-10 px-4">
        ПОВЕРНИТЕ УСТРОЙСТВО
      </h2>
      <p className="font-typewriter text-[#7a7060] text-xs sm:text-sm text-center mt-3 max-w-[280px] sm:max-w-xs z-10 px-4 leading-relaxed">
        Для лучшего опыта используйте горизонтальную ориентацию
      </p>
    </div>
  );
};
