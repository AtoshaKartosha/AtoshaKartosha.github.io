"use client";

import React from "react";
import { useBoardStore } from "../stores/useBoardStore";
import { boardItems, threadConnections } from "../data/boardItems";
import { popupContentMap } from "../data/popupContent";
import { renderItemSvg } from "./BoardItemSvg";

interface PortraitDossierListProps {
  onShowBoardAnyway?: () => void;
}

export const PortraitDossierList: React.FC<PortraitDossierListProps> = ({
  onShowBoardAnyway,
}) => {
  const isMobile = useBoardStore((state) => state.isMobile);
  const isPortrait = useBoardStore((state) => state.isPortrait);
  const setActivePopup = useBoardStore((state) => state.setActivePopup);

  const itemNames: Record<string, string> = boardItems.reduce((acc, current) => {
    acc[current.id] = current.name;
    return acc;
  }, {} as Record<string, string>);

  if (!isMobile || !isPortrait) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 w-full h-full bg-[#110c08] z-40 overflow-y-auto flex flex-col px-4 py-6"
      style={{
        backgroundImage: `
          radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.75) 100%),
          repeating-linear-gradient(90deg, #1b120c, #1b120c 120px, #100a06 120px, #100a06 122px)
        `
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

      <div className="relative w-full max-w-md mx-auto flex flex-col flex-1 z-10">
        {/* Header */}
        <header className="border-b border-[#c8a96e]/30 pb-4 mb-6 text-center">
          <h1 className="font-display text-[#c8a96e] text-2xl tracking-widest uppercase">
            ДЕТЕКТИВНЫЙ ВЕЧЕР
          </h1>
          <p className="font-typewriter text-[#7a7060] text-xs uppercase mt-1 tracking-wider">
            Материалы уголовного дела № 1853
          </p>
        </header>

        {/* Rotate Device Suggestion Banner */}
        <div className="bg-black/50 border border-[#8b6d3b]/40 rounded-sm p-3.5 mb-6 flex items-center gap-3.5 shadow-inner">
          <div className="shrink-0 text-[#c8a96e] animate-pulse">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M12 18h.01" />
              <path d="m17 7-3-3-3 3" />
              <path d="M14 4H9a3 3 0 0 0-3 3v2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-typewriter text-[10px] text-[#e8dcc8] leading-normal uppercase">
              Поверните устройство горизонтально для доступа к интерактивной 3D-доске улик
            </p>
            {onShowBoardAnyway && (
              <button
                onClick={onShowBoardAnyway}
                className="font-typewriter text-[10px] text-[#8b6d3b] hover:text-[#c8a96e] underline mt-1 text-left uppercase font-bold focus:outline-none"
              >
                Показать доску в портретном режиме
              </button>
            )}
          </div>
        </div>

        {/* List of Dossiers / Items */}
        <main className="flex flex-col gap-4 flex-1">
          {boardItems.map((item) => {
            const content = popupContentMap[item.popupId];
            const firstParagraph = content?.content?.[0] || "";
            const connectedNames = threadConnections
              .filter((conn) => conn.from === item.id || conn.to === item.id)
              .map((conn) => itemNames[conn.from === item.id ? conn.to : conn.from])
              .filter(Boolean);

            return (
              <div
                key={item.id}
                onClick={() => setActivePopup(item.popupId)}
                className="relative bg-[#d4c9a8] text-[#1c160e] p-3.5 border-2 border-[#1c160e] rounded-sm flex gap-4 items-start cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.5)] active:scale-[0.99] hover:scale-[1.01] transition-all duration-150"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 10% 20%, rgba(139, 119, 87, 0.08) 0%, transparent 80%),
                    radial-gradient(circle at 80% 80%, rgba(90, 70, 50, 0.05) 0%, transparent 60%)
                  `
                }}
              >
                {/* Visual Graphic Thumbnail Container */}
                <div className="w-16 h-16 bg-[#f5f4ef] border border-[#1c160e]/20 rounded-sm shrink-0 flex items-center justify-center relative overflow-hidden select-none">
                  {renderItemSvg(item.id)}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-[#1c160e] text-sm font-bold uppercase tracking-tight leading-tight">
                    {item.name}
                  </h2>
                  {content?.subtitle && (
                    <p className="font-typewriter text-[9px] text-[#5c1212] uppercase font-bold tracking-wider mt-0.5 truncate">
                      {content.subtitle}
                    </p>
                  )}
                  {connectedNames.length > 0 && (
                    <p className="font-typewriter text-[8px] text-[#8b6d3b] uppercase font-bold tracking-wider mt-0.5 truncate">
                      Связи: {connectedNames.join(", ")}
                    </p>
                  )}
                  <p className="font-typewriter text-[10px] text-[#2a2217]/85 mt-2 line-clamp-2 leading-relaxed">
                    {firstParagraph}
                  </p>
                </div>
              </div>
            );
          })}
        </main>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-[#c8a96e]/15 text-center">
          <p className="font-typewriter text-[9px] text-[#7a7060] uppercase">
            Detective Table Top © 2026
          </p>
        </footer>
      </div>
    </div>
  );
};
