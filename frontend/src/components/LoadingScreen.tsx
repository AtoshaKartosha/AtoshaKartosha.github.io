"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBoardStore } from "../stores/useBoardStore";
import { DetectiveLogoSvg } from "./BoardSvgs";

export const LoadingScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  
  const setIsLoading = useBoardStore((state) => state.setIsLoading);
  const [text, setText] = useState("");

  useEffect(() => {
    const fullText = "ДЕЛО № 1853: ДЕТЕКТИВНЫЙ ВЕЧЕР...";
    
    // Typewriter effect
    let charIdx = 0;
    const typingInterval = setInterval(() => {
      if (charIdx < fullText.length) {
        setText(fullText.substring(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(typingInterval);
        
        // Wait, then trigger cinematic transition
        setTimeout(() => {
          const target = document.querySelector('[data-logo-target="true"]');
          const logo = logoRef.current;
          const container = containerRef.current;
          const textContainer = textContainerRef.current;

          if (target && logo && container) {
            const targetRect = target.getBoundingClientRect();
            const logoRect = logo.getBoundingClientRect();

            // Calculate translation and scale
            const dx = (targetRect.left + targetRect.width / 2) - (logoRect.left + logoRect.width / 2);
            const dy = (targetRect.top + targetRect.height / 2) - (logoRect.top + logoRect.height / 2);
            const scale = targetRect.width / logoRect.width;

            // 1. Fade out typewriter text
            if (textContainer) {
              gsap.to(textContainer, { opacity: 0, duration: 0.3 });
            }

            // 2. Fade out loading screen background (reveals board behind)
            gsap.to(container, {
              backgroundColor: "transparent",
              pointerEvents: "none",
              duration: 1.0,
              ease: "power2.out",
            });

            // 3. Animate detective logo to fly and shrink to target position
            gsap.to(logo, {
              x: dx,
              y: dy,
              scale: scale,
              duration: 1.2,
              ease: "power2.inOut",
              onComplete: () => {
                setIsLoading(false);
                gsap.set(container, { display: "none" });
              },
            });
          } else {
            // Fallback
            setIsLoading(false);
          }
        }, 600);
      }
    }, 50);

    // Blinking cursor
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        repeat: -1,
        yoyo: true,
        duration: 0.4,
        ease: "steps(1)",
      });
    }

    return () => {
      clearInterval(typingInterval);
    };
  }, [setIsLoading]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-[#080808] z-50 flex flex-col items-center justify-center select-none"
    >
      {/* Pop-art Detective Logo */}
      <div
        ref={logoRef}
        className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] mb-8 z-10 pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
      >
        <DetectiveLogoSvg />
      </div>

      {/* Typewriter Text */}
      <div
        ref={textContainerRef}
        className="flex items-center text-[#e8dcc8] font-typewriter text-sm sm:text-base md:text-lg tracking-wider"
      >
        <span>{text}</span>
        <span ref={cursorRef} className="ml-1 w-2.5 h-5 bg-[#e8dcc8] inline-block align-middle" />
      </div>
    </div>
  );
};
