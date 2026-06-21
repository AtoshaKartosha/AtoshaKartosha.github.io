"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useBoardStore } from "../stores/useBoardStore";
import { boardItems, BoardItem, getItemShadow } from "../data/boardItems";
import {
  CorkboardTexture,
} from "./BoardSvgs";
import { renderItemSvg, Pin } from "./BoardItemSvg";
import { ThreadCanvas } from "./ThreadCanvas";
import { BoardPopup } from "./BoardPopup";
import { DustParticles } from "./DustParticles";
import { FluidGlassCursor } from "./FluidGlassCursor";
import { NoirPinboard } from "./NoirPinboard";
import { WindowScene } from "./WindowScene";

// ponytail: inline hook for wind sway animation, avoids introducing external animation library
function useWindSway(
  ref: React.RefObject<HTMLDivElement | null>,
  itemWidth: number,
  seed: number,
  enabled: boolean
): void {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) {
      if (el) {
        el.style.transform = "";
      }
      return;
    }

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const amp = Math.min(1.2 * (10 / itemWidth), 2.5);
    const f1 = 0.0008;
    const f2 = 0.0013;
    const f3 = 0.0021;
    const p1 = seed * 1.3;
    const p2 = seed * 2.7;
    const p3 = seed * 4.1;

    let rAFId: number;

    const tick = () => {
      const t = performance.now();
      const rot = amp * (Math.sin(t * f1 + p1) * 0.6 + Math.sin(t * f2 + p2) * 0.3 + Math.sin(t * f3 + p3) * 0.1);
      const ty = 0.3 * amp * Math.sin(t * f1 + p1);

      if (el) {
        el.style.transform = `rotate(${rot}deg) translateY(${ty}px)`;
      }
      rAFId = requestAnimationFrame(tick);
    };

    rAFId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rAFId);
      if (el) {
        el.style.transform = "";
      }
    };
  }, [ref, itemWidth, seed, enabled]);
}

interface BoardItemProps {
  item: BoardItem;
  isMobile: boolean;
  isDraggingRef: React.RefObject<boolean>;
  setActivePopup: (id: string | null) => void;
  hoveredItemId: string | null;
  setHoveredItemId: (id: string | null) => void;
  children: React.ReactNode;
  isLoading: boolean;
}

const BoardItemComponent: React.FC<BoardItemProps> = ({
  item,
  isMobile,
  isDraggingRef,
  setActivePopup,
  hoveredItemId,
  setHoveredItemId,
  children,
  isLoading,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<HTMLDivElement>(null);
  const cardRectRef = useRef<DOMRect | null>(null);

  const pos = (() => {
    const p = { ...item.desktop };
    if (isMobile) {
      const scaleFactor = 1.15;
      const centerX = p.left + p.width / 2;
      p.width = p.width * scaleFactor;
      p.left = centerX - p.width / 2;
    }
    return p;
  })();
  const isHovered = hoveredItemId === item.id;
  const [isZIndexRaised, setIsZIndexRaised] = useState(false);

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => {
        setIsZIndexRaised(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsZIndexRaised(false);
    }
  }, [isHovered]);

  const swayEnabled = item.id !== "phone" && item.id !== "clock" && !isHovered;
  const swaySeed = item.id.charCodeAt(0) + item.id.charCodeAt(item.id.length - 1);
  useWindSway(swayRef, item.id === "note" ? pos.width * 0.4 : pos.width, swaySeed, swayEnabled);
  const centerX = pos.left + pos.width / 2;
  const centerY = pos.top; // approximate vertical center

  // Light falloff — brightness decreases with distance from lamp
  const lampX = 85;
  const lampY = 15;
  const distFromLamp = Math.hypot((centerX - lampX) / 100, (centerY - lampY) / 100);
  // brightness: 1.0 at lamp, down to ~0.78 at farthest item. Dossier always full brightness.
  const dimBrightness = item.id === "dossier" ? 1 : Math.max(1 - distFromLamp * 0.4, 0.78);

  const rotation = pos.rotation + (isHovered ? (pos.rotation >= 0 ? 1.5 : -1.5) : 0);
  const hoverScale = item.id === "phone" ? 1.1 : 1.04;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const cardEl = cardRef.current;
    if (!cardEl) return;

    let rect = cardRectRef.current;
    if (!rect) {
      rect = e.currentTarget.getBoundingClientRect();
      cardRectRef.current = rect;
    }
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const maxTiltX = 10; // rotateY
    const maxTiltY = 10; // rotateX

    const tiltX = x * maxTiltX;
    const tiltY = -y * maxTiltY;

    // Direct DOM style updates for 3D rotation and scale
    cardEl.style.transform = `rotateX(${tiltY}deg) rotateY(${tiltX}deg) translateZ(80px)`;

    // No separate shadow div to update
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    setHoveredItemId(item.id);
    cardRectRef.current = e.currentTarget.getBoundingClientRect();

    const cardEl = cardRef.current;
    if (cardEl) {
      cardEl.style.transition = "transform 0.08s ease-out";
    }
  };

  const handlePointerLeave = () => {
    setHoveredItemId(null);

    const cardEl = cardRef.current;
    if (cardEl) {
      cardEl.style.transition = "none";
      cardEl.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }
  };


  return (
    <div
      className={`absolute group ${isHovered ? "transition-all duration-300 ease-out" : "transition-none"}`}
      style={{
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        width: `${pos.width}%`,
        transform: `rotate(${rotation}deg) scale(${isHovered ? hoverScale : 1})`,
        transformStyle: "preserve-3d",
        zIndex: isZIndexRaised ? 30 : item.zIndex,
      }}
    >
      <div
        onClick={(e) => {
          if (isDraggingRef.current) return;
          setActivePopup(item.popupId);
          if (e.detail > 0) e.currentTarget.blur(); // mouse only; keyboard keeps focus
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c41e1e] rounded-sm block relative touch-manipulation cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
        }}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        onFocus={() => setHoveredItemId(item.id)}
        onBlur={() => setHoveredItemId(null)}
        aria-haspopup="dialog"
        aria-label={item.name}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isDraggingRef.current) {
              setActivePopup(item.popupId);
            }
          }
        }}
      >
        <Pin itemId={item.id} isHovered={isHovered} />


        {/* Visual SVG Content (Tilts and lifts under the pin) */}
        <div
          ref={swayRef}
          style={{
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            zIndex: 1,
          }}
        >
          <div
            ref={cardRef}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className={`w-full h-full ${isHovered ? "transition-all duration-300 ease-out" : "transition-none"}`}
              style={{
                filter: `${getItemShadow(item.id, isHovered)} brightness(${isHovered ? 1 : dimBrightness})`,
              }}
            >
              {children}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export const DetectiveBoard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const setActivePopup = useBoardStore((state) => state.setActivePopup);
  const setPinPositions = useBoardStore((state) => state.setPinPositions);
  const isLoading = useBoardStore((state) => state.isLoading);
  const hoveredItemId = useBoardStore((state) => state.hoveredItemId);
  const setHoveredItemId = useBoardStore((state) => state.setHoveredItemId);
  const isMobile = useBoardStore((state) => state.isMobile);
  const setIsMobile = useBoardStore((state) => state.setIsMobile);
  const setIsPortrait = useBoardStore((state) => state.setIsPortrait);


  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

  // Update boardSize on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (boardRef.current) {
        setBoardSize({
          width: boardRef.current.clientWidth,
          height: boardRef.current.clientHeight,
        });
      }
    };
    handleResize();
    const timer = setTimeout(handleResize, 350);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isLoading]);

  // Helper to calculate pixel coordinates on backgroundSize: cover
  const getCoverCoords = (x: number, y: number, w: number, h: number) => {
    if (boardSize.width === 0 || boardSize.height === 0) {
      return {
        left: `${(x / 1385.92) * 100}%`,
        top: `${(y / 773.53) * 100}%`,
        width: `${(w / 1385.92) * 100}%`,
        height: `${(h / 773.53) * 100}%`,
      };
    }
    const W_i = 1385.92;
    const H_i = 773.53;
    const R_i = W_i / H_i;
    const R_c = boardSize.width / boardSize.height;

    let W_scaled = 0;
    let H_scaled = 0;
    let offset_x = 0;
    let offset_y = 0;

    if (R_c > R_i) {
      W_scaled = boardSize.width;
      H_scaled = boardSize.width / R_i;
      offset_x = 0;
      offset_y = (boardSize.height - H_scaled) / 2;
    } else {
      H_scaled = boardSize.height;
      W_scaled = boardSize.height * R_i;
      offset_x = (boardSize.width - W_scaled) / 2;
      offset_y = 0;
    }

    const left = offset_x + (x / W_i) * W_scaled;
    const top = offset_y + (y / H_i) * H_scaled;
    const width = (w / W_i) * W_scaled;
    const height = (h / H_i) * H_scaled;

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };


  // Drag interaction state
  const isDragging = useRef(false);

  // Determine if viewport is mobile/tablet (< 1024px)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsPortrait(mobile && window.innerHeight > window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobile, setIsPortrait]);

  // Helper function to measure pin positions relative to the board
  // Helper function to measure pin positions relative to the board
  const measurePins = useCallback(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();
    const newPositions: Record<string, { x: number; y: number }> = {};

    boardItems.forEach((item) => {
      const pinAnchor = boardEl.querySelector(`[data-pin-id="${item.id}"]`);
      if (pinAnchor) {
        const pinRect = pinAnchor.getBoundingClientRect();
        const x = pinRect.left - boardRect.left;
        const y = pinRect.top - boardRect.top;
        newPositions[item.id] = { x, y };
      }
    });

    setPinPositions(newPositions);
  }, [setPinPositions]);

  // Run pin measurement on mount and resize
  useEffect(() => {
    // Run after layout paint is completed
    const timer = setTimeout(() => {
      measurePins();
    }, 300);

    window.addEventListener("resize", measurePins);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measurePins);
    };
  }, [isMobile, measurePins]);

  // Measure pins when loading completes
  useEffect(() => {
    if (!isLoading) {
      setTimeout(measurePins, 100);
    }
  }, [isLoading, measurePins]);


  return (
    <div
      ref={containerRef}
      className="relative w-full h-dvh overflow-hidden select-none flex items-center justify-center bg-[#110c08]"
      style={{
        backgroundImage: `
          radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.75) 100%),
          repeating-linear-gradient(90deg, #1b120c, #1b120c 120px, #100a06 120px, #100a06 122px)
        `,
        perspective: "1600px",
      }}
    >
      {/* 1. ATMOSPHERIC OVERLAYS */}
      {/* Warm desk lamp light cone (top-right) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(200,169,110,0.15)_0%,transparent_65%)] pointer-events-none z-20 mix-blend-soft-light" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-20" />
      
      {/* Scanline pattern */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%)",
          backgroundSize: "100% 4px",
        }}
      />
      
      {/* Flickering film grain */}
      <div 
        className="absolute w-[120%] h-[120%] top-[-10%] left-[-10%] pointer-events-none z-20 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: "grain 8s steps(10) infinite",
        }}
      />


      {/* 2. THE INVESTIGATION BOARD */}
      <div
        ref={boardRef}
        data-board="true"
        className={`relative ${
          isMobile
            ? "h-auto rounded-sm"
            : "w-[94%] h-auto max-w-[1800px] rounded-sm"
        } touch-none shadow-[0_30px_60px_rgba(0,0,0,0.9),_inset_0_0_80px_rgba(0,0,0,0.8)]`}
        style={{
          backgroundImage: "url(/background_detective_bg_v2.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: isMobile ? "min(100%, calc(100dvh * 1.7913))" : undefined,
          aspectRatio: "1385.92 / 773.53",
          maxHeight: isMobile ? undefined : "1005px",
          transform: "translate(var(--rumble-x, 0px), var(--rumble-y, 0px))",
          transformOrigin: "center center",
          cursor: "default",
          transformStyle: "preserve-3d",
          ...({
            "--board-width": isMobile ? "min(100vw, calc(100dvh * 1.7913))" : "min(94vw, 1800px)",
          } as React.CSSProperties),
        }}
      >
        {/* Repeating cork board texture in background */}
        <CorkboardTexture />

        {/* 2nd layer from bottom: Pinboard in noir and comic style */}
        {/* Window atmosphere scene */}
        <WindowScene />

        <NoirPinboard />
        {/* WebGL red thread canvas overlay */}
        <ThreadCanvas />

        {/* Board Items */}
        {boardItems.map((item) => (
          <BoardItemComponent
            key={item.id}
            item={item}
            isMobile={isMobile}
            isDraggingRef={isDragging}
            setActivePopup={setActivePopup}
            hoveredItemId={hoveredItemId}
            setHoveredItemId={setHoveredItemId}
            isLoading={isLoading}
          >
            {renderItemSvg(item.id, { isHovered: hoveredItemId === item.id, isMobile })}
          </BoardItemComponent>
        ))}

        {/* Ambient volumetric light shaft from window */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-[18] mix-blend-overlay"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ambientLightGrad" x1="0.88" y1="0.44" x2="0" y2="1">
              <stop offset="0%" stopColor="#82a0d2" stopOpacity={0.28} />
              <stop offset="60%" stopColor="#506ea0" stopOpacity={0.14} />
              <stop offset="100%" stopColor="#000000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon
            points="0,85 88.15,12.63 88.15,75.31 0,120"
            fill="url(#ambientLightGrad)"
            style={{
              animation: "lightShaftPulse 8s ease-in-out infinite",
            }}
          />
        </svg>
        {/* Volumetric lightning strike beam from window */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-[19] mix-blend-screen"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            opacity: "var(--lightning-intensity, 0)",
          }}
        >
          <defs>
            <linearGradient id="lightningLightGrad" x1="0.88" y1="0.44" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8e1ff" stopOpacity={0.65} />
              <stop offset="60%" stopColor="#8cb4ff" stopOpacity={0.30} />
              <stop offset="100%" stopColor="#000000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon
            points="0,85 88.15,12.63 88.15,75.31 0,120"
            fill="url(#lightningLightGrad)"
          />
        </svg>

        {/* Global cabinet lightning flash overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-[21] bg-[#b4c8e6] mix-blend-screen"
          style={{
            opacity: "calc(var(--lightning-intensity, 0) * 0.15)",
          }}
        />

        {/* Foreground elements (table, hat, jacket) overlay for depth of field */}
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            backgroundImage: "url(/background_detective_fg_v2.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Table telephone overlay */}
        <div
          onPointerEnter={() => setHoveredItemId("table-phone")}
          onPointerLeave={() => setHoveredItemId(null)}
          onFocus={() => setHoveredItemId("table-phone")}
          onBlur={() => setHoveredItemId(null)}
          onClick={() => {
            window.open("https://t.me/detective_tabletop_bot", "_blank", "noopener,noreferrer");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              window.open("https://t.me/detective_tabletop_bot", "_blank", "noopener,noreferrer");
            }
          }}
          className="absolute cursor-pointer transition-all duration-300 ease-out focus:outline-none"
          style={{
            ...getCoverCoords(690, 640, 185, 105),
            zIndex: 22,
            backgroundImage: "url(/images/board/table-phone_v2.svg)",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: `scale(${hoveredItemId === "table-phone" ? 1.08 : 1.0})`,
            filter: hoveredItemId === "table-phone"
              ? "drop-shadow(0 0 20px rgba(0, 191, 255, 0.9)) drop-shadow(0 10px 15px rgba(0,0,0,0.5))"
              : "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
          }}
          role="button"
          tabIndex={0}
          aria-label="Телефон для регистрации"
        />
      </div>

      {/* 2.5 DUST PARTICLES OVERLAY */}
      <DustParticles />

      {/* 2.7 WEBGL FLUID GLASS LENS OVERLAY */}
      <FluidGlassCursor />
      {/* 3. POPUP MODAL DIALOG */}
      <BoardPopup />

    </div>
  );
};
