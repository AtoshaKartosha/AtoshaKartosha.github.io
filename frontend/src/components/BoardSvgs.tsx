import React, { useState, useEffect } from "react";
import { useBoardStore } from "../stores/useBoardStore";
import Image from "next/image";

// Corkboard SVG Pattern overlay for background texture
export const CorkboardTexture: React.FC = () => (
  <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <filter id="cork-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0  0.3333 0.3333 0.3333 0 0  0.3333 0.3333 0.3333 0 0  0 0 0 0.15 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#cork-noise)" />
  </svg>
);

// Dossier / Main case folder
export const DossierSvg: React.FC<{ forceLogo?: boolean; useTelegramLogo?: boolean; className?: string; revealHidden?: boolean }> = ({
  forceLogo = false,
  useTelegramLogo = false,
  className = "w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]",
  revealHidden = false,
}) => {
  const storeIsLoading = useBoardStore((state) => state.isLoading);
  const isLoading = forceLogo ? false : storeIsLoading;
  
  return (
    <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* UV glow filter specifically for dossier to avoid DOM clashes */}
        <filter id="uv-glow-dossier">
          <feGaussianBlur stdDeviation="0.4" result="blur" />
          <feFlood floodColor="#a855f7" floodOpacity="0.85" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Сгенерированное фоновое изображение папки с легким нуар-фильтром */}
      <image 
        href="/images/board/dossier.webp" 
        x="0" 
        y="0" 
        width="300" 
        height="240" 
        className="select-none" 
        style={{
          filter: "saturate(0) contrast(1.15) brightness(0.95)",
        }}
      />
      
      {/* Полноцветный векторный логотип на обложке */}
      {useTelegramLogo ? (
        <g 
          className="transition-opacity duration-200 select-none" 
          style={{ opacity: isLoading ? 0 : 0.95 }}
        >
          <circle cx="150" cy="75" r="28" fill="#24a1de" stroke="#1c160e" strokeWidth="2.5" />
          <path 
            fill="#f4ecd8" 
            d="M15,46.7L81,17.5c2.9-1.1,5.4,0.6,4.5,4.7L73.9,74.5c-0.8,3.6-2.9,4.5-5.9,2.8L57,69.5l-5.3,5.1c-0.6,0.6-1.1,1.1-2.2,1.1l0.8-11.2l20.4-18.4c0.9-0.8-0.2-1.2-1.4-0.4L24.1,62.3l-10.9-3.4C10.8,58,10.7,55.9,15,46.7z"
            transform="translate(122, 47) scale(0.56)"
          />
        </g>
      ) : (
        <image 
          href="/logo_detective.svg" 
          x="90" 
          y="30" 
          width="120" 
          height="60.3" 
          className="transition-opacity duration-200 select-none" 
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      )}
      
      {/* Векторный текст номера дела */}
      <text 
        x="150" 
        y="188" 
        fill="#1c160e" 
        fontSize="12.5" 
        fontWeight="bold" 
        className="font-typewriter" 
        textAnchor="middle" 
        letterSpacing="1"
      >
        ДEЛО № 1853
      </text>
      
      {/* Диагональный штамп TOP SECRET по центру, слегка касающийся логотипа */}
      <g transform="translate(150, 112) rotate(-18)">
        <rect 
          x="-70" 
          y="-14" 
          width="140" 
          height="28" 
          fill="none" 
          stroke="#c41e1e" 
          strokeWidth="2.5" 
          rx="2.5" 
          opacity="0.85"
        />
        <text 
          x="0" 
          y="5.5" 
          fill="#c41e1e" 
          fontSize="14" 
          fontWeight="900" 
          className="font-typewriter" 
          textAnchor="middle" 
          letterSpacing="2.5"
          opacity="0.85"
        >
          TOP SECRET
        </text>
      </g>
      {revealHidden && (
        <g className="uv-notes">
          {/* Arrow pointing to the agent's photo (left and slightly up, in the top-left quadrant) */}
          <g filter="url(#uv-glow-dossier)" opacity="0.85">
            {/* Arrow shaft with a slight wobbly/scratched curve */}
            <path d="M 60 55 Q 45 52 35 48" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" />
            {/* Arrow head pointing left-up */}
            <path d="M 35 48 L 43 43 M 35 48 L 41 53" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* Diagonally slanted scratched text 'НАЙДИ АГЕНТА' in two lines in the bottom-left quadrant */}
          <g transform="translate(45, 160) rotate(-10)" filter="url(#uv-glow-dossier)" opacity="0.9">
            {/* Line 1: НАЙДИ */}
            <g transform="translate(0, 0)">
              {/* Н */}
              <path d="M 0 12 L 0 0 M 8 12 L 8 0 M 0 6 L 8 6" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              {/* А */}
              <path d="M 11 12 L 15 0 L 19 12 M 13 8 L 17 8" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              {/* Й */}
              <path d="M 22 12 L 22 0 M 30 12 L 30 0 M 22 12 L 30 0 M 24 -2 Q 26 -4 28 -2" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              {/* Д */}
              <path d="M 35 2 L 39 2 M 35 2 L 35 10 M 39 2 L 39 10 M 33 10 L 41 10 M 34 10 L 34 13 M 40 10 L 40 13" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              {/* И (Correct stroke direction: bottom-left to top-right) */}
              <path d="M 44 12 L 44 0 M 52 12 L 52 0 M 44 12 L 52 0" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            
            {/* Line 2: АГЕНТА */}
            <g transform="translate(5, 16)">
              {/* А */}
              <path d="M 0 12 L 4 0 L 8 12 M 2 8 L 6 8" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              {/* Г */}
              <path d="M 11 12 L 11 0 L 19 0" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              {/* Е */}
              <path d="M 22 12 L 22 0 L 30 0 M 22 6 L 28 6 M 22 12 L 30 12" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              {/* Н */}
              <path d="M 33 12 L 33 0 M 41 12 L 41 0 M 33 6 L 41 6" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              {/* Т */}
              <path d="M 44 0 L 52 0 M 48 0 L 48 12" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              {/* А */}
              <path d="M 55 12 L 59 0 L 63 12 M 57 8 L 61 8" stroke="#a855f7" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Some chaotic scratches around the text to enhance the carved look */}
            <path d="M -10 6 L -3 8 M 68 20 L 75 18 M 15 28 L 30 26" stroke="#a855f7" strokeWidth="0.6" opacity="0.6" />
          </g>
        </g>
      )}
    </svg>
  );
};

// Polaroid Suspect 1 (The Femme Fatale / Agent)
export const Suspect1Svg: React.FC<{ className?: string }> = ({ className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 1;
    video.play().catch(() => {});
  }, []);

  const handleEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.currentTime = 0;
    video.playbackRate = 1;
    video.play().catch(() => {});
  };

  return (
    <div className={`${className} bg-[#f5f4ef] p-[5%] aspect-square rounded-[2px] border border-[#dfded7] select-none flex flex-col justify-center items-center shadow-inner`}>
      <div className="w-full h-full relative overflow-hidden bg-[#121212] border border-black/15 rounded-[1px] flex items-center justify-center">
        <video
          ref={videoRef}
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          onEnded={handleEnded}
          poster="/images/board/suspect-1-video-poster.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/images/board/suspect-1.webm" type="video/webm" />
          <source src="/images/board/suspect-1.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

// Polaroid Suspect 2 (The Mobster / Informant)
export const Suspect2Svg: React.FC<{ className?: string }> = ({ className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" }) => (
  <div className={`${className} bg-[#f5f4ef] p-[5%] aspect-square rounded-[2px] border border-[#dfded7] select-none flex flex-col justify-center items-center shadow-inner`}>
    <div className="w-full h-full relative overflow-hidden bg-[#121212] border border-black/15 rounded-[1px] flex items-center justify-center">
      <video
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        poster="/images/board/suspect-2-video-poster.jpg"
        className="w-full h-full object-cover"
      >
        <source src="/images/board/suspect-2.webm" type="video/webm" />
        <source src="/images/board/suspect-2.mp4" type="video/mp4" />
      </video>
    </div>
  </div>
);
const markerPath = "M 93 78 H 116 A 2 2 0 0 1 118 80 V 104 A 2 2 0 0 1 116 106 H 110 L 104.5 113 L 99 106 H 93 A 2 2 0 0 1 91 104 V 80 A 2 2 0 0 1 93 78 Z";

export const MapSvg: React.FC<{ revealHidden?: boolean; className?: string }> = ({
  revealHidden = false,
  className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]",
}) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <style>{`
        @keyframes ping-circle {
          0% {
            transform: scale(0.1);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .marker-wave-circle {
          animation: ping-circle 3s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
          transform-origin: 104.5px 113px;
          transform-box: view-box;
        }
        .wave-circle-2 {
          animation-delay: 1.5s;
        }
      `}</style>
      {/* Black outline filter around the V letter */}
      <filter id="black-outline">
        <feMorphology in="SourceAlpha" result="dilated" operator="dilate" radius="4" />
        <feFlood floodColor="#141413" result="black" />
        <feComposite in="black" in2="dilated" operator="in" result="outline" />
        <feMerge>
          <feMergeNode in="outline" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Metallic linear gradient for the marker border */}
      <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fdfdfd" />
        <stop offset="20%" stopColor="#b8b8b8" />
        <stop offset="40%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#7a7a7a" />
        <stop offset="80%" stopColor="#f0f0f0" />
        <stop offset="100%" stopColor="#555555" />
      </linearGradient>
      {/* UV glow filter */}
      <filter id="uv-glow">
        <feGaussianBlur stdDeviation="0.4" result="blur" />
        <feFlood floodColor="#a855f7" floodOpacity="0.85" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Map Paper */}
    <rect width="200" height="200" rx="4" fill="#decfa8" />
    <rect x="4" y="4" width="192" height="192" rx="2" fill="#e8dcba" stroke="#b4a377" strokeWidth="2" />
    
    {/* Map Grid Labels */}
    <g fill="#6b5b3d" fontSize="5" opacity="0.6" fontFamily="serif" textAnchor="middle">
      <text x="25" y="10">А</text>
      <text x="75" y="10">Б</text>
      <text x="125" y="10">В</text>
      <text x="175" y="10">Г</text>
      <text x="10" y="27">1</text>
      <text x="10" y="77">2</text>
      <text x="10" y="127">3</text>
      <text x="10" y="177">4</text>
    </g>

    {/* Vintage Compass Rose (North Arrow) */}
    <g opacity="0.65" transform="translate(18, 18)">
      <line x1="0" y1="-10" x2="0" y2="10" stroke="#6b5b3d" strokeWidth="0.8" />
      <line x1="-10" y1="0" x2="10" y2="0" stroke="#6b5b3d" strokeWidth="0.8" />
      <line x1="-7" y1="-7" x2="7" y2="7" stroke="#6b5b3d" strokeWidth="0.5" strokeDasharray="1 1" />
      <line x1="-7" y1="7" x2="7" y2="-7" stroke="#6b5b3d" strokeWidth="0.5" strokeDasharray="1 1" />
      <polygon points="0,-10 3,0 0,2 -3,0" fill="#8f7e59" stroke="#6b5b3d" strokeWidth="0.5" />
      <polygon points="0,10 3,0 0,-2 -3,0" fill="#8f7e59" stroke="#6b5b3d" strokeWidth="0.5" />
      <polygon points="10,0 0,3 -2,0 0,-3" fill="#8f7e59" stroke="#6b5b3d" strokeWidth="0.5" />
      <polygon points="-10,0 0,3 2,0 0,-3" fill="#8f7e59" stroke="#6b5b3d" strokeWidth="0.5" />
      <text x="0" y="-12" fill="#6b5b3d" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="serif">С</text>
    </g>
    {/* Grid / Faint Lines */}
    <g opacity="0.15" stroke="#6b5b3d" strokeWidth="1">
      <line x1="50" y1="4" x2="50" y2="196" />
      <line x1="100" y1="4" x2="100" y2="196" />
      <line x1="150" y1="4" x2="150" y2="196" />
      <line x1="4" y1="50" x2="196" y2="50" />
      <line x1="4" y1="100" x2="196" y2="100" />
      <line x1="4" y1="150" x2="196" y2="150" />
    </g>

    {/* Textured Building Blocks */}
    <g fill="#d5c89a" stroke="#b4a377" strokeWidth="0.8" opacity="0.5">
      {/* Top Left Blocks */}
      <rect x="10" y="10" width="24" height="34" rx="1" />
      <rect x="10" y="50" width="24" height="34" rx="1" />
      <rect x="10" y="90" width="24" height="24" rx="1" />
      
      {/* Top Right Blocks */}
      <rect x="166" y="10" width="24" height="34" rx="1" />
      <rect x="166" y="50" width="24" height="34" rx="1" />
      <rect x="166" y="90" width="24" height="24" rx="1" />

      {/* Station Area Block */}
      <rect x="78" y="15" width="44" height="95" rx="2" />

      {/* Bottom Blocks (below canal Naberezhnaya) */}
      <rect x="10" y="150" width="24" height="38" rx="1" />
      <rect x="50" y="155" width="40" height="33" rx="1" />
      <rect x="100" y="160" width="50" height="28" rx="1" />
      <rect x="166" y="165" width="24" height="23" rx="1" />
    </g>
      {/* Park/Garden next to station */}
      <rect x="52" y="72" width="22" height="28" fill="#9ea5a5" opacity="0.25" stroke="#8f7e59" strokeWidth="0.8" strokeDasharray="2 2" rx="1" />

    {/* Station Train Shed (historical glass-and-iron hall housing the tracks) */}
    <g opacity="0.85">
      <rect x="88" y="20" width="24" height="46" rx="1.5" fill="#8f7e59" stroke="#6b5b3d" strokeWidth="1.2" />
      {/* Glazing bars / roof support ribs */}
      <g stroke="#6b5b3d" strokeWidth="0.8" opacity="0.5">
        <line x1="94" y1="20" x2="94" y2="65" />
        <line x1="100" y1="20" x2="100" y2="65" />
        <line x1="106" y1="20" x2="106" y2="65" />
        <line x1="88" y1="29" x2="112" y2="29" />
        <line x1="88" y1="38" x2="112" y2="38" />
        <line x1="88" y1="47" x2="112" y2="47" />
        <line x1="88" y1="56" x2="112" y2="56" />
      </g>
    </g>

    {/* Streets / Roads */}
    <g stroke="#8f7e59" strokeLinecap="round" opacity="0.8">
      {/* Izmaylovsky pr. (left vertical street) */}
      <line x1="40" y1="4" x2="40" y2="196" strokeWidth="2" />
      
      {/* Moskovsky pr. (right vertical street) */}
      <line x1="160" y1="4" x2="160" y2="196" strokeWidth="2" />

      {/* Horizontal streets */}
      <line x1="4" y1="48" x2="196" y2="48" strokeWidth="1.5" />
      <line x1="4" y1="88" x2="196" y2="88" strokeWidth="1.5" />

      {/* Obvodny Canal Naberezhnaya (embankments) */}
      <path d="M4 116 Q100 126 196 146" strokeWidth="1.5" fill="none" />
      <path d="M4 134 Q100 144 196 164" strokeWidth="1.5" fill="none" />
    </g>
      {/* Minor streets & alleys */}
      <line x1="65" y1="48" x2="65" y2="88" stroke="#8f7e59" strokeWidth="0.8" opacity="0.5" strokeDasharray="3 1.5" />
      <line x1="160" y1="30" x2="196" y2="30" stroke="#8f7e59" strokeWidth="0.8" opacity="0.5" strokeDasharray="3 1.5" />
      <line x1="80" y1="70" x2="80" y2="116" stroke="#8f7e59" strokeWidth="0.8" opacity="0.6" />
      <line x1="120" y1="4" x2="120" y2="48" stroke="#8f7e59" strokeWidth="0.8" opacity="0.6" />

    {/* Obvodny Canal (waterway) */}
    <path d="M4 125 Q100 135 196 155" stroke="#7e8888" strokeWidth="11" fill="none" strokeLinecap="square" opacity="0.8" />
    <path d="M4 125 Q100 135 196 155" stroke="#9ea5a5" strokeWidth="8" fill="none" strokeLinecap="square" opacity="0.9" />
    {/* Canal water ripples */}
    <path d="M25 129 Q50 132 75 133" stroke="#7e8888" strokeWidth="0.8" fill="none" opacity="0.6" strokeDasharray="5 5" />
    <path d="M110 138 Q140 143 170 148" stroke="#7e8888" strokeWidth="0.8" fill="none" opacity="0.6" strokeDasharray="5 5" />

    {/* Bridges crossing Obvodny Canal */}
    <rect x="36" y="122" width="8" height="11" fill="#8f7e59" stroke="#6b5b3d" strokeWidth="0.8" rx="0.5" />
    <rect x="156" y="142" width="8" height="11" fill="#8f7e59" stroke="#6b5b3d" strokeWidth="0.8" rx="0.5" transform="rotate(10, 160, 148)" />

    {/* Station terminal building footprint */}
    <rect x="80" y="65" width="44" height="56" rx="2" fill="#8f7e59" stroke="#6b5b3d" strokeWidth="1.5" />

    {/* Concentric pulsating waves behind the marker tip */}
    <circle cx="104.5" cy="113" r="25" className="marker-wave-circle" fill="none" stroke="#ff3355" strokeWidth="1.5" pointerEvents="none" />
    <circle cx="104.5" cy="113" r="25" className="marker-wave-circle wave-circle-2" fill="none" stroke="#ff3355" strokeWidth="1.5" pointerEvents="none" />

    {/* Outline/container shape around the V marker (black background, metallic 3px border, bottom triangular tail) */}
    <path d={markerPath} fill="#141413" stroke="url(#metal-grad)" strokeWidth="3" />

    {/* Unrotated V letter with a thick black outline, inline paths with brighter red colors */}
    <g transform="translate(-35.27, 59.52) scale(0.34)" filter="url(#black-outline)">
      <path fill="#ff3355" d="M418.94,70.28l9.51.12-21.28,51.89c-3.75.92-7.39.57-11.32.11l.27-19.96.26-32.26,9.55-.02-.33,9.54-.5,10.62.03,15.16,13.81-35.2Z"/>
      <path fill="#c8102e" d="M411.2,95.24c1.76-.46,3.2-.44,4.97-.06l-10.33,25.36h-8.03s.47-25.39.47-25.39c1.67-.47,3.16-.44,4.96.02l-.13,17.21c0,.41-.08.7.31.77.47.09.65-.09.86-.61l6.93-17.3Z"/>
    </g>
    {/* Slanted speech bubble label (placed next to the pin to avoid board lamp and tape overlays) */}
    <g transform="rotate(-6, 152.5, 86)">
      <path d="M119 76 H186 A3 3 0 0 1 189 79 V93 A3 3 0 0 1 186 96 H118 L108 92 L116 84 V79 A3 3 0 0 1 119 76 Z" fill="#141414" stroke="#e8dcc8" strokeWidth="1" opacity="0.9" />
      <text x="152.5" y="89" fill="#e8dcc8" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">ВОКЗАЛЪ 1853</text>
    </g>
    {revealHidden && (
      <g className="uv-notes">
        {/* Wobbly hand-drawn circle/pencil markings around key grid points (route start, X checkpoint, and route end) */}
        <path d="M 35 48 C 35 43, 45 43, 45 48 C 45 53, 34 54, 35 48" fill="none" stroke="#7c3aed" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="0.6 0.3" filter="url(#uv-glow)" />
        <path d="M 35 88 C 35 83, 45 83, 45 88 C 45 93, 34 94, 35 88" fill="none" stroke="#7c3aed" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="0.6 0.3" filter="url(#uv-glow)" />
        <path d="M 156 146 C 156 141, 164 141, 164 146 C 164 150, 155 151, 156 146 C 157 143, 161 143, 163 145" fill="none" stroke="#7c3aed" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="0.6 0.3" filter="url(#uv-glow)" />

        {/* Rough X mark at intersection (Izmaylovsky/horizontal) representing secondary secret spot */}
        <path d="M 37 85 L 43 91 M 43 85 L 37 91" fill="none" stroke="#7c3aed" strokeWidth="1" strokeLinecap="round" strokeDasharray="0.5 0.3" filter="url(#uv-glow)" />

        {/* Interactive handwritten arrow pointing at the pin/building from the case notes on the right */}
        <path d="M 138 115 Q 128 114 120 113" fill="none" stroke="#7c3aed" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="0.6 0.3" filter="url(#uv-glow)" />
        <path d="M 120 113 L 124 110 M 120 113 L 123 116" fill="none" stroke="#7c3aed" strokeWidth="0.8" strokeLinecap="round" filter="url(#uv-glow)" />

        {/* Dashed route line curving safely around the station building, avoiding pin/bubble overlap */}
        <path d="M 40 48 Q 40 100 65 125 Q 90 140 160 146" fill="none" stroke="#7c3aed" strokeWidth="0.9" strokeDasharray="3 2" filter="url(#uv-glow)" opacity="0.85" />
        <path d="M 60 122 L 65 125 L 63 130" fill="none" stroke="#7c3aed" strokeWidth="0.9" strokeLinecap="round" filter="url(#uv-glow)" />

        {/* АГЕНТ: Near the building, centered horizontally in the clear grid cell (x:41-64, y:48-72) */}
        <g filter="url(#uv-glow)">
          <text x="52.5" y="65" fill="#6d28d9" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">АГЕНТ</text>
          <text x="52.5" y="72" fill="#6d28d9" fontFamily="monospace" fontSize="5" fontWeight="bold" textAnchor="middle">сектор Б-2</text>
          <path d="M 44 68 H 61" fill="none" stroke="#7c3aed" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="0.6 0.3" />
        </g>

        {/* ИНФОРМАТОР: Inside the building, horizontal at the top of the terminal footprint with high-contrast white fill */}
        <g filter="url(#uv-glow)">
          <text x="102" y="75" fill="#ffffff" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">ИНФОРМАТОР</text>
          <path d="M 85 78 H 117" fill="none" stroke="#e9d5ff" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="0.6 0.3" />
        </g>

        <g transform="rotate(5, 135, 47)" filter="url(#uv-glow)">
          <text x="135" y="47" fill="#6d28d9" fontFamily="monospace" fontSize="6" fontWeight="bold">сектор Г-1</text>
        </g>

        <g transform="rotate(-3, 26, 146)" filter="url(#uv-glow)">
          <text x="26" y="146" fill="#6d28d9" fontFamily="monospace" fontSize="8" fontWeight="bold">▼ 16:00 · НАЧАЛО</text>
        </g>

        <g transform="rotate(6, 58, 172)" filter="url(#uv-glow)">
          <text x="58" y="172" fill="#6d28d9" fontFamily="monospace" fontSize="8" fontWeight="bold">ОБВ.КАН. → 118С</text>
        </g>

        {/* Case note placed to the right of the building, below the pin label */}
        <g transform="rotate(-2, 142, 115)" filter="url(#uv-glow)">
          <text x="142" y="115" fill="#6d28d9" fontFamily="monospace" fontSize="8" fontWeight="bold">ДЕЛО №1853</text>
          <path d="M 140 119 Q 155 119 188 118" fill="none" stroke="#7c3aed" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="0.6 0.3" />
        </g>

        {/* Cipher mark placed above the pin label */}
        <text x="130" y="65" fill="#6d28d9" fontFamily="monospace" fontSize="10" fontWeight="bold" filter="url(#uv-glow)">※</text>

        <g transform="rotate(-90, 18, 100)" filter="url(#uv-glow)">
          <text x="18" y="100" fill="#6d28d9" fontFamily="monospace" fontSize="6" fontWeight="bold">{"// СЕКРЕТНО //"}</text>
        </g>
      </g>
    )}
  </svg>
);

export const GamesImage: React.FC<{ className?: string; isHovered?: boolean }> = ({
  className = "w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]",
  isHovered = false,
}) => {
  // ponytail: simple css keyframe-based particle emitter, avoids stateful hooks or canvas overhead
  const cleanedClassName = className.replace("h-full", "h-auto");
  return (
    <div className={`relative ${cleanedClassName}`}>
    {/* Реалистичная тень позади коробок (мягко размывается на доске без обрезки) */}
    <div 
      className="absolute pointer-events-none z-0" 
      style={{
        inset: "-20%",
        transform: "translate(-10px, 15px)",
        background: "radial-gradient(circle, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.25) 50%, transparent 75%)",
        filter: "blur(12px)",
      }}
    />
    
    {/* Glow particles (only shown when hovered) */}
    {isHovered && (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        <style>{`
          @keyframes particleUpLeft {
            0% { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 0; }
            15% { opacity: 0.85; }
            100% { transform: translate(-30px, -65px) scale(1.4) rotate(120deg); opacity: 0; }
          }
          @keyframes particleUpRight {
            0% { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 0; }
            15% { opacity: 0.9; }
            100% { transform: translate(30px, -65px) scale(1.4) rotate(-120deg); opacity: 0; }
          }
          @keyframes particleUp {
            0% { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 0; }
            15% { opacity: 0.9; }
            100% { transform: translate(0, -80px) scale(1.5) rotate(45deg); opacity: 0; }
          }
          @keyframes particleLeft {
            0% { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 0; }
            15% { opacity: 0.8; }
            100% { transform: translate(-45px, -35px) scale(1.3) rotate(-60deg); opacity: 0; }
          }
          @keyframes particleRight {
            0% { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 0; }
            15% { opacity: 0.8; }
            100% { transform: translate(45px, -35px) scale(1.3) rotate(60deg); opacity: 0; }
          }
          .gp-1 { animation: particleUpLeft 2.4s infinite ease-out 0.0s; }
          .gp-2 { animation: particleUpRight 1.8s infinite ease-out 0.2s; }
          .gp-3 { animation: particleUp 2.2s infinite ease-out 0.4s; }
          .gp-4 { animation: particleLeft 2.0s infinite ease-out 0.6s; }
          .gp-5 { animation: particleRight 1.7s infinite ease-out 0.8s; }
          .gp-6 { animation: particleUpLeft 2.1s infinite ease-out 1.0s; }
          .gp-7 { animation: particleUpRight 2.5s infinite ease-out 1.2s; }
          .gp-8 { animation: particleUp 1.9s infinite ease-out 1.4s; }
          .gp-9 { animation: particleLeft 2.3s infinite ease-out 1.6s; }
          .gp-10 { animation: particleRight 2.0s infinite ease-out 1.8s; }
          .gp-11 { animation: particleUpLeft 1.6s infinite ease-out 2.0s; }
          .gp-12 { animation: particleUpRight 2.2s infinite ease-out 2.2s; }
        `}</style>
        {/* Gold particles (warm gold lamp sparks) */}
        <span className="absolute rounded-full bg-[#d4af37] opacity-0 blur-[1px] gp-1" style={{ width: '5px', height: '5px', left: '20%', top: '80%', boxShadow: '0 0 6px #d4af37, 0 0 12px #b8860b' }} />
        <span className="absolute rounded-full bg-[#d4af37] opacity-0 blur-[1px] gp-4" style={{ width: '4px', height: '4px', left: '10%', top: '30%', boxShadow: '0 0 6px #d4af37, 0 0 12px #b8860b' }} />
        <span className="absolute rounded-full bg-[#d4af37] opacity-0 blur-[1px] gp-7" style={{ width: '6px', height: '6px', left: '30%', top: '75%', boxShadow: '0 0 6px #d4af37, 0 0 12px #b8860b' }} />
        <span className="absolute rounded-full bg-[#d4af37] opacity-0 blur-[1px] gp-10" style={{ width: '5px', height: '5px', left: '80%', top: '25%', boxShadow: '0 0 6px #d4af37, 0 0 12px #b8860b' }} />

        {/* Crimson particles (mysterious blood/danger indicators) */}
        <span className="absolute rounded-full bg-[#8b0000] opacity-0 blur-[1px] gp-2" style={{ width: '4px', height: '4px', left: '70%', top: '70%', boxShadow: '0 0 6px #8b0000, 0 0 12px #4a0000' }} />
        <span className="absolute rounded-full bg-[#8b0000] opacity-0 blur-[1px] gp-5" style={{ width: '5px', height: '5px', left: '85%', top: '40%', boxShadow: '0 0 6px #8b0000, 0 0 12px #4a0000' }} />
        <span className="absolute rounded-full bg-[#8b0000] opacity-0 blur-[1px] gp-8" style={{ width: '4px', height: '4px', left: '60%', top: '65%', boxShadow: '0 0 6px #8b0000, 0 0 12px #4a0000' }} />
        <span className="absolute rounded-full bg-[#8b0000] opacity-0 blur-[1px] gp-11" style={{ width: '5px', height: '5px', left: '15%', top: '55%', boxShadow: '0 0 6px #8b0000, 0 0 12px #4a0000' }} />

        {/* Ash/smoke particles (drifting dark charcoal/burnt paper specs) */}
        <span className="absolute bg-[#4a4a4a] opacity-0 blur-[1.5px] gp-3" style={{ width: '7px', height: '7px', borderRadius: '35% 65% 70% 30% / 50% 60% 40% 50%', left: '40%', top: '50%', boxShadow: '0 0 4px #2b2b2b, 0 0 8px #121212' }} />
        <span className="absolute bg-[#4a4a4a] opacity-0 blur-[1.5px] gp-6" style={{ width: '6px', height: '6px', borderRadius: '60% 40% 50% 50% / 40% 50% 60% 50%', left: '50%', top: '15%', boxShadow: '0 0 4px #2b2b2b, 0 0 8px #121212' }} />
        <span className="absolute bg-[#4a4a4a] opacity-0 blur-[1.5px] gp-9" style={{ width: '8px', height: '8px', borderRadius: '45% 55% 35% 65% / 55% 45% 55% 45%', left: '25%', top: '45%', boxShadow: '0 0 4px #2b2b2b, 0 0 8px #121212' }} />
        <span className="absolute bg-[#4a4a4a] opacity-0 blur-[1.5px] gp-12" style={{ width: '6px', height: '6px', borderRadius: '50% 50% 40% 60% / 60% 40% 60% 40%', left: '65%', top: '35%', boxShadow: '0 0 4px #2b2b2b, 0 0 8px #121212' }} />
      </div>
    )}

    
    {/* Картинка с играми с фильтром сепии и контраста без квадратных наложений */}
    <Image 
      src="/images/board/games.webp" 
      alt="Настольные игры" 
      width={1365}
      height={1365}
      className="w-full h-auto select-none relative z-10"
      style={{
        filter: "saturate(0.55) contrast(1.15) sepia(0.3) brightness(0.9)",
      }}
    />
    
    </div>
  );
};

export const VintageClockSvg: React.FC<{ className?: string }> = ({
  className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
}) => {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // ponytail: standard setInterval clock, adequate for standard UI ticking
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayTime = mounted ? now : new Date(2026, 0, 1, 12, 0, 0);

  const seconds = displayTime.getSeconds();
  const minutes = displayTime.getMinutes();
  const hours = displayTime.getHours();

  const [secondsDeg, setSecondsDeg] = useState(seconds * 6);
  const [minutesDeg, setMinutesDeg] = useState(minutes * 6 + seconds * 0.1);
  const [hoursDeg, setHoursDeg] = useState((hours % 12) * 30 + minutes * 0.5);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecondsDeg(prev => prev + ((seconds * 6 - prev) % 360 + 360) % 360);
    setMinutesDeg(prev => prev + (((minutes * 6 + seconds * 0.1) - prev) % 360 + 360) % 360);
    setHoursDeg(prev => prev + ((((hours % 12) * 30 + minutes * 0.5) - prev) % 360 + 360) % 360);
  }, [seconds, minutes, hours]);

  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Pocketwatch loop at the top */}
      <circle cx="80" cy="15" r="12" fill="none" stroke="#c8a96e" strokeWidth="4" />
      <rect x="76" y="22" width="8" height="10" fill="#c8a96e" />

      {/* Watch Outer Case */}
      <circle cx="80" cy="90" r="60" fill="#2d251a" stroke="#c8a96e" strokeWidth="5" />
      {/* Bezel inner highlight */}
      <circle cx="80" cy="90" r="55" fill="none" stroke="#e8dcc8" strokeWidth="1" opacity="0.3" />
      {/* Dial Face */}
      <circle cx="80" cy="90" r="52" fill="#ecdcb9" />
      
      {/* Dial markings / Roman Numerals */}
      <g fill="#2d251a" fontFamily="Georgia, serif" fontSize="8" fontWeight="bold" textAnchor="middle">
        <text x="80" y="52">XII</text>
        <text x="118" y="93" textAnchor="middle">III</text>
        <text x="80" y="133">VI</text>
        <text x="42" y="93" textAnchor="middle">IX</text>
        
        {/* Tiny ticks */}
        <circle cx="80" cy="42" r="1.5" />
        <circle cx="128" cy="90" r="1.5" />
        <circle cx="80" cy="138" r="1.5" />
        <circle cx="32" cy="90" r="1.5" />
      </g>

      {/* Hour Hand */}
      <path
        d="M80 90 L80 62"
        stroke="#1c160e"
        strokeWidth="4.5"
        strokeLinecap="round"
        transform={`rotate(${hoursDeg}, 80, 90)`}
      />
      {/* Minute Hand */}
      <path
        d="M80 90 L80 50"
        stroke="#1c160e"
        strokeWidth="3.5"
        strokeLinecap="round"
        transform={`rotate(${minutesDeg}, 80, 90)`}
      />
      {/* Second Hand */}
      <path
        d="M80 90 L80 46"
        stroke="#c41e1e"
        strokeWidth="1.5"
        strokeLinecap="round"
        transform={`rotate(${secondsDeg}, 80, 90)`}
        style={{ transition: "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
      
      {/* Center Pin */}
      <circle cx="80" cy="90" r="5" fill="#c8a96e" stroke="#1c160e" strokeWidth="1" />
      <circle cx="80" cy="90" r="2" fill="#1c160e" />

      {/* Vintage Glass Shadow Overlay */}
      <path d="M35 60 C55 45 105 45 125 60" stroke="#fff" strokeWidth="3" opacity="0.25" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export const EvidenceBagSvg: React.FC<{ className?: string }> = ({ className = "w-full h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" }) => {
  const cleanedClassName = className.replace("h-full", "h-auto");
  return (
    <div className={`relative ${cleanedClassName}`}>
      <Image
        src="/images/board/evidence.webp"
        alt="Пакет для улик"
        width={507}
        height={676}
        className="w-full h-auto rounded-[2px] select-none"
      />
    </div>
  );
};

export const NewspaperSvg: React.FC<{ className?: string; revealHidden?: boolean }> = ({
  className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]",
  revealHidden = false,
}) => (
  <svg viewBox="0 0 180 255" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      {/* UV glow filter specifically for newspaper to avoid DOM clashes */}
      <filter id="uv-glow-newspaper">
        <feGaussianBlur stdDeviation="0.4" result="blur" />
        <feFlood floodColor="#a855f7" floodOpacity="0.85" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Torn Paper base */}
    <path d="M 5 10 L 175 5 L 178 245 L 160 250 L 140 243 L 120 250 L 90 240 L 60 253 L 30 245 L 5 250 Z" fill="#F1E2C6" />
    
    {/* Main Headline */}
    <text x="90" y="30" fill="#1d1b18" fontSize="11" fontWeight="bold" fontFamily="Georgia, serif" textAnchor="middle" letterSpacing="0.5">
      САНКТ-ПЕТЕРБУРГЪ
    </text>
    <line x1="15" y1="36" x2="165" y2="36" stroke="#1d1b18" strokeWidth="1.5" />
    
    <text x="90" y="52" fill="#1d1b18" fontSize="11" fontWeight="900" fontFamily="Georgia, serif" textAnchor="middle" textLength="150" lengthAdjust="spacingAndGlyphs">
      ТАИНСТВЕННЫЙ ВЕЧЕР
    </text>
    <text x="90" y="66" fill="#1d1b18" fontSize="7" fontWeight="bold" fontFamily="Georgia, serif" textAnchor="middle" fontStyle="italic" textLength="150" lengthAdjust="spacingAndGlyphs">
      Детективные игры на Вокзале 1853
    </text>
    
    <line x1="15" y1="72" x2="165" y2="72" stroke="#1d1b18" strokeWidth="0.5" />
    
    {/* Newspaper Columns */}
    {/* Column 1 */}
    <g fill="#333" opacity="0.8">
      <rect x="15" y="80" width="70" height="4" rx="0.5" />
      <rect x="15" y="88" width="70" height="4" rx="0.5" />
      <rect x="15" y="96" width="55" height="4" rx="0.5" />
      
      <rect x="15" y="108" width="70" height="4" rx="0.5" />
      <rect x="15" y="116" width="70" height="4" rx="0.5" />
      <rect x="15" y="124" width="70" height="4" rx="0.5" />
      <rect x="15" y="132" width="45" height="4" rx="0.5" />
    </g>
    
    {/* Column 2 */}
    <g fill="#333" opacity="0.8">
      <rect x="95" y="80" width="70" height="4" rx="0.5" />
      <rect x="95" y="88" width="70" height="4" rx="0.5" />
      <rect x="95" y="96" width="70" height="4" rx="0.5" />
      
      <rect x="95" y="108" width="70" height="4" rx="0.5" />
      <rect x="95" y="116" width="50" height="4" rx="0.5" />
      <rect x="95" y="124" width="70" height="4" rx="0.5" />
      <rect x="95" y="132" width="60" height="4" rx="0.5" />
    </g>

    {/* Illustration in paper */}
    <image
      href={revealHidden ? "/images/board/newspaper_story_uv.webp" : "/images/board/newspaper_story.webp"}
      x="15"
      y="145"
      width="150"
      height="90"
      preserveAspectRatio="xMidYMid slice"
      style={{ filter: "saturate(0.65) contrast(1.1) brightness(0.98)" }}
    />
    {/* Paper aging stains */}
    <circle cx="30" cy="60" r="15" fill="#a48c68" opacity="0.15" filter="blur(4px)" />
    <circle cx="150" cy="210" r="20" fill="#a48c68" opacity="0.2" filter="blur(6px)" />
    
    {revealHidden && (
      <g className="uv-notes">
        {/* Scratched arrow pointing up-left towards Suspect 2 (Informant) - thickened and repositioned */}
        <g filter="url(#uv-glow-newspaper)" opacity="0.95">
          {/* Arrow shaft */}
          <path d="M 140 85 Q 123 50 110 20" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
          {/* Arrow head pointing up-left */}
          <path d="M 110 20 L 102 28 M 110 20 L 117 28" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        
        {/* Scratched text ИНФОРМАТОР - thickened and repositioned to headline area */}
        <g transform="translate(30, 85) rotate(-5) scale(0.95)" filter="url(#uv-glow-newspaper)" opacity="0.95">
          {/* И */}
          <path d="M 0 12 L 0 0 M 8 12 L 8 0 M 0 12 L 8 0" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {/* Н */}
          <path d="M 11 12 L 11 0 M 19 12 L 19 0 M 11 6 L 19 6" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {/* Ф */}
          <path d="M 28 12 L 28 0 M 23 6 C 23 3, 28 3, 28 6 C 28 9, 23 9, 23 6 Z M 28 6 C 28 3, 33 3, 33 6 C 33 9, 28 9, 28 6 Z" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {/* О */}
          <path d="M 36 6 C 36 2, 44 2, 44 6 C 44 10, 36 10, 36 6 Z" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {/* Р */}
          <path d="M 47 12 L 47 0 C 52 0, 54 3, 47 6" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {/* М */}
          <path d="M 57 12 L 57 0 L 62 8 L 67 0 L 67 12" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {/* А */}
          <path d="M 70 12 L 74 0 L 78 12 M 72 8 L 76 8" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {/* Т */}
          <path d="M 81 0 L 89 0 M 85 0 L 85 12" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {/* О */}
          <path d="M 92 6 C 92 2, 100 2, 100 6 C 100 10, 92 10, 92 6 Z" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {/* Р */}
          <path d="M 103 12 L 103 0 C 108 0, 110 3, 103 6" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    )}
  </svg>
);

export const DetectiveLogoSvg: React.FC<{ className?: string; width?: string | number; height?: string | number }> = ({ className, width = "100%", height = "100%" }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={width}
    height={height}
  >
    {/* Dark outer badge circular frame */}
    <circle cx="100" cy="100" r="95" fill="#141413" stroke="#c8a96e" strokeWidth="3" />
    <circle cx="100" cy="100" r="88" fill="#1c1b18" stroke="#c41e1e" strokeWidth="1.5" strokeDasharray="4 2" />

    {/* Pop-art geometric background rays */}
    <g opacity="0.15">
      <path d="M100 100 L50 10 L80 5 Z" fill="#c41e1e" />
      <path d="M100 100 L150 10 L120 5 Z" fill="#c41e1e" />
      <path d="M100 100 L190 70 L195 90 Z" fill="#c41e1e" />
      <path d="M100 100 L10 70 L5 90 Z" fill="#c41e1e" />
      <path d="M100 100 L50 190 L20 180 Z" fill="#c41e1e" />
      <path d="M100 100 L150 190 L180 180 Z" fill="#c41e1e" />
    </g>

    {/* Detective Face Silhouette (Pop art style) */}
    <path
      d="M100 45 C80 45 62 55 58 75 C85 68 115 68 142 75 C138 55 120 45 100 45 Z"
      fill="#0c0907"
    />
    {/* Fedora brim */}
    <path
      d="M35 78 C78 62 122 62 165 78 C165 78 120 68 100 68 C80 68 35 78 35 78 Z"
      fill="#c41e1e"
    />
    <path
      d="M38 80 C79 66 121 66 162 80 L155 77 C118 67 82 67 45 77 Z"
      fill="#0c0907"
    />

    {/* Face / Glasses / Shadow */}
    <path
      d="M60 80 C60 120 80 140 100 140 C120 140 140 120 140 80 H60 Z"
      fill="#decfa8"
    />
    {/* Sunglasses */}
    <path
      d="M65 92 C72 88 85 88 92 95 C93 90 107 90 108 95 C115 88 128 88 135 92 C140 99 135 110 125 110 C115 110 110 102 108 98 C106 102 101 110 91 110 C81 110 76 99 65 92 Z"
      fill="#0c0907"
    />
    {/* Sunglasses reflection highlight */}
    <path d="M72 95 L85 102" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M115 95 L128 102" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

    {/* Cheek and nose shadows */}
    <path d="M96 95 L96 118 L104 118 Z" fill="#0c0907" />
    <path d="M60 80 L80 135 L60 120 Z" fill="#0c0907" opacity="0.15" />
    <path d="M140 80 L120 135 L140 120 Z" fill="#0c0907" opacity="0.15" />

    {/* Collar / Coat / Tie */}
    <path d="M60 140 L100 185 L140 140 Z" fill="#0c0907" />
    <path d="M75 140 L100 165 L85 140 Z" fill="#decfa8" />
    <path d="M125 140 L100 165 L115 140 Z" fill="#decfa8" />
    <path d="M96 150 L100 185 L104 150 Z" fill="#c41e1e" />

    {/* Text Logo */}
    <defs>
      <path id="textPathTop" d="M 22 100 A 78 78 0 0 1 178 100" />
      <path id="textPathBottom" d="M 178 100 A 78 78 0 0 1 22 100" />
    </defs>
    
    <text fontFamily="monospace" fontSize="12.5" fontWeight="900" letterSpacing="3.5" fill="#c8a96e">
      <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
        DETECTIVE
      </textPath>
    </text>
    
    <text fontFamily="monospace" fontSize="12" fontWeight="900" letterSpacing="2.5" fill="#e8dcc8">
      <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
        TABLE TOP
      </textPath>
    </text>
  </svg>
);
