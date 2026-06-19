"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBoardStore } from "../stores/useBoardStore";
import Image from "next/image";

export const LoadingScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  
  const setIsLoading = useBoardStore((state) => state.setIsLoading);
  const [text, setText] = useState("");
  useEffect(() => {
    const logo = logoRef.current;
    const cursor = cursorRef.current;
    const container = containerRef.current;
    const textContainer = textContainerRef.current;
    const fullText = "ДЕЛО № 1853: ДЕТЕКТИВНЫЙ ВЕЧЕР...";
    
    // 1. Vintage lamp flicker turn-on animation for the logo
    if (logo) {
      const tl = gsap.timeline();
      tl.to(logo, { opacity: 0.1, duration: 0.05 })
        .to(logo, { opacity: 0.6, duration: 0.05 })
        .to(logo, { opacity: 0.15, duration: 0.08 })
        .to(logo, { opacity: 0.8, duration: 0.05 })
        .to(logo, { opacity: 0.3, duration: 0.1 })
        .to(logo, { opacity: 1.0, duration: 0.25, ease: "power2.out" });
    }

    // 2. Typewriter effect
    let charIdx = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const typingInterval = setInterval(() => {
      if (charIdx < fullText.length) {
        setText(fullText.substring(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(typingInterval);
        
        // Wait, then trigger transition
        timeoutId = setTimeout(() => {

          if (container) {
            // Fade out typewriter text
            if (textContainer) {
              gsap.to(textContainer, { opacity: 0, duration: 0.3 });
            }

            // Trigger WebGL board rendering by updating store state
            setIsLoading(false);

            // Fade out HTML preloader background
            gsap.to(container, {
              opacity: 0,
              duration: 1.0,
              ease: "power2.out",
              onComplete: () => {
                gsap.set(container, { display: "none" });
              },
            });
          } else {
            setIsLoading(false);
          }
        }, 600);
      }
    }, 50);

    // Blinking cursor
    if (cursor) {
      gsap.to(cursor, {
        opacity: 0,
        repeat: -1,
        yoyo: true,
        duration: 0.4,
        ease: "steps(1)",
      });
    }

    return () => {
      clearInterval(typingInterval);
      if (timeoutId) clearTimeout(timeoutId);
      if (cursor) gsap.killTweensOf(cursor);
      if (container) gsap.killTweensOf(container);
      if (textContainer) gsap.killTweensOf(textContainer);
    };
  }, [setIsLoading]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-[#080808] z-50 flex flex-col items-center justify-center select-none overflow-hidden cursor-none"
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

      {/* Centered Detective Logo SVG */}
      <Image
        ref={logoRef}
        src="/logo_detective.svg"
        alt="Detective Table Top Logo"
        width={440}
        height={220}
        priority
        className="w-[280px] h-[140px] sm:w-[360px] sm:h-[180px] md:w-[440px] md:h-[220px] object-contain mb-8 z-10 pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] opacity-0"
      />

      {/* Typewriter Text */}
      <div
        ref={textContainerRef}
        className="flex items-center text-[#e8dcc8] font-typewriter text-sm sm:text-base md:text-lg tracking-wider z-10"
      >
        <span>{text}</span>
        <span ref={cursorRef} className="ml-1 w-2.5 h-5 bg-[#e8dcc8] inline-block align-middle" />
      </div>
    </div>
  );
};
