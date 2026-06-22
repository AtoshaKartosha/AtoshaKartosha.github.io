"use client";

import React from "react";

export const RotateDeviceOverlay: React.FC = () => {
  return (
    <div
      className="fixed inset-0 w-full h-full bg-[#110c08] z-50 flex flex-col justify-center items-center px-6 text-center select-none"
      style={{
        backgroundImage: `
          radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.85) 100%),
          repeating-linear-gradient(90deg, #1b120c, #1b120c 120px, #100a06 120px, #100a06 122px)
        `,
      }}
    >
      {/* Film grain overlay */}
      <div
        className="absolute w-[120%] h-[120%] top-[-10%] left-[-10%] pointer-events-none z-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: "grain 8s steps(10) infinite",
        }}
      />

      <div className="relative max-w-sm flex flex-col items-center gap-6 z-10">
        {/* Header */}
        <header className="border-b border-[#c8a96e]/30 pb-4 w-full">
          <h1 className="font-display text-[#c8a96e] text-2xl tracking-widest uppercase">
            ДЕТЕКТИВНЫЙ ВЕЧЕР
          </h1>
          <p className="font-typewriter text-[#7a7060] text-xs uppercase mt-1 tracking-wider">
            Материалы дела № 1853
          </p>
        </header>

        {/* Animated Rotate Device SVG */}
        <div className="my-4">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c8a96e"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: "suggestRotate 3s ease-in-out infinite" }}
          >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
        </div>

        {/* Instruction Message */}
        <div className="flex flex-col gap-2">
          <p className="font-typewriter text-sm text-[#e8dcc8] leading-relaxed uppercase tracking-wide">
            Поверните устройство горизонтально
          </p>
          <p className="font-typewriter text-[11px] text-[#7a7060] leading-relaxed uppercase">
            Для работы с интерактивной 3D-доской улик требуется альбомный режим
          </p>
        </div>
      </div>
    </div>
  );
};
