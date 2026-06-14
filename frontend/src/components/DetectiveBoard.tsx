"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useBoardStore } from "../stores/useBoardStore";
import { boardItems, BoardItem } from "../data/boardItems";
import {
  CorkboardTexture,
  DossierSvg,
  Suspect1Svg,
  Suspect2Svg,
  MapSvg,
  RotaryPhoneSvg,
  VintageClockSvg,
  EvidenceBagSvg,
  NewspaperSvg,
} from "./BoardSvgs";
import { ThreadCanvas } from "./ThreadCanvas";
import { BoardPopup } from "./BoardPopup";
import { DustParticles } from "./DustParticles";
import { FluidGlassCursor } from "./FluidGlassCursor";

interface BoardItemProps {
  item: BoardItem;
  isMobile: boolean;
  isDraggingRef: React.RefObject<boolean>;
  setActivePopup: (id: string | null) => void;
  hoveredItemId: string | null;
  setHoveredItemId: (id: string | null) => void;
  children: React.ReactNode;
}

const BoardItemComponent: React.FC<BoardItemProps> = ({
  item,
  isMobile,
  isDraggingRef,
  setActivePopup,
  hoveredItemId,
  setHoveredItemId,
  children,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardRectRef = useRef<DOMRect | null>(null);

  const pos = isMobile ? item.mobile : item.desktop;
  const isHovered = hoveredItemId === item.id;

  const centerX = pos.left + pos.width / 2;
  const centerY = pos.top; // approximate vertical center

  // Light falloff dimming values
  const lampX = 85;
  const lampY = 15;
  const distFromLamp = Math.hypot((centerX - lampX) / 100, (centerY - lampY) / 100);
  const dimmingOpacity = item.id === "dossier" ? 0 : Math.min(distFromLamp * 0.35, 0.22);

  const rotation = pos.rotation + (isHovered ? (pos.rotation >= 0 ? 1.5 : -1.5) : 0);

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

    const maxTiltX = 14; // rotateY
    const maxTiltY = 14; // rotateX

    const tiltX = x * maxTiltX;
    const tiltY = -y * maxTiltY;

    // Direct DOM style updates for 3D rotation and scale
    cardEl.style.transform = `rotateX(${tiltY}deg) rotateY(${tiltX}deg) translateZ(20px)`;

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
      cardEl.style.transition = "transform 0.4s ease-out";
      cardEl.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }
  };


  return (
    <div
      className="absolute group transition-all duration-300 ease-out"
      style={{
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        width: `${pos.width}%`,
        transform: `rotate(${rotation}deg) scale(${isHovered ? 1.04 : 1})`,
        transformStyle: "preserve-3d",
        zIndex: isHovered ? 30 : item.zIndex,
      }}
    >
      <div
        onClick={() => {
          if (isDraggingRef.current) return;
          setActivePopup(item.popupId);
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        className="w-full focus:outline-none block relative touch-manipulation cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
        }}
        role="button"
        tabIndex={0}
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
        {/* Red Pin Pierce-point (Stays flat on the board) */}
        <div
          className={`absolute top-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#1c160e] flex items-center justify-center z-40 pointer-events-none transition-all duration-300 ease-out ${
            isHovered
              ? "bg-[#ff2a2a] shadow-[0_0_12px_#ff2a2a,0_6px_12px_rgba(0,0,0,0.8)] scale-110"
              : "bg-[#c41e1e] shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
          }`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
          <div
            data-pin-id={item.id}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
          />
        </div>


        {/* Visual SVG Content (Tilts and lifts under the pin) */}
        <div
          ref={cardRef}
          style={{
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            zIndex: 1,
          }}
        >
          {isMobile ? (
            <div style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.6))" }}>
              {children}
            </div>
          ) : (
            children
          )}
        </div>

        {/* Light falloff dimming overlay */}
        {!isMobile && item.id !== "dossier" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${isHovered ? 0 : dimmingOpacity.toFixed(3)})`,
              borderRadius: item.id === "clock" ? "50%" : "4px",
              zIndex: 2,
              transition: "background-color 0.3s ease-out",
              mixBlendMode: "multiply",
            }}
          />
        )}
      </div>
    </div>
  );
};
export const DetectiveBoard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePopup = useBoardStore((state) => state.activePopup);
  const setActivePopup = useBoardStore((state) => state.setActivePopup);
  const setPinPosition = useBoardStore((state) => state.setPinPosition);
  const panOffset = useBoardStore((state) => state.panOffset);
  const setPanOffset = useBoardStore((state) => state.setPanOffset);
  const isLoading = useBoardStore((state) => state.isLoading);
  const hoveredItemId = useBoardStore((state) => state.hoveredItemId);
  const setHoveredItemId = useBoardStore((state) => state.setHoveredItemId);

  const [isMobile, setIsMobile] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [zoom, setZoom] = useState(1.0);


  // Drag interaction state
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const dragVelocity = useRef({ x: 0, y: 0 });
  const lastTimestamp = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Determine if viewport is mobile/tablet (< 1024px)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setPanOffset({ x: 0, y: 0 });
        setZoom(1.0);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setPanOffset]);

  // Helper function to measure pin positions relative to the board
  // Helper function to measure pin positions relative to the board
  const measurePins = useCallback(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();

    boardItems.forEach((item) => {
      const pinAnchor = boardEl.querySelector(`[data-pin-id="${item.id}"]`);
      if (pinAnchor) {
        const pinRect = pinAnchor.getBoundingClientRect();
        // Divide by current zoom to get invariant logical coordinates
        const x = (pinRect.left - boardRect.left) / zoom;
        const y = (pinRect.top - boardRect.top) / zoom;
        setPinPosition(item.id, { x, y });
      }
    });
  }, [setPinPosition, zoom]);

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

  // Mobile Touch/Mouse Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isMobile) return;
    isDragging.current = true;
    setIsDraggingState(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    lastPos.current = { x: e.clientX, y: e.clientY };
    dragVelocity.current = { x: 0, y: 0 };
    lastTimestamp.current = performance.now();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Set pointer capture to lock mouse dragging outside target
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !isMobile) return;

    const now = performance.now();
    const dt = now - lastTimestamp.current;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    if (dt > 0) {
      // Calculate velocity in px/ms
      dragVelocity.current = {
        x: dx / dt,
        y: dy / dt,
      };
    }

    lastPos.current = { x: e.clientX, y: e.clientY };
    lastTimestamp.current = now;

    setPanOffset((prev) => {
      const boardEl = boardRef.current;
      if (!boardEl) return prev;

      const nextX = prev.x + dx;
      const nextY = prev.y + dy;

      const boardWidth = boardEl.clientWidth * zoom;
      const boardHeight = boardEl.clientHeight * zoom;

      const maxDragX = 0;
      const maxDragY = 0;
      // Clamping limits so user can't pan beyond canvas edges
      const minDragX = -(boardWidth - window.innerWidth);
      const minDragY = -(boardHeight - window.innerHeight);

      // Apply rubber-banding (resistance) when dragging beyond boundaries
      const applyRubberBand = (val: number, min: number, max: number) => {
        if (val > max) {
          return max + (val - max) * 0.3;
        } else if (val < min) {
          return min + (val - min) * 0.3;
        }
        return val;
      };

      return {
        x: applyRubberBand(nextX, minDragX, maxDragX),
        y: applyRubberBand(nextY, minDragY, maxDragY),
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || !isMobile) return;
    isDragging.current = false;
    setIsDraggingState(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const dist = Math.hypot(
      e.clientX - startPos.current.x,
      e.clientY - startPos.current.y
    );
    // If it was just a tiny click/tap, don't run inertia
    if (dist < 6) return;

    // Inertia and Spring-back physics loop
    const decay = 0.95;
    
    // Spring physics constants for boundary snap-back
    const springTension = 180.0;
    const springDamping = 15.0;
    const dt = 0.016; // approx 16ms frame step

    const runInertia = () => {
      const boardEl = boardRef.current;
      if (!boardEl) return;

      const boardWidth = boardEl.clientWidth * zoom;
      const boardHeight = boardEl.clientHeight * zoom;

      const maxDragX = 0;
      const maxDragY = 0;
      const minDragX = -(boardWidth - window.innerWidth);
      const minDragY = -(boardHeight - window.innerHeight);

      setPanOffset((prev) => {
        let nextX = prev.x;
        let nextY = prev.y;

        const isOutOfBoundsX = prev.x > maxDragX || prev.x < minDragX;
        const isOutOfBoundsY = prev.y > maxDragY || prev.y < minDragY;

        // X Axis Physics
        if (isOutOfBoundsX) {
          const targetX = prev.x > maxDragX ? maxDragX : minDragX;
          const forceX = -springTension * (prev.x - targetX) - springDamping * (dragVelocity.current.x * 1000);
          dragVelocity.current.x += (forceX * dt) / 1000;
          nextX += dragVelocity.current.x * dt * 1000;
          
          if (Math.abs(dragVelocity.current.x) < 0.01 && Math.abs(prev.x - targetX) < 0.5) {
            nextX = targetX;
            dragVelocity.current.x = 0;
          }
        } else {
          dragVelocity.current.x *= decay;
          nextX += dragVelocity.current.x * dt * 1000;
        }

        // Y Axis Physics
        if (isOutOfBoundsY) {
          const targetY = prev.y > maxDragY ? maxDragY : minDragY;
          const forceY = -springTension * (prev.y - targetY) - springDamping * (dragVelocity.current.y * 1000);
          dragVelocity.current.y += (forceY * dt) / 1000;
          nextY += dragVelocity.current.y * dt * 1000;

          if (Math.abs(dragVelocity.current.y) < 0.01 && Math.abs(prev.y - targetY) < 0.5) {
            nextY = targetY;
            dragVelocity.current.y = 0;
          }
        } else {
          dragVelocity.current.y *= decay;
          nextY += dragVelocity.current.y * dt * 1000;
        }

        // Stop loop if everything settled and inside bounds
        const xSettled = !isOutOfBoundsX || (nextX === maxDragX || nextX === minDragX);
        const ySettled = !isOutOfBoundsY || (nextY === maxDragY || nextY === minDragY);
        const velocitySettled = Math.hypot(dragVelocity.current.x, dragVelocity.current.y) < 0.005;

        if (xSettled && ySettled && velocitySettled && !isOutOfBoundsX && !isOutOfBoundsY) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
        }

        return {
          x: nextX,
          y: nextY,
        };
      });

      if (animationRef.current !== null) {
        animationRef.current = requestAnimationFrame(runInertia);
      }
    };

    animationRef.current = requestAnimationFrame(runInertia);
  };

  // Helper to render proper board items SVGs
  // Helper to render proper board items SVGs
  const renderItemSvg = (id: string, isHovered: boolean) => {
    switch (id) {
      case "dossier":
        return (
          <DossierSvg
            className={`w-full h-full transition-all duration-300 ease-out ${
              isHovered
                ? "drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
                : "drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
            }`}
          />
        );
      case "suspect-1":
        return (
          <Suspect1Svg
            className={`w-full h-full transition-all duration-300 ease-out ${
              isHovered
                ? "drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
                : "drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            }`}
          />
        );
      case "suspect-2":
        return (
          <Suspect2Svg
            className={`w-full h-full transition-all duration-300 ease-out ${
              isHovered
                ? "drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
                : "drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            }`}
          />
        );
      case "map":
        return (
          <MapSvg
            className={`w-full h-full transition-all duration-300 ease-out ${
              isHovered
                ? "drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
                : "drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            }`}
          />
        );
      case "phone":
        return (
          <RotaryPhoneSvg
            className={`w-full h-full transition-all duration-300 ease-out ${
              isHovered
                ? "drop-shadow-[0_22px_40px_rgba(0,0,0,0.8)]"
                : "drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
            }`}
          />
        );
      case "clock":
        return (
          <VintageClockSvg
            className={`w-full h-full transition-all duration-300 ease-out ${
              isHovered
                ? "drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
                : "drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            }`}
          />
        );
      case "evidence":
        return (
          <EvidenceBagSvg
            className={`w-full h-full transition-all duration-300 ease-out ${
              isHovered
                ? "drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
                : "drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            }`}
          />
        );
      case "newspaper":
        return (
          <NewspaperSvg
            className={`w-full h-full transition-all duration-300 ease-out ${
              isHovered
                ? "drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
                : "drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            }`}
          />
        );
      case "note":
        return (
          <div
            className={`w-full h-full bg-[#decfa8] border-2 border-[#1c160e] p-3 font-typewriter text-[9px] sm:text-[10px] md:text-xs text-[#1c160e] flex flex-col justify-between transition-all duration-300 ease-out ${
              isHovered
                ? "shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
                : "shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
            }`}
          >
            <div className="font-bold border-b border-[#1c160e]/30 pb-0.5 mb-1.5 text-center uppercase tracking-wider text-[10px] sm:text-[11px] md:text-[13px]">
              РАСПИСАНИЕ
            </div>
            <div className="space-y-0.5 select-none leading-tight">
              <div>16:00 — Сбор гостей</div>
              <div>16:30 — Инструктаж</div>
              <div>17:00 — Первая сессия</div>
              <div>19:00 — Кофе-брейк</div>
              <div>19:30 — Вторая сессия</div>
              <div>21:30 — Итоги</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none flex items-center justify-center bg-[#110c08]"
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

      {/* Mobile drag helper hint overlay */}
      {isMobile && !activePopup && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 border border-noir-border px-4 py-2 rounded-full font-typewriter text-[10px] text-[#e8dcc8] z-30 pointer-events-none tracking-wide uppercase animate-pulse">
          ← Перетаскивайте доску для осмотра →
        </div>
      )}

      {/* 2. THE INVESTIGATION BOARD */}
      <div
        ref={boardRef}
        data-board="true"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative ${
          isMobile 
            ? "w-[170vw] h-[210vh]" 
            : "w-[94%] h-[92%] max-w-[1800px] max-h-[1000px] rounded-sm absolute top-1/2 left-1/2"
        } touch-none shadow-[0_30px_60px_rgba(0,0,0,0.9),_inset_0_0_80px_rgba(0,0,0,0.8)]`}
        style={{
          backgroundImage: "url(/background_detective_bg.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: isMobile
            ? `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoom})`
            : "translate3d(-50%, -50%, 0)",
          transformOrigin: isMobile ? "top left" : "center center",
          cursor: isMobile ? (isDraggingState ? "grabbing" : "grab") : "default",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Repeating cork board texture in background */}
        <CorkboardTexture />

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
          >
            {renderItemSvg(item.id, hoveredItemId === item.id)}
          </BoardItemComponent>
        ))}

        {/* Foreground elements (table, hat, jacket) overlay for depth of field */}
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            backgroundImage: "url(/background_detective_fg.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* 2.5 DUST PARTICLES OVERLAY */}
      <DustParticles />

      {/* 2.7 WEBGL FLUID GLASS LENS OVERLAY */}
      <FluidGlassCursor />
      {/* 3. POPUP MODAL DIALOG */}
      <BoardPopup />

      {/* Floating Zoom Controls (Mobile/Tablet only) */}
      {isMobile && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-35">
          <button
            onClick={() => {
              setZoom(z => Math.min(z + 0.1, 1.3));
              setTimeout(measurePins, 50);
            }}
            className="w-11 h-11 rounded-full bg-black/75 border border-[#8b6d3b]/60 text-[#e8dcc8] flex items-center justify-center font-bold text-xl focus:outline-none active:bg-[#8b6d3b]/40 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer select-none"
            aria-label="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => {
              setZoom(z => Math.max(z - 0.1, 0.45));
              setTimeout(measurePins, 50);
            }}
            className="w-11 h-11 rounded-full bg-black/75 border border-[#8b6d3b]/60 text-[#e8dcc8] flex items-center justify-center font-bold text-xl focus:outline-none active:bg-[#8b6d3b]/40 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer select-none"
            aria-label="Zoom Out"
          >
            −
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setPanOffset((prev) => {
                const boardEl = boardRef.current;
                if (!boardEl) return prev;
                const maxDragX = 0;
                const maxDragY = 0;
                const minDragX = -(boardEl.clientWidth - window.innerWidth);
                const minDragY = -(boardEl.clientHeight - window.innerHeight);
                return {
                  x: Math.max(minDragX, Math.min(maxDragX, prev.x)),
                  y: Math.max(minDragY, Math.min(maxDragY, prev.y)),
                };
              });
              setTimeout(measurePins, 50);
            }}
            className="w-11 h-11 rounded-full bg-black/75 border border-[#8b6d3b]/60 text-[#e8dcc8] flex items-center justify-center text-[10px] font-bold focus:outline-none active:bg-[#8b6d3b]/40 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer select-none font-typewriter"
            aria-label="Reset Zoom"
          >
            1:1
          </button>
        </div>
      )}
    </div>
  );
};
