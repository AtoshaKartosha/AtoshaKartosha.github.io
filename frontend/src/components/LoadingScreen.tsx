"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBoardStore } from "../stores/useBoardStore";
import Image from "next/image";

export const LoadingScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
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
        
        // Wait, then trigger transition
        setTimeout(() => {
          const container = containerRef.current;
          const textContainer = textContainerRef.current;

          if (container) {
            // 1. Fade out typewriter text
            if (textContainer) {
              gsap.to(textContainer, { opacity: 0, duration: 0.3 });
            }

            // 2. Trigger WebGL board rendering by updating store state
            setIsLoading(false);

            // 3. Fade out HTML preloader black background
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
      {/* Centered Detective Logo SVG */}
      <Image
        src="/logo_detective.svg"
        alt="Detective Table Top Logo"
        width={440}
        height={220}
        priority
        className="w-[280px] h-[140px] sm:w-[360px] sm:h-[180px] md:w-[440px] md:h-[220px] object-contain mb-8 z-10 pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
      />

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
