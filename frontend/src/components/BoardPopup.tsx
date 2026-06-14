"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useBoardStore } from "../stores/useBoardStore";
import { popupContentMap } from "../data/popupContent";

export const BoardPopup: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const activePopup = useBoardStore((state) => state.activePopup);
  const setActivePopup = useBoardStore((state) => state.setActivePopup);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  const data = activePopup ? popupContentMap[activePopup] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault(); // Intercept default Escape close to run GSAP animation
      setActivePopup(null);
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [setActivePopup]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const content = contentRef.current;
    if (!dialog || !content) return;

    if (activePopup && data) {
      // Remember last focused element to restore it on close
      lastActiveElement.current = document.activeElement as HTMLElement;

      dialog.showModal();
      
      // Focus the close button or first action
      const focusable = content.querySelectorAll('button, a, input, [tabindex="0"]');
      if (focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }

      // Animate entry: paper slaps onto desk with slight rotation
      gsap.killTweensOf(content);
      const paragraphs = content.querySelectorAll('.font-typewriter p');
      
      // Reset paragraphs inline style to make sure tween is fresh
      gsap.set(paragraphs, { opacity: 0, y: 10 });

      gsap.fromTo(
        content,
        {
          scale: 0.8,
          opacity: 0,
          rotation: -4,
          y: 30,
        },
        {
          scale: 1,
          opacity: 1,
          rotation: Math.random() * 2 - 1, // subtle random rotation
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            gsap.fromTo(
              paragraphs,
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.12,
                ease: "power1.out",
              }
            );
          }
        }
      );
    } else if (dialog.open) {
      // Animate exit, then close dialog
      gsap.killTweensOf(content);
      gsap.to(content, {
        scale: 0.85,
        opacity: 0,
        rotation: 2,
        y: 20,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          dialog.close();
          // Restore focus
          if (lastActiveElement.current) {
            lastActiveElement.current.focus();
          }
        },
      });
    }
  }, [activePopup, data]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      setActivePopup(null);
    }
  };

  if (!data) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="bg-transparent border-0 outline-none p-4 max-w-lg w-full max-h-[85vh] backdrop:bg-black/80 backdrop:backdrop-blur-sm overflow-visible m-auto"
    >
      <div
        ref={contentRef}
        className="relative bg-[#d4c9a8] text-[#1c160e] p-8 md:p-10 border-4 border-[#1c160e] shadow-[0_15px_30px_rgba(0,0,0,0.5)] rounded-sm overflow-y-auto max-h-[75vh]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(139, 119, 87, 0.15) 0%, transparent 80%),
            radial-gradient(circle at 80% 80%, rgba(90, 70, 50, 0.1) 0%, transparent 60%)
          `,
        }}
      >
        {/* Stamped Red Corner Ribbon Close Button */}
        <button
          onClick={() => setActivePopup(null)}
          aria-label="Закрыть"
          className="absolute top-0 right-0 w-16 h-16 overflow-hidden cursor-pointer group focus:outline-none z-30 select-none"
        >
          <div className="absolute top-[-10px] right-[-25px] w-[80px] h-[30px] bg-[#c41e1e] border-y border-[#1c160e] rotate-[45deg] shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out group-hover:bg-[#e53e3e] group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-active:scale-95 flex items-center justify-center">
            {/* Stamped X on the ribbon (rotated -45deg to offset parent rotation) */}
            <span className="font-serif text-[10px] text-[#1c160e] font-bold rotate-[-45deg] transform translate-y-[2px] opacity-75 group-hover:opacity-100 transition-opacity">
              ✕
            </span>
          </div>
        </button>

        {/* Vintage header */}
        <div className="border-b-2 border-[#1c160e] pb-4 mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-[#1c160e] leading-tight select-text">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="font-typewriter text-xs mt-1 text-[#5c1212] font-semibold uppercase tracking-wider select-text">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Body content (Typewriter style) */}
        <div className="font-typewriter text-sm space-y-4 leading-relaxed text-[#2a2217] select-text">
          {data.content.map((p, idx) => (
            <p key={idx} className="opacity-0 translate-y-2.5">
              {p}
            </p>
          ))}
        </div>

        {/* Action button */}
        {data.actionLabel && data.actionUrl && (
          <div className="mt-8 pt-6 border-t border-[#1c160e]/20 flex justify-end">
            <a
              href={data.actionUrl}
              onClick={(e) => {
                if (data.actionUrl?.startsWith("#")) {
                  e.preventDefault();
                  setActivePopup(data.actionUrl.substring(1));
                }
              }}
              className="px-5 py-3 font-typewriter text-xs font-bold uppercase border-2 border-[#1c160e] bg-[#1c160e] text-[#d4c9a8] hover:bg-[#c41e1e] hover:text-white hover:border-[#1c160e] transition-colors duration-150"
            >
              {data.actionLabel}
            </a>
          </div>
        )}

      </div>
    </dialog>
  );
};
