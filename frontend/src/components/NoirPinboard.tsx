import React from "react";

export const NoirPinboard: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute z-[2] select-none pointer-events-none overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]"
      style={{
        boxSizing: "border-box",
        left: "12.75%",
        right: "18.3%",
        top: "9.9%",
        bottom: "28.2%",
        background: "radial-gradient(circle at 85% 15%, #30241b 0%, #15100d 60%, #080605 100%)",
      }}
    >
      {/* 1. Halftone Dot Screen Overlay (Comic style) */}
      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="noir-halftone"
            x="0"
            y="0"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <circle cx="6" cy="6" r="1.5" fill="#000000" />
          </pattern>
          
          <pattern
            id="noir-hatching"
            x="0"
            y="0"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-30)"
          >
            <line x1="0" y1="0" x2="0" y2="16" stroke="#000000" strokeWidth="2" />
          </pattern>
        </defs>
        
        {/* Subtle halftone dots across the entire board */}
        <rect width="100%" height="100%" fill="url(#noir-halftone)" />
      </svg>

      {/* 2. Comic Hatching Shadows in the Bottom-Left (opposite to light source) */}
      <div 
        className="absolute bottom-0 left-0 w-2/3 h-2/3 pointer-events-none opacity-45"
        style={{
          maskImage: "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 75%)",
          WebkitMaskImage: "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 75%)",
        }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#noir-hatching)" />
        </svg>
      </div>

      {/* 3. Noir ink splatters / Grunge elements */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 800 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        {/* Splatter bottom left */}
        <path d="M 50 450 Q 70 420 90 440 T 110 460 T 80 480 Z" fill="#000000" />
        <circle cx="120" cy="430" r="3" fill="#000000" />
        <circle cx="135" cy="455" r="1.5" fill="#000000" />
        <circle cx="60" cy="400" r="4.5" fill="#000000" />
        
        {/* Splatter middle-right edge (dark shadow zone under lamp focus) */}
        <path d="M 780 280 Q 750 290 760 310 T 790 320 Z" fill="#000000" />
        <circle cx="740" cy="315" r="2.5" fill="#000000" />

        {/* Comic board seam / vignette frame line (hand-drawn effect) */}
        <path 
          d="M 15 15 L 785 15 L 785 485 L 15 485 Z" 
          fill="none" 
          stroke="#000000" 
          strokeWidth="3.5" 
          strokeDasharray="900 10 500 8"
          opacity="0.85" 
        />
      </svg>

      {/* 5. Subtle stains and light falloff on the board */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-25"
        style={{
          backgroundImage: "radial-gradient(circle at 85% 15%, transparent 30%, #000 85%)",
        }}
      />
      
      {/* Comic board inner shadow overlay */}
      <div className="absolute inset-0 pointer-events-none border-[2px] border-black opacity-80 rounded-sm" />
    </div>
  );
};
