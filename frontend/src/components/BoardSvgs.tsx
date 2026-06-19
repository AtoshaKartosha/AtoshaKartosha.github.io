import React, { useState, useEffect } from "react";
import { useBoardStore } from "../stores/useBoardStore";

// Corkboard SVG Pattern overlay for background texture
export const CorkboardTexture: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <filter id="cork-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0  0.3333 0.3333 0.3333 0 0  0.3333 0.3333 0.3333 0 0  0 0 0 0.15 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#cork-noise)" />
  </svg>
);

// Dossier / Main case folder
export const DossierSvg: React.FC<{ forceLogo?: boolean; className?: string }> = ({ forceLogo = false, className = "w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]" }) => {
  const storeIsLoading = useBoardStore((state) => state.isLoading);
  const isLoading = forceLogo ? false : storeIsLoading;
  
  return (
    <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
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
      <image 
        href="/logo_detective.svg" 
        x="90" 
        y="30" 
        width="120" 
        height="60.3" 
        className="transition-opacity duration-200 select-none" 
        style={{ opacity: isLoading ? 0 : 1 }}
      />
      
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
    </svg>
  );
};

// Polaroid Suspect 1 (The Femme Fatale / Agent)
export const Suspect1Svg: React.FC<{ className?: string }> = ({ className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" }) => (
  <div className={`${className} bg-[#f5f4ef] p-[5%] aspect-square rounded-[2px] border border-[#dfded7] select-none flex flex-col justify-center items-center shadow-inner`}>
    <div className="w-full h-full relative overflow-hidden bg-[#121212] border border-black/15 rounded-[1px] flex items-center justify-center">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/board/suspect-1-video-poster.jpg"
        className="w-full h-full object-cover"
      >
        <source src="/images/board/suspect-1.webm" type="video/webm" />
        <source src="/images/board/suspect-1.mp4" type="video/mp4" />
      </video>
    </div>
  </div>
);

// Polaroid Suspect 2 (The Mobster / Informant)
export const Suspect2Svg: React.FC<{ className?: string }> = ({ className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" }) => (
  <div className={`${className} bg-[#f5f4ef] p-[5%] aspect-square rounded-[2px] border border-[#dfded7] select-none flex flex-col justify-center items-center shadow-inner`}>
    <div className="w-full h-full relative overflow-hidden bg-[#121212] border border-black/15 rounded-[1px] flex items-center justify-center">
      <video
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

export const MapSvg: React.FC<{ className?: string }> = ({ className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
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
    <rect x="83" y="65" width="34" height="32" rx="1.5" fill="#8f7e59" stroke="#6b5b3d" strokeWidth="1.5" />

    {/* Pin shadow */}
    <ellipse cx="100" cy="122" rx="7" ry="2" fill="#000" opacity="0.3" />

    {/* Tilted Pin body */}
    <path d="M100 120 C100 120 85 100 85 92 A15 15 0 1 1 115 92 C115 100 100 120 100 120 Z" fill="#e8dcc8" stroke="#801029" strokeWidth="1.5" transform="rotate(10, 100, 120)" />

    {/* Unrotated V letter (referenced directly from the logo SVG to preserve slant and styling) */}
    <use href="/logo_detective.svg#logo-v" transform="translate(-35.27, 59.52) scale(0.34)" />

    {/* Slanted speech bubble label (placed next to the pin to avoid board lamp and tape overlays) */}
    <g transform="rotate(-6, 152.5, 86)">
      <path d="M119 76 H186 A3 3 0 0 1 189 79 V93 A3 3 0 0 1 186 96 H118 L108 92 L116 84 V79 A3 3 0 0 1 119 76 Z" fill="#141414" stroke="#e8dcc8" strokeWidth="1" opacity="0.9" />
      <text x="152.5" y="89" fill="#e8dcc8" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">ВОКЗАЛЪ 1853</text>
    </g>
  </svg>
);

export const GamesImage: React.FC<{ className?: string }> = ({ className = "w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]" }) => (
  <div className="relative w-full h-full">
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
    {/* Картинка с играми с фильтром сепии и контраста без квадратных наложений */}
    <img 
      src="/images/board/games.webp" 
      alt="Настольные игры" 
      className={`${className} select-none relative z-10`}
      style={{
        filter: "saturate(0.55) contrast(1.15) sepia(0.3) brightness(0.9)",
      }}
    />
  </div>
);

export const VintageClockSvg: React.FC<{ className?: string }> = ({
  className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
}) => {
  const [now, setNow] = useState(() => new Date());

  // ponytail: standard setInterval clock, adequate for standard UI ticking
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondsDeg = seconds * 6;
  const minutesDeg = minutes * 6 + seconds * 0.1;
  const hoursDeg = (hours % 12) * 30 + minutes * 0.5;

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

export const EvidenceBagSvg: React.FC<{ className?: string }> = ({ className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" }) => (
  <img
    src="/images/board/evidence.webp"
    alt="Пакет для улик"
    className={`${className} rounded-[2px] select-none`}
  />
);

export const NewspaperSvg: React.FC<{ className?: string }> = ({ className = "w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" }) => (
  <svg viewBox="0 0 180 255" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
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
      href="/images/board/newspaper_story.webp"
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
