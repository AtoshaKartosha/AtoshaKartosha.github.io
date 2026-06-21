import { getPinOffset } from "../data/boardItems";
import React from "react";
import {
  DossierSvg,
  Suspect1Svg,
  Suspect2Svg,
  MapSvg,
  GamesImage,
  VintageClockSvg,
  EvidenceBagSvg,
  NewspaperSvg,
} from "./BoardSvgs";

export function renderItemSvg(
  id: string,
  opts: { isHovered?: boolean; revealHidden?: boolean } = {}
): React.ReactNode {
  switch (id) {
    case "dossier":
      return (
        <DossierSvg
          forceLogo={true}
          useTelegramLogo={false}
          className="w-full h-full transition-all duration-300 ease-out"
          revealHidden={opts.revealHidden ?? false}
        />
      );
    case "suspect-1":
      return (
        <Suspect1Svg
          className="w-full h-full transition-all duration-300 ease-out"
        />
      );
    case "suspect-2":
      return (
        <Suspect2Svg
          className="w-full h-full transition-all duration-300 ease-out"
        />
      );
    case "map":
      return (
        <MapSvg
          className="w-full h-full transition-all duration-300 ease-out"
          revealHidden={opts.revealHidden ?? false}
        />
      );
    case "phone":
      return (
        <GamesImage
          isHovered={opts.isHovered}
          className="w-full h-full transition-all duration-300 ease-out"
        />
      );
    case "clock":
      return (
        <VintageClockSvg
          className="w-full h-full transition-all duration-300 ease-out"
        />
      );
    case "evidence":
      return (
        <EvidenceBagSvg
          className="w-full h-full transition-all duration-300 ease-out"
        />
      );
    case "newspaper":
      return (
        <NewspaperSvg
          className="w-full h-full transition-all duration-300 ease-out"
          revealHidden={opts.revealHidden ?? false}
        />
      );
    case "note":
      return (
        <div
          className="w-full h-full bg-[#decfa8] border-2 border-[#1c160e] p-3 font-typewriter text-[11px] sm:text-[12px] md:text-base text-[#1c160e] flex flex-col justify-between transition-all duration-300 ease-out"
        >
          <div className="font-bold border-b border-[#1c160e]/30 pb-0.5 mb-1.5 text-center uppercase tracking-wider text-[12px] sm:text-[13px] md:text-[16px]">
            РАСПИСАНИЕ
          </div>
          <div className="grid grid-cols-[auto_auto_1fr] gap-x-1 sm:gap-x-1.5 gap-y-1 select-none leading-snug">
            <div>16:00</div><div>—</div><div>Сбор гостей</div>
            <div>16:30</div><div>—</div><div>Инструктаж</div>
            <div>17:00</div><div>—</div><div>Первая сессия</div>
            <div>19:00</div><div>—</div><div>Кофе-брейк</div>
            <div>19:30</div><div>—</div><div>Вторая сессия</div>
            <div>21:30</div><div>—</div><div>Итоги</div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export const Pin: React.FC<{
  itemId: string;
  isHovered: boolean;
  showAnchor?: boolean;
}> = ({ itemId, isHovered, showAnchor = true }) => {
  return (
    <div
      className={`absolute -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#1c160e] flex items-center justify-center z-40 pointer-events-none transition-all duration-300 ease-out ${
        isHovered
          ? "bg-[#ff2a2a] shadow-[0_0_12px_#ff2a2a,0_6px_12px_rgba(0,0,0,0.8)] scale-110"
          : "bg-[#c41e1e] shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
      }`}
      style={{
        ...getPinOffset(itemId),
        transform: `translate3d(-50%, 0, ${isHovered ? "95px" : "2px"})`,
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
      {showAnchor && (
        <div
          data-pin-id={itemId}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
        />
      )}
    </div>
  );
};
