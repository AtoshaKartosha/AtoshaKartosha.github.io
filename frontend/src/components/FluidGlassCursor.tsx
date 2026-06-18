"use client";

import React, { useRef, useState, useEffect } from "react";
import { useBoardStore } from "../stores/useBoardStore";
import { boardItems, threadConnections, BoardItem } from "../data/boardItems";
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
import { NoirPinboard } from "./NoirPinboard";

const LENS_RADIUS = 120; // Radius in pixels
const ZOOM_FACTOR = 1.35; // Magnification factor

interface ClonedBoardItemProps {
  item: BoardItem;
  hoveredItemId: string | null;
  isMobile: boolean;
  renderItemSvg: (id: string) => React.ReactNode;
}

const ClonedBoardItem: React.FC<ClonedBoardItemProps> = ({
  item,
  hoveredItemId,
  isMobile,
  renderItemSvg,
}) => {
  const pos = isMobile ? item.mobile : item.desktop;
  const isHovered = hoveredItemId === item.id;
  const [isZIndexRaised, setIsZIndexRaised] = useState(false);

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => {
        setIsZIndexRaised(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsZIndexRaised(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  const centerX = pos.left + pos.width / 2;
  const centerY = pos.top;
  const distFromLamp = Math.hypot((centerX - 85) / 100, (centerY - 15) / 100);
  const dimBrightness = item.id === "dossier" ? 1 : Math.max(1 - distFromLamp * 0.4, 0.78);

  return (
    <div
      className="absolute group transition-all duration-300 ease-out"
      style={{
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        width: `${pos.width}%`,
        transform: `rotate(${pos.rotation + (isHovered ? (pos.rotation >= 0 ? 1.5 : -1.5) : 0)}deg) scale(${isHovered ? 1.04 : 1})`,
        zIndex: isZIndexRaised ? 30 : item.zIndex,
      }}
    >
      {/* Red Pin Pierce-point */}
      <div
        className={`absolute top-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[#1c160e] flex items-center justify-center z-40 pointer-events-none transition-all duration-300 ease-out ${
          isHovered
            ? "bg-[#ff2a2a] shadow-[0_0_12px_#ff2a2a,0_6px_12px_rgba(0,0,0,0.8)] scale-110"
            : "bg-[#c41e1e] shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
        }`}
      >
        {/* Pinhead metal shine */}
        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
        
        {/* Pin anchor node in layout for thread coordinates */}
        <div
          data-pin-id={item.id}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
        />
      </div>

      {/* Visual SVG Content */}
      <div className="transition-transform duration-300 ease-out">
        <div
          className="w-full h-full transition-all duration-300 ease-out"
          style={{
            filter: `${isHovered
              ? (item.id === "phone"
                  ? "drop-shadow(0 22px 40px rgba(0,0,0,0.75))"
                  : item.id === "dossier"
                    ? "drop-shadow(0 20px 35px rgba(0,0,0,0.65))"
                    : "drop-shadow(0 18px 30px rgba(0,0,0,0.55))")
              : (item.id === "phone"
                  ? "drop-shadow(0 12px 24px rgba(0,0,0,0.6))"
                  : item.id === "dossier"
                    ? "drop-shadow(0 10px 20px rgba(0,0,0,0.5))"
                    : "drop-shadow(0 8px 16px rgba(0,0,0,0.45))")} brightness(${isHovered ? 1 : dimBrightness})`,
          }}
        >
          {renderItemSvg(item.id)}
        </div>
      </div>
    </div>
  );
};
export const FluidGlassCursor: React.FC = () => {
  const magnifierRef = useRef<HTMLDivElement>(null);
  const clonedBoardRef = useRef<HTMLDivElement>(null);
  const velocity = useRef({ x: 0, y: 0 });
  const swingAngle = useRef(0);
  const swingVelocity = useRef(0);
  
  const isLoading = useBoardStore((state) => state.isLoading);
  const hoveredItemId = useBoardStore((state) => state.hoveredItemId);
  const pinPositions = useBoardStore((state) => state.pinPositions);
  const [isMobile, setIsMobile] = useState(false);
  const [displacementMapUrl, setDisplacementMapUrl] = useState<string | null>(null);
  const [aberrationMapUrl, setAberrationMapUrl] = useState<string | null>(null);

  // Mouse position in viewport coordinates
  const mouseRef = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });

  // Lerped position for the smooth follow effect
  const lerpedPos = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });

  // Generate the lens displacement map once on mount
  // Generate the lens displacement map once on mount
  useEffect(() => {
    const size = LENS_RADIUS * 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;
    
    const imgDataAb = ctx.createImageData(size, size);
    const dataAb = imgDataAb.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        
        // Coordinates relative to center of the lens
        const dx = x - LENS_RADIUS;
        const dy = y - LENS_RADIUS;
        const r = Math.sqrt(dx * dx + dy * dy);

        if (r >= LENS_RADIUS) {
          // Neutral gray (no displacement outside the lens boundary)
          data[idx] = 128;     // R
          data[idx + 1] = 128; // G
          data[idx + 2] = 128; // B
          data[idx + 3] = 255; // A
          
          dataAb[idx] = 128;
          dataAb[idx + 1] = 128;
          dataAb[idx + 2] = 128;
          dataAb[idx + 3] = 255;
        } else {
          // Normalized distance from center (0 to 1)
          const normR = r / LENS_RADIUS;
          
          // Base bulge distortion profile: exponential ramp towards edges
          const factor = Math.pow(normR, 2.5) * 0.38;
          const dispX = -(dx / (r || 1)) * factor;
          const dispY = -(dy / (r || 1)) * factor;

          data[idx] = Math.max(0, Math.min(255, Math.round(128 + dispX * 127)));
          data[idx + 1] = Math.max(0, Math.min(255, Math.round(128 + dispY * 127)));
          data[idx + 2] = 128; // B
          data[idx + 3] = 255; // A
          
          // Aberration distortion profile: very flat in center, sharp at edges
          const abFactor = Math.pow(normR, 6.0) * 0.25;
          const abDispX = -(dx / (r || 1)) * abFactor;
          const abDispY = -(dy / (r || 1)) * abFactor;
          
          dataAb[idx] = Math.max(0, Math.min(255, Math.round(128 + abDispX * 127)));
          dataAb[idx + 1] = Math.max(0, Math.min(255, Math.round(128 + abDispY * 127)));
          dataAb[idx + 2] = 128;
          dataAb[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const url1 = canvas.toDataURL();
    
    ctx.putImageData(imgDataAb, 0, 0);
    const url2 = canvas.toDataURL();

    requestAnimationFrame(() => {
      setDisplacementMapUrl(url1);
      setAberrationMapUrl(url2);
    });
  }, []);

  // Handle mobile check and initial sizing
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const boardRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  // Measure board rectangle once on mount, resize, or load complete to avoid layout thrashing
  useEffect(() => {
    if (isMobile) return;

    const updateBoardRect = () => {
      const boardEl = document.querySelector('[data-board="true"]');
      if (boardEl && clonedBoardRef.current) {
        const rect = boardEl.getBoundingClientRect();
        boardRectRef.current = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
        clonedBoardRef.current.style.width = `${rect.width}px`;
        clonedBoardRef.current.style.height = `${rect.height}px`;
      }
    };

    // Run measurement with slight delay to ensure layout is settled and image sizes are computed
    const timer = setTimeout(updateBoardRect, 250);

    window.addEventListener("resize", updateBoardRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateBoardRect);
    };
  }, [isMobile, isLoading]);

  // Track mouse coordinates globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animation loop for smooth follow and precise alignment
  useEffect(() => {
    let animationFrameId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const update = () => {
      const prevX = lerpedPos.current.x;
      const prevY = lerpedPos.current.y;

      // Smoothly lerp towards target mouse coordinates (damping factor 0.15 matches original WebGL)
      lerpedPos.current.x = lerp(lerpedPos.current.x, mouseRef.current.x, 0.15);
      lerpedPos.current.y = lerp(lerpedPos.current.y, mouseRef.current.y, 0.15);

      const vx = lerpedPos.current.x - prevX;
      const vy = lerpedPos.current.y - prevY;

      // Smooth the velocity to prevent jitter in 3D tilt
      velocity.current.x = lerp(velocity.current.x, vx, 0.1);
      velocity.current.y = lerp(velocity.current.y, vy, 0.1);

      // Spring-Mass-Damper simulation for the 2D pendulum swing of the handle
      // Target angle based on horizontal velocity (lags behind the lens center)
      const targetAngle = -velocity.current.x * 0.8;
      
      const springTension = 150.0;
      const springDamping = 12.0;
      const dt = 0.016; // Standard frame step ~60fps
      
      const acceleration = -springTension * (swingAngle.current - targetAngle) - springDamping * swingVelocity.current;
      swingVelocity.current += acceleration * dt;
      swingAngle.current += swingVelocity.current * dt;
      
      // Cap the swing angle to keep it looking clean and realistic
      swingAngle.current = Math.min(Math.max(swingAngle.current, -20), 20);

      const boardEl = document.querySelector('[data-board="true"]');
      let boardRect = boardRectRef.current;
      if (!boardRect && boardEl && clonedBoardRef.current) {
        const rect = boardEl.getBoundingClientRect();
        boardRect = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
        boardRectRef.current = boardRect;
        clonedBoardRef.current.style.width = `${rect.width}px`;
        clonedBoardRef.current.style.height = `${rect.height}px`;
      }

      if (magnifierRef.current && clonedBoardRef.current && boardEl && boardRect) {
        // Centered position of the lens on screen
        const clientX = lerpedPos.current.x;
        const clientY = lerpedPos.current.y;
        
        // Calculate 3D tilt angles based on velocity
        const tiltX = Math.min(Math.max(-velocity.current.y * 0.25, -12), 12);
        const tiltY = Math.min(Math.max(velocity.current.x * 0.25, -12), 12);

        // Apply both the 2D pendulum swing and the 3D tilt
        magnifierRef.current.style.transform = `translate3d(${clientX - LENS_RADIUS}px, ${clientY - LENS_RADIUS}px, 0) rotate(${swingAngle.current}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        // Calculate mouse relative coordinates to the board
        const mouseX = clientX - boardRect.left;
        const mouseY = clientY - boardRect.top;

        // Scale and shift cloned board so the point under cursor aligns perfectly with center of lens
        const tx = LENS_RADIUS - mouseX * ZOOM_FACTOR;
        const ty = LENS_RADIUS - mouseY * ZOOM_FACTOR;
        clonedBoardRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${ZOOM_FACTOR})`;
      }

      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Render SVG based on ID
  const renderItemSvg = (id: string) => {
    switch (id) {
      case "dossier":
        return (
          <DossierSvg
            forceLogo={true}
            className="w-full h-full transition-all duration-300 ease-out"
          />
        );
      case "suspect-1":
        return (
          <Suspect1Svg
            className="w-full h-full transition-all duration-300 ease-out"
          />
        );
      case "suspect-2":
        return (
          <Suspect2Svg
            className="w-full h-full transition-all duration-300 ease-out"
          />
        );
      case "map":
        return (
          <MapSvg
            className="w-full h-full transition-all duration-300 ease-out"
          />
        );
      case "phone":
        return (
          <RotaryPhoneSvg
            className="w-full h-full transition-all duration-300 ease-out"
          />
        );
      case "clock":
        return (
          <VintageClockSvg
            className="w-full h-full transition-all duration-300 ease-out"
          />
        );
      case "evidence":
        return (
          <EvidenceBagSvg
            className="w-full h-full transition-all duration-300 ease-out"
          />
        );
      case "newspaper":
        return (
          <NewspaperSvg
            className="w-full h-full transition-all duration-300 ease-out"
          />
        );
      case "note":
        return (
          <div
            className="w-full h-full bg-[#decfa8] border-2 border-[#1c160e] p-3 font-typewriter text-[9px] sm:text-[10px] md:text-xs text-[#1c160e] flex flex-col justify-between transition-all duration-300 ease-out"
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

  if (isMobile) return null;
  return (
    <div 
      className="absolute inset-0 w-full h-full pointer-events-none z-40 overflow-hidden"
      style={{ perspective: 1000 }}
    >
      <div
        ref={magnifierRef}
        className="absolute pointer-events-none transition-opacity duration-500"
        style={{
          width: LENS_RADIUS * 2,
          height: LENS_RADIUS * 2,
          opacity: isLoading ? 0 : 1,
          left: 0,
          top: 0,
        }}
      >
        {/* Cloned board contents inside circular lens clip */}
        <div
          className="absolute inset-0 overflow-hidden shadow-[inset_0_0_24px_rgba(0,0,0,0.45),0_10px_30px_rgba(0,0,0,0.5)]"
          style={{
            borderRadius: "50%",
            transform: "translate3d(0, 0, 0)", // Hardware accelerated clipping
          }}
        >
          {/* Apply displacement filter at this level to keep map stationary relative to the lens */}
          <div
            className="w-full h-full"
            style={{
              filter: displacementMapUrl ? "url(#lens-bulge)" : "none",
            }}
          >
            {/* Cloned Board */}
            <div
              ref={clonedBoardRef}
              className="absolute origin-top-left rounded-sm"
              style={{
                backgroundImage: "url(/background_detective_bg.svg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                pointerEvents: "none",
                left: 0,
                top: 0,
                boxSizing: "border-box",
              }}
            >
              {/* Repeating cork board texture in background */}
              <CorkboardTexture />

              {/* 2nd layer from bottom: Pinboard in noir and comic style */}
              <NoirPinboard />

              {/* Red thread SVG overlay (replaces WebGL ThreadCanvas in the magnifier) */}
              {/* Red thread SVG overlay (replaces WebGL ThreadCanvas in the magnifier) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {threadConnections.map((conn, idx) => {
                  const p1 = pinPositions[conn.from];
                  const p2 = pinPositions[conn.to];
                  if (!p1 || !p2) return null;

                  const cx = (p1.x + p2.x) / 2;
                  const cy = (p1.y + p2.y) / 2;
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const sag = Math.min(15, dist * 0.04);
                  const controlY = cy + sag;

                  const isHoveredConn = conn.from === hoveredItemId || conn.to === hoveredItemId;

                  return (
                    <path
                      key={idx}
                      d={`M ${p1.x} ${p1.y} Q ${cx} ${controlY} ${p2.x} ${p2.y}`}
                      stroke={isHoveredConn ? "#ff3b3b" : "#c41e1e"}
                      strokeWidth={isHoveredConn ? "4.5" : "3.5"}
                      fill="none"
                      strokeLinecap="round"
                      opacity={isHoveredConn ? "1.0" : "0.85"}
                      className="transition-all duration-300 ease-out"
                      style={{
                        filter: isHoveredConn
                          ? "drop-shadow(0 0 6px rgba(255,59,59,0.8)) drop-shadow(0 2px 4px rgba(0,0,0,0.7))"
                          : "drop-shadow(0 2.5px 3px rgba(0,0,0,0.6))"
                      }}
                    />
                  );
                })}
              </svg>
              {/* Cloned Board Items */}
              {boardItems.map((item) => (
                <ClonedBoardItem
                  key={item.id}
                  item={item}
                  hoveredItemId={hoveredItemId}
                  isMobile={isMobile}
                  renderItemSvg={renderItemSvg}
                />
              ))}

              {/* Foreground elements (table, hat, jacket) overlay inside magnifier */}
              <div 
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  backgroundImage: "url(/background_detective_fg.svg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          </div>

          {/* Glass glare and thickness gradients */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 55%, rgba(0, 0, 0, 0.2) 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              boxShadow: "inset 0 0 25px rgba(0, 0, 0, 0.45), inset 0 4px 12px rgba(255, 255, 255, 0.35), inset 0 -4px 12px rgba(0, 0, 0, 0.55)",
            }}
          />
        </div>

        {/* Outer Metallic Bezel Ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: "1.5px solid #8b6d3b",
            boxShadow: "0 6px 20px rgba(0,0,0,0.6), inset 0 0 0 8px #c8a96e, inset 0 2px 4px 6px rgba(255,255,255,0.45), inset 0 -2px 4px 6px rgba(0,0,0,0.55)",
          }}
        />

        {/* Inner Red Bezel Accenting Ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: "8px",
            border: "2.5px solid #c41e1e",
            boxShadow: "inset 0 0 4px rgba(0,0,0,0.4)",
          }}
        />

        {/* Vintage Handle rotated 45deg (pointing down-left outwards) */}
        <div
          style={{
            position: "absolute",
            left: `${LENS_RADIUS * (1 - 0.7071)}px`,
            top: `${LENS_RADIUS * (1 + 0.7071)}px`,
            transform: "rotate(45deg)",
            transformOrigin: "top center",
          }}
        >
          {/* Brass Joint */}
          <div
            style={{
              width: "18px",
              height: "26px",
              background: "linear-gradient(90deg, #8b6d3b 0%, #c8a96e 50%, #8b6d3b 100%)",
              borderRadius: "3px 3px 0 0",
              marginLeft: "-9px",
              boxShadow: "2px 2px 5px rgba(0,0,0,0.4)",
              border: "1px solid #5c4827",
            }}
          />

          {/* Wooden Grip */}
          <div
            style={{
              width: "15px",
              height: "110px",
              background: "linear-gradient(90deg, #2b1d12 0%, #4e3629 30%, #3a2518 70%, #1e120a 100%)",
              borderRadius: "0 0 4px 4px",
              marginLeft: "-7.5px",
              marginTop: "26px",
              position: "absolute",
              top: 0,
              boxShadow: "3px 3px 8px rgba(0,0,0,0.5)",
            }}
          />

          {/* Handle Brass Tip */}
          <div
            style={{
              width: "16px",
              height: "12px",
              background: "linear-gradient(90deg, #8b6d3b 0%, #c8a96e 50%, #8b6d3b 100%)",
              borderRadius: "0 0 6px 6px",
              marginLeft: "-8px",
              marginTop: "136px",
              position: "absolute",
              top: 0,
              boxShadow: "2px 2px 4px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      </div>

      {/* SVG filter for lens bulge refraction */}
      {/* SVG filter for lens bulge refraction and chromatic aberration */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {displacementMapUrl && aberrationMapUrl && (
            <filter id="lens-bulge" x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feImage href={displacementMapUrl} xlinkHref={displacementMapUrl} result="lensMap" x="0" y="0" width="240" height="240" />
              <feImage href={aberrationMapUrl} xlinkHref={aberrationMapUrl} result="abMap" x="0" y="0" width="240" height="240" />
              
              {/* Base lens displacement applied to all channels equally */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="lensMap"
                scale="64"
                xChannelSelector="R"
                yChannelSelector="G"
                result="bulged"
              />

              {/* Red Channel Aberration */}
              <feDisplacementMap
                in="bulged"
                in2="abMap"
                scale="40"
                xChannelSelector="R"
                yChannelSelector="G"
                result="r_disp"
              />
              <feColorMatrix
                in="r_disp"
                type="matrix"
                values="1 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 1 0"
                result="redChannel"
              />
              
              {/* Green Channel (No extra displacement) */}
              <feColorMatrix
                in="bulged"
                type="matrix"
                values="0 0 0 0 0
                        0 1 0 0 0
                        0 0 0 0 0
                        0 0 0 1 0"
                result="greenChannel"
              />
              
              {/* Blue Channel Aberration */}
              <feDisplacementMap
                in="bulged"
                in2="abMap"
                scale="-40"
                xChannelSelector="R"
                yChannelSelector="G"
                result="b_disp"
              />
              <feColorMatrix
                in="b_disp"
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 1 0 0
                        0 0 0 1 0"
                result="blueChannel"
              />
              
              {/* Combine channels back together using screen blending */}
              <feBlend in="redChannel" in2="greenChannel" mode="screen" result="rg" />
              <feBlend in="rg" in2="blueChannel" mode="screen" />
            </filter>
          )}
        </defs>
      </svg>
    </div>
  );
};
