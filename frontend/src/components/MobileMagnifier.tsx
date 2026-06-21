"use client";

import React, { useRef, useState, useEffect } from "react";
import { useBoardStore } from "../stores/useBoardStore";
import { boardItems, threadConnections, BoardItem, getItemShadow } from "../data/boardItems";
import { CorkboardTexture } from "./BoardSvgs";
import { renderItemSvg, Pin } from "./BoardItemSvg";
import { NoirPinboard } from "./NoirPinboard";
import { WindowScene } from "./WindowScene";

const LENS_RADIUS = 75; // Mobile lens radius
const ZOOM = 1.5;

const ClonedMobileBoardItem: React.FC<{ item: BoardItem }> = ({ item }) => {
  const pos = item.mobile;
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
        transform: `rotate(${pos.rotation}deg)`,
        zIndex: item.zIndex,
      }}
    >
      <Pin itemId={item.id} isHovered={false} showAnchor={false} />
      <div
        className="w-full h-full"
        style={{
          filter: `${getItemShadow(item.id, false)} brightness(${dimBrightness})`,
        }}
      >
        {renderItemSvg(item.id, { isHovered: false, revealHidden: true, isMobile: true })}
      </div>
    </div>
  );
};

export const MobileMagnifier: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [displacementMapUrl, setDisplacementMapUrl] = useState<string | null>(null);

  const magnifierRef = useRef<HTMLDivElement>(null);
  const clonedBoardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<number | null>(null);

  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchPosRef = useRef({ x: 0, y: 0 });
  const boardRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const isLoading = useBoardStore((state) => state.isLoading);
  const pinPositions = useBoardStore((state) => state.pinPositions);
  const hoveredItemId = useBoardStore((state) => state.hoveredItemId);
  const setIsMagnifierActive = useBoardStore((state) => state.setIsMagnifierActive);

  const updatePosition = () => {
    const boardRect = boardRectRef.current;
    if (!boardRect || !magnifierRef.current || !clonedBoardRef.current) return;

    const touchX = touchPosRef.current.x;
    const touchY = touchPosRef.current.y;

    // Clamp lens position to screen boundaries
    const clampedLensX = Math.max(LENS_RADIUS, Math.min(window.innerWidth - LENS_RADIUS, touchX));
    const clampedLensY = Math.max(LENS_RADIUS, Math.min(window.innerHeight - LENS_RADIUS, touchY - 120));

    // Position magnifier relative to the board
    const left = clampedLensX - boardRect.left - LENS_RADIUS;
    const top = clampedLensY - boardRect.top - LENS_RADIUS;

    magnifierRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;

    // Calculate touch position relative to the board
    const touchBoardX = touchX - boardRect.left;
    const touchBoardY = touchY - boardRect.top;

    // Translate cloned board so the point under the finger is at the center of the lens
    const tx = LENS_RADIUS - touchBoardX * ZOOM;
    const ty = LENS_RADIUS - touchBoardY * ZOOM;

    // Clamp translation to keep cloned board boundaries within the circular lens clip (prevent clippings)
    const minTx = LENS_RADIUS * 2 - boardRect.width * ZOOM;
    const minTy = LENS_RADIUS * 2 - boardRect.height * ZOOM;
    const clampedTx = Math.max(minTx, Math.min(0, tx));
    const clampedTy = Math.max(minTy, Math.min(0, ty));

    clonedBoardRef.current.style.transform = `translate3d(${clampedTx}px, ${clampedTy}px, 0) scale(${ZOOM})`;
  };

  useEffect(() => {
    const boardEl = document.querySelector('[data-board="true"]') as HTMLElement | null;
    if (!boardEl) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      touchPosRef.current = { x: touch.clientX, y: touch.clientY };

      const rect = boardEl.getBoundingClientRect();
      boardRectRef.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };

      if (clonedBoardRef.current) {
        clonedBoardRef.current.style.width = `${rect.width}px`;
        clonedBoardRef.current.style.height = `${rect.height}px`;
        clonedBoardRef.current.style.setProperty("--board-width", `${rect.width}px`);
      }

      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
      }

      longPressTimer.current = window.setTimeout(() => {
        setIsActive(true);
        setIsMagnifierActive(true);
        navigator.vibrate?.(15);

        requestAnimationFrame(() => {
          updatePosition();
        });
      }, 200);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchPosRef.current = { x: touch.clientX, y: touch.clientY };

      const dx = touch.clientX - touchStartPos.current.x;
      const dy = touch.clientY - touchStartPos.current.y;
      const dist = Math.hypot(dx, dy);

      const active = useBoardStore.getState().isMagnifierActive;

      if (!active) {
        if (dist > 10) {
          if (longPressTimer.current !== null) {
            window.clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }
      } else {
        e.preventDefault();
        updatePosition();
      }
    };

    const handleTouchEnd = () => {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const active = useBoardStore.getState().isMagnifierActive;
      if (active) {
        setIsActive(false);
        setTimeout(() => {
          setIsMagnifierActive(false);
        }, 150);
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    boardEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    boardEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    boardEl.addEventListener("touchend", handleTouchEnd, { passive: true });
    boardEl.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    boardEl.addEventListener("contextmenu", handleContextMenu);

    return () => {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
      }
      boardEl.removeEventListener("touchstart", handleTouchStart);
      boardEl.removeEventListener("touchmove", handleTouchMove);
      boardEl.removeEventListener("touchend", handleTouchEnd);
      boardEl.removeEventListener("touchcancel", handleTouchEnd);
      boardEl.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [setIsMagnifierActive]);

  // ponytail: displacement map filter is simplified for mobile (no chromatic aberration) to optimize render performance
  useEffect(() => {
    const size = LENS_RADIUS * 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dx = x - LENS_RADIUS;
        const dy = y - LENS_RADIUS;
        const r = Math.sqrt(dx * dx + dy * dy);

        if (r >= LENS_RADIUS) {
          data[idx] = 128;
          data[idx + 1] = 128;
          data[idx + 2] = 128;
          data[idx + 3] = 255;
        } else {
          const normR = r / LENS_RADIUS;
          const factor = Math.pow(normR, 2.5) * 0.38;
          const dispX = -(dx / (r || 1)) * factor;
          const dispY = -(dy / (r || 1)) * factor;

          data[idx] = Math.max(0, Math.min(255, Math.round(128 + dispX * 127)));
          data[idx + 1] = Math.max(0, Math.min(255, Math.round(128 + dispY * 127)));
          data[idx + 2] = 128;
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const url = canvas.toDataURL();
    requestAnimationFrame(() => {
      setDisplacementMapUrl(url);
    });
  }, []);

  if (isLoading) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-[45] overflow-hidden"
      style={{
        opacity: isActive ? 1 : 0,
        transition: "opacity 200ms ease-out",
        visibility: isActive ? "visible" : "hidden",
      }}
    >
      <div
        ref={magnifierRef}
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          width: LENS_RADIUS * 2,
          height: LENS_RADIUS * 2,
          left: 0,
          top: 0,
        }}
      >
        {/* Cloned board contents inside circular lens clip */}
        <div
          className="absolute inset-0 overflow-hidden shadow-[inset_0_0_24px_rgba(0,0,0,0.45),0_10px_30px_rgba(0,0,0,0.5)]"
          style={{
            borderRadius: "50%",
            transform: "translate3d(0, 0, 0)",
          }}
        >
          {/* Apply displacement filter at this level */}
          <div
            className="w-full h-full"
            style={{
              filter: "none",
            }}
          >
            {/* Cloned Board */}
            <div
              ref={clonedBoardRef}
              className="absolute origin-top-left rounded-sm"
              style={{
                backgroundImage: "url(/background_detective_bg_v2.svg)",
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

              {/* Window atmosphere scene */}
              <WindowScene revealHidden={true} disableAnimations={true} />

              {/* 2nd layer from bottom: Pinboard in noir and comic style */}
              <NoirPinboard />

              {/* Red thread SVG overlay (using pinPositions from the store) */}
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

                  return (
                    <path
                      key={idx}
                      d={`M ${p1.x} ${p1.y} Q ${cx} ${controlY} ${p2.x} ${p2.y}`}
                      stroke="#c41e1e"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.85"
                      style={{
                        filter: "drop-shadow(0 2.5px 3px rgba(0,0,0,0.6))",
                      }}
                    />
                  );
                })}
              </svg>

              {/* Cloned Board Items */}
              {boardItems.map((item) => (
                <ClonedMobileBoardItem key={item.id} item={item} />
              ))}

              {/* Table telephone overlay mirrored from the main foreground board */}
              <div
                className="absolute pointer-events-none z-[22] transition-all duration-300 ease-out"
                style={{
                  left: `${(670 / 1385.92) * 100}%`,
                  top: `${(620 / 773.53) * 100}%`,
                  width: `${(225 / 1385.92) * 100}%`,
                  height: `${(145 / 773.53) * 100}%`,
                  backgroundImage: "url(/images/board/table-phone_v2-glow.svg?v=4)",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  transform: `scale(${hoveredItemId === "table-phone" ? 1.1 : 1})`,
                  filter: hoveredItemId === "table-phone"
                    ? "drop-shadow(0 0 20px rgba(0, 191, 255, 0.9)) drop-shadow(0 10px 15px rgba(0,0,0,0.5))"
                    : "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
                }}
              >
                <div
                  className="absolute select-none pointer-events-none"
                  style={{
                    left: "58.2%",
                    top: "64.7%",
                    width: "9.9%",
                    height: "15.2%",
                    transform: "translate(-50%, -50%)",
                    mixBlendMode: "screen",
                    opacity: 0.9,
                    filter:
                      "drop-shadow(0 0 3px rgba(0, 255, 255, 0.85)) drop-shadow(0 0 7px rgba(0, 255, 255, 0.4))",
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <path
                      fill="#00ffff"
                      d="M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"
                    />
                  </svg>
                </div>
              </div>

              {/* Foreground elements overlay */}
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  backgroundImage: "url(/background_detective_fg_v2.svg)",
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
              background:
                "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 55%, rgba(0, 0, 0, 0.2) 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              boxShadow:
                "inset 0 0 25px rgba(0, 0, 0, 0.45), inset 0 4px 12px rgba(255, 255, 255, 0.35), inset 0 -4px 12px rgba(0, 0, 0, 0.55)",
            }}
          />
        </div>

        {/* Outer Metallic Bezel Ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: "1.5px solid #8b6d3b",
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.6), inset 0 0 0 8px #c8a96e, inset 0 2px 4px 6px rgba(255,255,255,0.45), inset 0 -2px 4px 6px rgba(0,0,0,0.55)",
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
      </div>

      {/* SVG filter for lens bulge refraction */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {displacementMapUrl && (
            <filter
              id="mobile-lens-bulge"
              x="0"
              y="0"
              width={LENS_RADIUS * 2}
              height={LENS_RADIUS * 2}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={displacementMapUrl}
                xlinkHref={displacementMapUrl}
                result="lensMap"
                x="0"
                y="0"
                width={LENS_RADIUS * 2}
                height={LENS_RADIUS * 2}
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="lensMap"
                scale="45"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
        </defs>
      </svg>
    </div>
  );
};
