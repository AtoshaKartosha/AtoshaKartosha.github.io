"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBoardStore } from "../stores/useBoardStore";

export const LoadingScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
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
        
        // Wait, then slide out loading screen
        setTimeout(() => {
          if (containerRef.current) {
            gsap.to(containerRef.current, {
              yPercent: -100, // Slide up out of view
              duration: 0.7,
              ease: "power2.inOut",
              onComplete: () => {
                setIsLoading(false);
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
      <div className="flex items-center text-[#e8dcc8] font-typewriter text-sm sm:text-base md:text-lg tracking-wider">
        <span>{text}</span>
        <span ref={cursorRef} className="ml-1 w-2.5 h-5 bg-[#e8dcc8] inline-block align-middle" />
      </div>
    </div>
  );
};
