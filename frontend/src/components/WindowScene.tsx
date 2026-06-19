"use client";
// ponytail: custom lightweight canvas loop, use a webgl engine if scene complexity rises

import React, { useEffect, useRef } from "react";

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

interface Streak {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  trail: { x: number; y: number }[];
  paneIndex: number;
  paneTop: number;
  paneBottom: number;
  paneLeft: number;
  paneRight: number;
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  windOffset: number;
}

export const WindowScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set containerRef.current to the board container (parent of the parent wrapper)
    const parentContainer = canvas.parentElement?.parentElement;
    if (parentContainer) {
      containerRef.current = parentContainer;
    }

    let animationFrameId: number;

    const initialW = canvas.parentElement?.clientWidth || canvas.clientWidth || 300;
    const initialH = canvas.parentElement?.clientHeight || canvas.clientHeight || 400;
    let canvasWidth = initialW;
    let canvasHeight = initialH;

    const resizeCanvas = (w: number, h: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetBackingW = Math.floor(w * dpr);
      const targetBackingH = Math.floor(h * dpr);
      
      if (canvas.width !== targetBackingW || canvas.height !== targetBackingH) {
        canvas.width = targetBackingW;
        canvas.height = targetBackingH;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.scale(dpr, dpr);
      }
      
      canvasWidth = w;
      canvasHeight = h;
    };

    resizeCanvas(initialW, initialH);

    const resizeObserver = new ResizeObserver(() => {
      const parent = canvas.parentElement;
      if (parent) {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        resizeCanvas(w, h);
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Rain drops
    const rainDrops: RainDrop[] = [];
    const maxRain = 80;
    for (let i = 0; i < maxRain; i++) {
      rainDrops.push({
        x: Math.random() * initialW,
        y: Math.random() * initialH,
        speed: Math.random() * 4 + 4,
        length: Math.random() * 10 + 8,
        opacity: Math.round((Math.random() * 0.4 + 0.3) * 10) / 10,
      });
    }

    // Streaks
    const streaks: Streak[] = [];
    let streakSpawnTimer = 0;
    // Window pane bounding boxes in objectBoundingBox [0,1] space (from clipPath paths)
    const paneBounds = [
      { u0: 0.288590, v0: 0.114951, u1: 0.650769, v1: 0.362947 },
      { u0: 0.288590, v0: 0.346375, u1: 0.650769, v1: 0.569881 },
      { u0: 0.288590, v0: 0.567761, u1: 0.650769, v1: 0.774544 },
      { u0: 0.288590, v0: 0.787461, u1: 0.650769, v1: 0.956714 },
      { u0: 0.741538, v0: 0.058059, u1: 0.985385, v1: 0.309661 },
      { u0: 0.741538, v0: 0.310681, u1: 0.985385, v1: 0.539361 },
      { u0: 0.741538, v0: 0.547676, u1: 0.985385, v1: 0.771358 },
      { u0: 0.741538, v0: 0.785693, u1: 0.985385, v1: 0.960283 },
    ];

    // Smoke
    const smokeParticles: SmokeParticle[] = [];
    const maxSmoke = 25;
    for (let i = 0; i < maxSmoke; i++) {
      smokeParticles.push({
        x: initialW * 0.3 + (Math.random() - 0.5) * 10,
        y: initialH * (0.5 + Math.random() * 0.45),
        vx: 0,
        vy: -(Math.random() * 0.5 + 0.3),
        radius: Math.random() * 4 + 2,
        opacity: Math.random() * 0.25,
        windOffset: Math.random() * Math.PI * 2,
      });
    }

    let windPhase = 0;
    let lastTime = performance.now();
    let timeSinceLastFlash = 0;
    let nextFlashDelay = Math.random() * 12000 + 8000; // 8-20s
    let flashStart = 0;
    let isFlashing = false;
    let hasDoubleStrike = false;

    let prevIntensity = -1;
    let prevRx = "";
    let prevRy = "";

    const animate = () => {
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;

      const w = canvasWidth;
      const h = canvasHeight;

      // Clear Canvas
      ctx.clearRect(0, 0, w, h);
      // Wind updates
      windPhase += 0.002;
      const windDrift = Math.sin(windPhase) * 1.5;

      // 1. Draw Smoke Column
      for (let i = 0; i < smokeParticles.length; i++) {
        const p = smokeParticles[i];
        p.y += p.vy;
        p.vx = Math.sin(windPhase + p.windOffset) * 0.5;
        p.x += p.vx;
        p.radius += 0.02;

        const heightPct = Math.max(0, p.y / h);
        p.opacity = Math.max(0, heightPct * 0.25);

        if (p.y < 0 || p.opacity <= 0.01) {
          p.x = w * 0.3 + (Math.random() - 0.5) * 8;
          p.y = h * 0.95;
          p.vy = -(Math.random() * 0.5 + 0.3);
          p.radius = Math.random() * 4 + 2;
          p.opacity = 0.25;
        }

        ctx.fillStyle = `rgba(80, 80, 80, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Rain Drops
      ctx.lineWidth = 2.5;
      const rainGroups = new Map<string, { x: number; y: number; length: number }[]>();
      
      for (let i = 0; i < rainDrops.length; i++) {
        const drop = rainDrops[i];
        drop.y += drop.speed;
        drop.x += windDrift;

        if (drop.y > h) {
          drop.y = -drop.length;
          drop.x = Math.random() * w;
          drop.speed = Math.random() * 4 + 4;
          drop.length = Math.random() * 10 + 8;
          drop.opacity = Math.round((Math.random() * 0.4 + 0.3) * 10) / 10;
        }

        if (drop.x > w) drop.x = 0;
        else if (drop.x < 0) drop.x = w;

        const opacityKey = drop.opacity.toFixed(1);
        let group = rainGroups.get(opacityKey);
        if (!group) {
          group = [];
          rainGroups.set(opacityKey, group);
        }
        group.push({ x: drop.x, y: drop.y, length: drop.length });
      }

      for (const [opacityStr, drops] of rainGroups.entries()) {
        ctx.strokeStyle = `rgba(180, 200, 220, ${opacityStr})`;
        ctx.beginPath();
        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + windDrift, d.y + d.length);
        }
        ctx.stroke();
      }

      // 3. Draw Water Streaks — each confined to its own pane
      streakSpawnTimer++;
      if (streakSpawnTimer >= 30) {
        streakSpawnTimer = 0;
        // Spawn in a random pane that has < 2 streaks
        const counts = new Array(paneBounds.length).fill(0);
        for (const s of streaks) counts[s.paneIndex]++;
        const available: number[] = [];
        for (let p = 0; p < paneBounds.length; p++) {
          if (counts[p] < 2) available.push(p);
        }
        if (available.length > 0) {
          const pIdx = available[Math.floor(Math.random() * available.length)];
          const pb = paneBounds[pIdx];
          const px0 = pb.u0 * w, px1 = pb.u1 * w;
          const py0 = pb.v0 * h, py1 = pb.v1 * h;
          streaks.push({
            x: px0 + Math.random() * (px1 - px0),
            y: py0,
            speed: Math.random() * 0.5 + 0.8,
            opacity: 0.5,
            trail: [],
            paneIndex: pIdx,
            paneTop: py0,
            paneBottom: py1,
            paneLeft: px0,
            paneRight: px1,
          });
        }
      }

      for (let i = streaks.length - 1; i >= 0; i--) {
        const streak = streaks[i];
        streak.y += streak.speed;
        streak.x += (Math.random() - 0.5) * 0.2 + windDrift * 0.05;
        // Clamp x within pane to prevent drift into mullions
        if (streak.x < streak.paneLeft) streak.x = streak.paneLeft;
        else if (streak.x > streak.paneRight) streak.x = streak.paneRight;

        streak.trail.push({ x: streak.x, y: streak.y });

        if (streak.trail.length > 20) {
          streak.trail.shift();
        }

        // Remove streak when it reaches the bottom of its pane
        if (streak.y > streak.paneBottom) {
          streaks.splice(i, 1);
          continue;
        }

        if (streak.trail.length > 1) {
          ctx.lineWidth = 3.5;
          for (let j = 1; j < streak.trail.length; j++) {
            const p1 = streak.trail[j - 1];
            const p2 = streak.trail[j];
            const trailOpacity = (j / streak.trail.length) * streak.opacity;
            ctx.strokeStyle = `rgba(180, 200, 220, ${trailOpacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(200, 220, 240, 0.6)`;
        ctx.beginPath();
        ctx.arc(streak.x, streak.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Lightning calculations
      timeSinceLastFlash += dt;
      let intensity = 0;

      if (!isFlashing) {
        if (timeSinceLastFlash > nextFlashDelay) {
          isFlashing = true;
          flashStart = now;
          hasDoubleStrike = Math.random() < 0.5;
          timeSinceLastFlash = 0;
          nextFlashDelay = Math.random() * 12000 + 8000;
        }
      } else {
        const t = now - flashStart;
        if (t < 100) {
          intensity = 1.0;
        } else if (t < 200) {
          intensity = 0.3;
        } else if (t < 300) {
          intensity = hasDoubleStrike ? 0.8 : 0.15;
        } else if (t < 600) {
          const startVal = hasDoubleStrike ? 0.8 : 0.15;
          intensity = Math.max(0, startVal * (1 - (t - 300) / 300));
        } else {
          isFlashing = false;
          intensity = 0;
        }
      }

      // Update CSS variables on local container ref
      const containerEl = containerRef.current;
      if (containerEl) {
        if (intensity !== prevIntensity) {
          containerEl.style.setProperty("--lightning-intensity", intensity.toFixed(3));
          prevIntensity = intensity;
        }

        let rx = "0px";
        let ry = "0px";
        if (intensity > 0.5) {
          rx = `${(Math.random() - 0.5) * 1.5}px`;
          ry = `${(Math.random() - 0.5) * 1.5}px`;
        }
        if (rx !== prevRx || ry !== prevRy) {
          containerEl.style.setProperty("--rumble-x", rx);
          containerEl.style.setProperty("--rumble-y", ry);
          prevRx = rx;
          prevRy = ry;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      const containerEl = containerRef.current;
      if (containerEl) {
        containerEl.style.removeProperty("--lightning-intensity");
        containerEl.style.removeProperty("--rumble-x");
        containerEl.style.removeProperty("--rumble-y");
      }
    };
  }, []);
  return (
    <>
      {/* SVG ClipPath — exact window glass shapes from background_detective_debug_2.svg
          (user-provided mask, viewBox 1386×774, converted to objectBoundingBox [0,1]
           relative to container div at SVG x=[1220,1376] y=[10,600]) */}
      <svg aria-hidden="true" width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="window-panes-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.288590 0.174088 L0.650769 0.114951 V0.321627 L0.288590 0.362947 Z" />
            <path d="M0.288590 0.386720 L0.650769 0.346375 V0.545619 L0.288590 0.569881 Z" />
            <path d="M0.288590 0.591117 L0.650769 0.567761 V0.771358 L0.288590 0.774544 Z" />
            <path d="M0.288590 0.790219 L0.650769 0.787461 V0.956714 L0.288590 0.944197 Z" />
            <path d="M0.741538 0.098616 L0.985385 0.058059 V0.282271 L0.741538 0.309661 Z" />
            <path d="M0.741538 0.337141 L0.985385 0.310681 V0.524407 L0.741538 0.539361 Z" />
            <path d="M0.741538 0.562669 L0.985385 0.547676 V0.767524 L0.741538 0.771358 Z" />
            <path d="M0.741538 0.787461 L0.985385 0.785693 V0.865627 L0.751218 0.866181 V0.902068 L0.773718 0.903988 V0.960283 L0.740000 0.959666 Z" />
          </clipPath>
        </defs>
      </svg>

      <div 
        aria-hidden="true"
        className="absolute select-none pointer-events-none overflow-hidden"
        style={{
          boxSizing: "border-box",
          left: "88.0282%",
          top: "1.2928%",
          width: "11.2561%",
          height: "76.2737%",
          zIndex: 1,
          clipPath: "url(#window-panes-clip)",
          boxShadow: "inset 0 0 16px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Faint glass sheen overlay */}
        <div 
          aria-hidden="true"
          className="absolute inset-0 z-[2] shadow-[inset_0_0_30px_rgba(100,140,180,0.06)] opacity-60"
        />

        {/* Rain and smoke canvas */}
        <canvas 
          ref={canvasRef} 
          aria-hidden="true"
          className="absolute inset-0 w-full h-full z-[1] opacity-90" 
        />

        {/* Lightning overlay within window */}
        <div 
          aria-hidden="true"
          className="absolute inset-0 bg-[#b8cceb] pointer-events-none z-[3] mix-blend-screen"
          style={{ opacity: "var(--lightning-intensity, 0)" }}
        />
      </div>
    </>
  );


};
