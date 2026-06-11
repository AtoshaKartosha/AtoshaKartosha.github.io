import React from "react";
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
export const DossierSvg: React.FC = () => {
  const isLoading = useBoardStore((state) => state.isLoading);
  
  return (
    <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
      {/* Folder Back */}
      <path d="M10 30 L120 30 L140 10 L290 10 L290 230 L10 230 Z" fill="#4a3e30" />
      <path d="M10 30 L120 30 L140 10 L290 10 L290 230 L10 230 Z" fill="#bfae93" opacity="0.85" />
      
      {/* Folder Inside / Papers */}
      <rect x="20" y="25" width="260" height="195" rx="2" fill="#eae1cb" transform="rotate(-1 150 120)" />
      <rect x="25" y="20" width="250" height="200" rx="2" fill="#f4edd9" transform="rotate(1.5 150 120)" />
      
      {/* File contents / Lines */}
      <g transform="rotate(1.5 150 120)">
        {/* Photo inside folder */}
        <rect x="40" y="45" width="60" height="70" fill="#222" stroke="#fff" strokeWidth="3" />
        <circle cx="70" cy="75" r="12" fill="#555" />
        <path d="M50 110 C50 95 90 95 90 110 Z" fill="#444" />
        
        {/* Typed details */}
        <rect x="115" y="50" width="120" height="8" rx="1" fill="#443a2d" opacity="0.8" />
        <rect x="115" y="65" width="90" height="6" rx="1" fill="#443a2d" opacity="0.6" />
        <rect x="115" y="78" width="105" height="6" rx="1" fill="#443a2d" opacity="0.6" />
        <rect x="115" y="91" width="75" height="6" rx="1" fill="#443a2d" opacity="0.6" />
        
        {/* Big Stamp */}
        <g transform="translate(140, 110) rotate(-15)">
          <rect x="0" y="0" width="100" height="35" rx="3" fill="none" stroke="#c41e1e" strokeWidth="3" strokeDasharray="3 1" />
          <text x="50" y="22" fill="#c41e1e" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            ДЕТЕКТИВ
          </text>
          <text x="50" y="31" fill="#c41e1e" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            КЛУБ СПБ
          </text>
        </g>
        
        {/* Handwriting / Signature */}
        <path d="M40 145 Q50 135 70 145 T100 135 T130 145" stroke="#1d2e54" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      </g>

      {/* Folder Front Flap */}
      <path d="M10 40 L130 40 L150 50 L290 50 L290 230 L10 230 Z" fill="#a49377" />
      <path d="M10 40 L290 40 L290 230 L10 230 Z" fill="#8f7e63" opacity="0.3" />
      
      {/* Clasp / String tie */}
      <circle cx="150" cy="140" r="10" fill="#2d2217" />
      <circle cx="150" cy="140" r="4" fill="#c8a96e" />
      
      {/* Detective Logo on cover */}
      <g transform="translate(100, 70)" data-logo-target="true">
        <circle cx="50" cy="50" r="48" fill="none" />
        <g className="transition-opacity duration-200" style={{ opacity: isLoading ? 0 : 1 }}>
          <DetectiveLogoSvg className="w-[100px] h-[100px]" />
        </g>
      </g>
      
      {/* Text below logo */}
      <text x="150" y="195" fill="#2d2217" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="1.2">
        ДEЛО № 1853
      </text>
      <text x="150" y="210" fill="#5c1212" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.8">
        TOP SECRET
      </text>
    </svg>
  );
};

// Polaroid Suspect 1 (The Femme Fatale / Agent)
export const Suspect1Svg: React.FC = () => (
  <svg viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
    {/* Paper backing */}
    <rect width="160" height="190" fill="#f1ece1" rx="2" />
    <rect x="5" y="5" width="150" height="145" fill="#141414" />
    
    {/* Silhouette / Portrait */}
    <g opacity="0.8">
      {/* Background sepia/warm tone gradient */}
      <rect x="5" y="5" width="150" height="145" fill="url(#sepia-grad)" />
      
      {/* Shadow Silhouette of a lady with a noir hat */}
      <path d="M80 35 C60 35 48 45 42 62 C40 68 42 72 45 74 C50 76 58 72 65 65 C68 75 75 80 82 80 C92 80 98 70 98 60 C98 50 90 35 80 35 Z" fill="#181310" />
      {/* Hat brim */}
      <path d="M25 58 Q80 40 135 58 C135 58 100 48 80 48 Q60 48 25 58 Z" fill="#0d0a08" />
      {/* Coat shoulders */}
      <path d="M30 150 C30 110 50 100 65 105 C70 95 90 95 95 105 C110 100 130 110 130 150 Z" fill="#181310" />
      
      {/* Vintage Photo Scratches/Noise */}
      <line x1="20" y1="20" x2="35" y2="130" stroke="#f1ece1" strokeWidth="0.5" opacity="0.15" />
      <line x1="130" y1="15" x2="100" y2="120" stroke="#f1ece1" strokeWidth="0.5" opacity="0.1" />
      <circle cx="50" cy="50" r="1" fill="#fff" opacity="0.3" />
      <circle cx="110" cy="90" r="1.5" fill="#fff" opacity="0.2" />
    </g>

    {/* Handwritten label */}
    <text x="80" y="172" fill="#3c3024" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle" transform="rotate(-2 80 172)">
      «АГЕНТ»
    </text>

    {/* Gradients */}
    <defs>
      <linearGradient id="sepia-grad" x1="80" y1="5" x2="80" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4a3b2c" />
        <stop offset="50%" stopColor="#2c2014" />
        <stop offset="100%" stopColor="#140d07" />
      </linearGradient>
    </defs>
  </svg>
);

// Polaroid Suspect 2 (The Mobster / Informant)
export const Suspect2Svg: React.FC = () => (
  <svg viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
    {/* Paper backing */}
    <rect width="160" height="190" fill="#eae3d5" rx="2" />
    <rect x="5" y="5" width="150" height="145" fill="#141414" />
    
    {/* Silhouette / Portrait */}
    <g opacity="0.8">
      {/* Background sepia/warm tone gradient */}
      <rect x="5" y="5" width="150" height="145" fill="url(#sepia-grad-2)" />
      
      {/* Shadow Silhouette of a man with fedora and collar up */}
      <path d="M80 30 C68 30 58 38 58 48 C58 52 65 54 65 56 C52 56 32 68 38 90 Q80 75 122 90 C128 68 108 56 95 56 C95 54 102 52 102 48 C102 38 92 30 80 30 Z" fill="#15110e" />
      {/* Fedora brim */}
      <path d="M30 52 Q80 42 130 52 L120 47 Q80 38 40 47 Z" fill="#0c0907" />
      {/* Shoulders / Coat */}
      <path d="M20 150 L35 110 L60 115 L80 102 L100 115 L125 110 L140 150 Z" fill="#15110e" />
      
      {/* Vintage Photo Scratches/Noise */}
      <line x1="40" y1="10" x2="45" y2="140" stroke="#f1ece1" strokeWidth="0.5" opacity="0.1" />
      <circle cx="120" cy="40" r="1" fill="#fff" opacity="0.2" />
      <circle cx="30" cy="100" r="1.5" fill="#fff" opacity="0.3" />
    </g>

    {/* Handwritten label */}
    <text x="80" y="172" fill="#3c3024" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle" transform="rotate(1.5 80 172)">
      «ИНФОРМАТОР»
    </text>

    {/* Gradients */}
    <defs>
      <linearGradient id="sepia-grad-2" x1="80" y1="5" x2="80" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#43372c" />
        <stop offset="60%" stopColor="#241a12" />
        <stop offset="100%" stopColor="#0d0805" />
      </linearGradient>
    </defs>
  </svg>
);

// Map / Location Card
export const MapSvg: React.FC = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
    {/* Map Paper */}
    <rect width="200" height="200" rx="4" fill="#decfa8" />
    <rect x="4" y="4" width="192" height="192" rx="2" fill="#e8dcba" stroke="#b4a377" strokeWidth="2" />
    
    {/* Grid / Faint Lines */}
    <g opacity="0.2" stroke="#6b5b3d" strokeWidth="1">
      <line x1="40" y1="4" x2="40" y2="196" />
      <line x1="80" y1="4" x2="80" y2="196" />
      <line x1="120" y1="4" x2="120" y2="196" />
      <line x1="160" y1="4" x2="160" y2="196" />
      <line x1="4" y1="40" x2="196" y2="40" />
      <line x1="4" y1="80" x2="196" y2="80" />
      <line x1="4" y1="120" x2="196" y2="120" />
      <line x1="4" y1="160" x2="196" y2="160" />
    </g>

    {/* River / Canals (St Petersburg style) */}
    <path d="M4 110 Q40 115 80 90 T140 100 T196 80 L196 110 T140 130 T80 120 T4 135 Z" fill="#9ea5a5" opacity="0.6" />
    <path d="M4 110 Q40 115 80 90 T140 100 T196 80" stroke="#7e8888" strokeWidth="3" opacity="0.8" />
    
    {/* Streets / Blocks */}
    <g stroke="#8f7e59" strokeWidth="2" strokeLinecap="round" opacity="0.7">
      {/* Horizontal & Diagonal Streets */}
      <line x1="20" y1="20" x2="180" y2="20" />
      <line x1="10" y1="60" x2="190" y2="60" />
      <line x1="15" y1="150" x2="185" y2="150" />
      
      <line x1="40" y1="20" x2="70" y2="190" />
      <line x1="100" y1="10" x2="100" y2="190" />
      <line x1="150" y1="20" x2="130" y2="190" />
      
      {/* Circular Ring/Bypass */}
      <path d="M 50 100 A 50 50 0 1 0 150 100 A 50 50 0 1 0 50 100" stroke="#8f7e59" strokeWidth="3" fill="none" strokeDasharray="6 3" />
    </g>

    {/* Big Red Circle Marking Vokzal 1853 */}
    <circle cx="100" cy="100" r="14" fill="#c41e1e" fillOpacity="0.2" stroke="#c41e1e" strokeWidth="2" strokeDasharray="3 2" />
    <circle cx="100" cy="100" r="4" fill="#c41e1e" />
    
    {/* Label */}
    <rect x="75" y="120" width="70" height="18" rx="2" fill="#141414" opacity="0.85" />
    <text x="110" y="132" fill="#e8dcc8" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
      ВОКЗАЛЪ 1853
    </text>
  </svg>
);

// Rotary Phone
export const RotaryPhoneSvg: React.FC = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]">
    {/* Base of phone */}
    <path d="M40 140 C40 100 60 70 100 70 C140 70 160 100 160 140 C160 160 150 170 100 170 C50 170 40 160 40 140 Z" fill="#1c1b18" />
    <path d="M45 138 C45 105 62 76 100 76 C138 76 155 105 155 138 Z" fill="#2d2b27" opacity="0.5" />
    
    {/* Rotary Dial */}
    <circle cx="100" cy="125" r="35" fill="#141413" stroke="#c8a96e" strokeWidth="2" />
    <circle cx="100" cy="125" r="28" fill="#eae2d2" />
    
    {/* Finger holes */}
    <g fill="#141413">
      <circle cx="100" cy="102" r="5" />
      <circle cx="116" cy="107" r="5" />
      <circle cx="125" cy="120" r="5" />
      <circle cx="122" cy="136" r="5" />
      <circle cx="110" cy="146" r="5" />
      <circle cx="94" cy="146" r="5" />
      <circle cx="82" cy="138" r="5" />
      <circle cx="76" cy="122" r="5" />
      <circle cx="82" cy="107" r="5" />
    </g>
    
    {/* Center dial cap */}
    <circle cx="100" cy="125" r="12" fill="#141413" stroke="#c8a96e" strokeWidth="1" />
    <circle cx="100" cy="125" r="8" fill="#c41e1e" />

    {/* Cradle forks */}
    <path d="M75 60 L75 72 L85 72 L85 60 Z" fill="#1c1b18" />
    <path d="M115 60 L115 72 L125 72 L125 60 Z" fill="#1c1b18" />
    <path d="M65 55 L95 58 L95 53 Z" fill="#111" />
    <path d="M135 55 L105 58 L105 53 Z" fill="#111" />

    {/* Handset */}
    <path d="M45 50 C45 35 60 25 100 25 C140 25 155 35 155 50 L165 52 C170 42 150 20 100 20 C50 20 30 42 35 52 Z" fill="#141413" />
    {/* Left Earpiece */}
    <rect x="30" y="45" width="22" height="15" rx="3" fill="#1c1b18" transform="rotate(-15 30 45)" />
    {/* Right Mouthpiece */}
    <rect x="148" y="45" width="22" height="15" rx="3" fill="#1c1b18" transform="rotate(15 148 45)" />

    {/* Fabric cord representation */}
    <path d="M50 145 Q20 160 30 180 T70 170" stroke="#2c2b27" strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray="3 1" />
  </svg>
);

// Vintage Analog Clock / Watch (Set to 16:00)
export const VintageClockSvg: React.FC = () => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
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

    {/* Hour and Minute Hands (set to 16:00) */}
    {/* Minute Hand (pointing to 12 / XII) */}
    <path d="M80 90 L80 50" stroke="#1c160e" strokeWidth="3.5" strokeLinecap="round" />
    {/* Hour Hand (pointing to 4 / IIII, approx 120 degrees) */}
    <path d="M80 90 L108 106" stroke="#1c160e" strokeWidth="4.5" strokeLinecap="round" />
    
    {/* Center Pin */}
    <circle cx="80" cy="90" r="5" fill="#c8a96e" stroke="#1c160e" strokeWidth="1" />
    <circle cx="80" cy="90" r="2" fill="#1c160e" />

    {/* Vintage Glass Shadow Overlay */}
    <path d="M35 60 C55 45 105 45 125 60" stroke="#fff" strokeWidth="3" opacity="0.25" strokeLinecap="round" fill="none" />
  </svg>
);

// Evidence Bag with Dice
export const EvidenceBagSvg: React.FC = () => (
  <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
    {/* Plastic Bag Back */}
    <rect width="160" height="200" rx="6" fill="#fff" fillOpacity="0.08" />
    <rect x="2" y="2" width="156" height="196" rx="4" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.15" />
    
    {/* Zipper top */}
    <rect x="2" y="25" width="156" height="10" fill="#2d6bb3" fillOpacity="0.8" />
    <line x1="2" y1="30" x2="158" y2="30" stroke="#fff" strokeWidth="1" strokeOpacity="0.5" />
    
    {/* Evidence tag stapled to the top */}
    <g transform="rotate(-3 80 70)">
      <rect x="20" y="45" width="120" height="60" fill="#fcfbf7" rx="1" stroke="#d5d1c5" strokeWidth="1" />
      {/* Tag Lines & Writing */}
      <text x="80" y="58" fill="#141414" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        EVIDENCE BAG
      </text>
      <line x1="25" y1="65" x2="135" y2="65" stroke="#908a78" strokeWidth="0.5" />
      <text x="30" y="75" fill="#444" fontSize="5" fontFamily="monospace">CASE: D-1853</text>
      <text x="30" y="85" fill="#444" fontSize="5" fontFamily="monospace">DATE: 11/06/26</text>
      <text x="30" y="95" fill="#c41e1e" fontSize="6" fontWeight="bold" fontFamily="monospace">ITEM: #08 DICE</text>
      
      {/* Staple representation */}
      <line x1="75" y1="42" x2="85" y2="42" stroke="#888" strokeWidth="2" />
    </g>

    {/* Dice inside the bag (rendered behind front plastic) */}
    <g transform="translate(40, 120) rotate(12)">
      {/* 3D Dice 1 (Red d6) */}
      <rect x="0" y="0" width="35" height="35" rx="4" fill="#c41e1e" stroke="#8d1111" strokeWidth="1" />
      {/* Pip spots */}
      <circle cx="10" cy="10" r="3" fill="#fff" />
      <circle cx="25" cy="25" r="3" fill="#fff" />
      <circle cx="17.5" cy="17.5" r="3" fill="#fff" />
    </g>
    
    <g transform="translate(85, 130) rotate(-20)">
      {/* 3D Dice 2 (Black d6) */}
      <rect x="0" y="0" width="35" height="35" rx="4" fill="#1c1b18" stroke="#111" strokeWidth="1" />
      {/* Pip spots */}
      <circle cx="17.5" cy="17.5" r="3.5" fill="#c8a96e" />
    </g>

    {/* Plastic highlights on front */}
    <path d="M10 50 L40 180" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.1" />
    <path d="M140 60 L120 170" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.08" />
  </svg>
);

// Newspaper Clipping
export const NewspaperSvg: React.FC = () => (
  <svg viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
    {/* Torn Paper base */}
    <path d="M 5 10 L 175 5 L 178 210 L 160 215 L 140 208 L 120 215 L 90 205 L 60 218 L 30 210 L 5 215 Z" fill="#dfd6c0" />
    
    {/* Main Headline */}
    <text x="90" y="30" fill="#1d1b18" fontSize="11" fontWeight="bold" fontFamily="Georgia, serif" textAnchor="middle" letterSpacing="0.5">
      САНКТ-ПЕТЕРБУРГЪ
    </text>
    <line x1="15" y1="36" x2="165" y2="36" stroke="#1d1b18" strokeWidth="1.5" />
    
    <text x="90" y="52" fill="#1d1b18" fontSize="13" fontWeight="900" fontFamily="Georgia, serif" textAnchor="middle">
      ТАИНСТВЕННЫЙ ВЕЧЕР
    </text>
    <text x="90" y="66" fill="#1d1b18" fontSize="8" fontWeight="bold" fontFamily="Georgia, serif" textAnchor="middle" fontStyle="italic">
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
    <rect x="15" y="145" width="150" height="50" fill="#2d2a24" />
    {/* Sketch in illustration */}
    <path d="M40 185 Q90 150 140 185" stroke="#dfd6c0" strokeWidth="1" fill="none" opacity="0.4" />
    <circle cx="90" cy="165" r="8" fill="none" stroke="#dfd6c0" strokeWidth="1" opacity="0.4" />

    {/* Paper aging stains */}
    <circle cx="30" cy="60" r="15" fill="#a48c68" opacity="0.15" filter="blur(4px)" />
    <circle cx="150" cy="180" r="20" fill="#a48c68" opacity="0.2" filter="blur(6px)" />
  </svg>
);

export const DetectiveLogoSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
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
