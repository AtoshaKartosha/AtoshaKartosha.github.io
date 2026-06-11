"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useBoardStore } from "../stores/useBoardStore";
import { boardItems } from "../data/boardItems";
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

export const DetectiveBoard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePopup = useBoardStore((state) => state.activePopup);
  const setActivePopup = useBoardStore((state) => state.setActivePopup);
  const setPinPosition = useBoardStore((state) => state.setPinPosition);
  const panOffset = useBoardStore((state) => state.panOffset);
  const setPanOffset = useBoardStore((state) => state.setPanOffset);
  const isLoading = useBoardStore((state) => state.isLoading);

  const [isMobile, setIsMobile] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);


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
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setPanOffset]);

  // Helper function to measure pin positions relative to the board
  const measurePins = useCallback(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();

    boardItems.forEach((item) => {
      const pinAnchor = boardEl.querySelector(`[data-pin-id="${item.id}"]`);
      if (pinAnchor) {
        const pinRect = pinAnchor.getBoundingClientRect();
        // Since both boardRect and pinRect shift by panOffset, their difference is invariant
        const x = pinRect.left - boardRect.left;
        const y = pinRect.top - boardRect.top;
        setPinPosition(item.id, { x, y });
      }
    });
  }, [setPinPosition]);

  // Run pin measurement on mount and resize
  useEffect(() => {
    // Run after layout paint is completed
    const timer = setTimeout(() => {
      measurePins();
    }, 200);

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

      const maxDragX = 0;
      const maxDragY = 0;
      // Clamping limits so user can't pan beyond canvas edges
      const minDragX = -(boardEl.clientWidth - window.innerWidth);
      const minDragY = -(boardEl.clientHeight - window.innerHeight);

      return {
        x: Math.max(minDragX, Math.min(maxDragX, nextX)),
        y: Math.max(minDragY, Math.min(maxDragY, nextY)),
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

    // Inertia physics loop
    const decay = 0.95;
    const runInertia = () => {
      const vx = dragVelocity.current.x;
      const vy = dragVelocity.current.y;

      if (Math.hypot(vx, vy) < 0.05) return;

      dragVelocity.current.x *= decay;
      dragVelocity.current.y *= decay;

      setPanOffset((prev) => {
        const boardEl = boardRef.current;
        if (!boardEl) return prev;

        const nextX = prev.x + vx * 16; // approx 16ms frame step
        const nextY = prev.y + vy * 16;

        const maxDragX = 0;
        const maxDragY = 0;
        const minDragX = -(boardEl.clientWidth - window.innerWidth);
        const minDragY = -(boardEl.clientHeight - window.innerHeight);

        return {
          x: Math.max(minDragX, Math.min(maxDragX, nextX)),
          y: Math.max(minDragY, Math.min(maxDragY, nextY)),
        };
      });

      animationRef.current = requestAnimationFrame(runInertia);
    };

    animationRef.current = requestAnimationFrame(runInertia);
  };

  // Helper to render proper board items SVGs
  const renderItemSvg = (id: string) => {
    switch (id) {
      case "dossier":
        return <DossierSvg />;
      case "suspect-1":
        return <Suspect1Svg />;
      case "suspect-2":
        return <Suspect2Svg />;
      case "map":
        return <MapSvg />;
      case "phone":
        return <RotaryPhoneSvg />;
      case "clock":
        return <VintageClockSvg />;
      case "evidence":
        return <EvidenceBagSvg />;
      case "newspaper":
        return <NewspaperSvg />;
      case "note":
        return (
          <div className="w-full h-full bg-[#decfa8] border-2 border-[#1c160e] p-3 font-typewriter text-[9px] sm:text-[10px] md:text-xs text-[#1c160e] shadow-[0_6px_12px_rgba(0,0,0,0.5)] flex flex-col justify-between">
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
        `
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative ${
          isMobile 
            ? "w-[170vw] h-[210vh] border-[16px] border-[#38281b]" 
            : "w-[94%] h-[92%] max-w-[1800px] max-h-[1000px] rounded-sm absolute top-1/2 left-1/2 border-[12px] border-[#38281b]"
        } touch-none shadow-[0_30px_60px_rgba(0,0,0,0.9),_inset_0_0_80px_rgba(0,0,0,0.8)]`}
        style={{
          backgroundImage: "radial-gradient(circle at center, #201811 0%, #0a0806 100%)",
          transform: isMobile
            ? `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`
            : "translate3d(-50%, -50%, 0)",
          cursor: isMobile ? (isDraggingState ? "grabbing" : "grab") : "default",
        }}
      >
        {/* Repeating cork board texture in background */}
        <CorkboardTexture />

        {/* WebGL red thread canvas overlay */}
        <ThreadCanvas />

        {/* Board Items */}
        {boardItems.map((item) => {
          const pos = isMobile ? item.mobile : item.desktop;

          return (
            <div
              key={item.id}
              className="absolute z-10 group"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                width: `${pos.width}%`,
                transform: `rotate(${pos.rotation}deg)`,
              }}
            >
              {/* Clue button wrapping asset */}
              <button
                onClick={() => {
                  // Ignore click if it was a drag gesture
                  if (isDragging.current) return;
                  setActivePopup(item.popupId);
                }}
                className="w-full focus:outline-none focus:scale-105 transition-all duration-200 ease-out hover:scale-105 hover:z-30 block relative"
                aria-haspopup="dialog"
                aria-label={item.name}
              >
                {/* Red Pin Pierce-point */}
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#c41e1e] border-2 border-[#1c160e] shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center z-40 pointer-events-none">
                  {/* Pinhead metal shine */}
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
                  
                  {/* Pin anchor node in layout for thread coordinates */}
                  <div
                    data-pin-id={item.id}
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
                  />
                </div>

                {/* Visual SVG Content */}
                <div className="transition-transform duration-200 group-hover:scale-[1.02]">
                  {renderItemSvg(item.id)}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* 2.5 DUST PARTICLES OVERLAY */}
      <DustParticles />

      {/* 3. POPUP MODAL DIALOG */}
      <BoardPopup />

      {/* Custom keyframes for grain and overlay animations */}
      <style jsx global>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -4%); }
          20% { transform: translate(-6%, 2%); }
          30% { transform: translate(3%, -8%); }
          40% { transform: translate(-2%, 8%); }
          50% { transform: translate(-6%, 4%); }
          60% { transform: translate(6%, 0); }
          70% { transform: translate(0, 5%); }
          80% { transform: translate(1%, 9%); }
          90% { transform: translate(-4%, 3%); }
        }
      `}</style>
    </div>
  );
};
