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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Rain drops
    const rainDrops: RainDrop[] = [];
    const maxRain = 80;
    for (let i = 0; i < maxRain; i++) {
      rainDrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 4 + 4,
        length: Math.random() * 10 + 8,
        opacity: Math.random() * 0.4 + 0.3,
      });
    }

    // Streaks
    const streaks: Streak[] = [];
    let streakSpawnTimer = 0;

    // Smoke
    const smokeParticles: SmokeParticle[] = [];
    const maxSmoke = 25;
    for (let i = 0; i < maxSmoke; i++) {
      smokeParticles.push({
        x: canvas.width * 0.3 + (Math.random() - 0.5) * 10,
        y: canvas.height * (0.5 + Math.random() * 0.45),
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

      const w = canvas.width;
      const h = canvas.height;

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
      for (let i = 0; i < rainDrops.length; i++) {
        const drop = rainDrops[i];
        drop.y += drop.speed;
        drop.x += windDrift;

        if (drop.y > h) {
          drop.y = -drop.length;
          drop.x = Math.random() * w;
          drop.speed = Math.random() * 4 + 4;
          drop.length = Math.random() * 10 + 8;
          drop.opacity = Math.random() * 0.4 + 0.3;
        }

        if (drop.x > w) drop.x = 0;
        else if (drop.x < 0) drop.x = w;

        ctx.strokeStyle = `rgba(0, 255, 255, ${drop.opacity + 0.35})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + windDrift, drop.y + drop.length);
        ctx.stroke();
      }

      // 3. Draw Water Streaks
      streakSpawnTimer++;
      if (streakSpawnTimer >= 30 && streaks.length < 5) {
        streakSpawnTimer = 0;
        streaks.push({
          x: Math.random() * w,
          y: 0,
          speed: Math.random() * 0.5 + 0.8,
          opacity: 0.5,
          trail: [],
        });
      }

      for (let i = streaks.length - 1; i >= 0; i--) {
        const streak = streaks[i];
        streak.y += streak.speed;
        streak.x += (Math.random() - 0.5) * 0.2 + windDrift * 0.05;
        streak.trail.push({ x: streak.x, y: streak.y });

        if (streak.trail.length > 20) {
          streak.trail.shift();
        }

        if (streak.y > h) {
          streaks.splice(i, 1);
          continue;
        }

        if (streak.trail.length > 1) {
          ctx.lineWidth = 3.5;
          for (let j = 1; j < streak.trail.length; j++) {
            const p1 = streak.trail[j - 1];
            const p2 = streak.trail[j];
            const trailOpacity = (j / streak.trail.length) * streak.opacity;
            ctx.strokeStyle = `rgba(0, 255, 120, ${trailOpacity + 0.35})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(0, 255, 120, 1.0)`;
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

      // Update global CSS variables for overlays and shake
      if (intensity !== prevIntensity) {
        document.documentElement.style.setProperty("--lightning-intensity", intensity.toFixed(3));
        prevIntensity = intensity;
      }

      let rx = "0px";
      let ry = "0px";
      if (intensity > 0.5) {
        rx = `${(Math.random() - 0.5) * 1.5}px`;
        ry = `${(Math.random() - 0.5) * 1.5}px`;
      }
      if (rx !== prevRx || ry !== prevRy) {
        document.documentElement.style.setProperty("--rumble-x", rx);
        document.documentElement.style.setProperty("--rumble-y", ry);
        prevRx = rx;
        prevRy = ry;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      document.documentElement.style.removeProperty("--lightning-intensity");
      document.documentElement.style.removeProperty("--rumble-x");
      document.documentElement.style.removeProperty("--rumble-y");
    };
  }, []);

  return (
    <>
      {/* SVG ClipPath Definition for the window glass panes */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="window-panes-clip" clipPathUnits="objectBoundingBox">
            {/* Left Column Panes */}
            <path d="M0.35213,0.35646 c0.00000,0.00388,-0.00017,0.00756,-0.00434,0.00947 s-0.02030,0.00338,-0.04277,0.00395 v-0.19612 s0.52389,-0.06996,0.52389,-0.06996 c0.00969,0.00521,-0.00067,0.00967,-0.02581,0.01120 l-0.45038,0.06002,-0.00067,0.18145 Z" />
            <path d="M0.35272,0.56550 c0.00000,0.00407,-0.00017,0.00753,-0.00752,0.00895,-0.00660,0.00129,-0.02164,0.00180,-0.03985,0.00194 l-0.00050,-0.18917,0.52515,-0.04650 c0.00576,0.00329,-0.00150,0.00621,-0.01796,0.00758 l-0.45990,0.03957,0.00050,0.17761 Z" />
            <path d="M0.81612,0.57042 c0.00008,0.00110,-0.00017,0.00196,-0.00159,0.00206,-0.04520,0.00290,-0.10535,0.00580,-0.15088,0.00569 l-0.31136,0.01503 v0.18904 c-0.01604,0.00151,-0.03350,0.00163,-0.04670,0.00012 l-0.00050,-0.18943,0.50693,-0.02508 c0.00585,-0.00029,0.01278,-0.00132,0.01612,-0.00122 s0.00785,0.00144,0.00476,0.00261 c-0.00267,0.00099,-0.00994,0.00139,-0.01671,0.00118 Z" />
            <path d="M0.35272,0.95630 l0.46433,0.01230 c0.00911,0.00024,0.01094,0.00050,0.01420,0.00165,0.00209,0.00074,-0.00710,0.00230,-0.05710,0.00230 l-0.51838,-0.01463,-0.00017,-0.15933 c0.01195,-0.00168,0.03266,-0.00189,0.04628,-0.00009 l0.00092,0.15780 Z" />
            
            {/* Right Column Panes */}
            <path d="M0.94185,0.10839 l-0.00058,0.19730 c0.00000,0.00310,0.00000,0.00609,-0.00785,0.00779,-0.00576,0.00125,-0.01930,0.00273,-0.03400,0.00235 l-0.00100,-0.22161,0.36458,-0.04991 c0.00961,0.00197,0.00986,0.00727,-0.00276,0.00897 l-0.31554,0.04256 c-0.01454,0.00232,-0.00292,0.00804,-0.00292,0.01254 Z" />
            <path d="M0.94169,0.53778 c0.00000,0.00317,-0.00092,0.00561,-0.00409,0.00647,-0.00418,0.00111,-0.01679,0.00190,-0.03709,0.00184 l-0.00092,-0.21120,0.36424,-0.03271 c0.00660,0.00022,0.00919,0.00576,0.00201,0.00640 l-0.32389,0.02871,-0.00025,0.20049 Z" />
            <path d="M0.94169,0.77098 c0.00000,0.00345,-0.00092,0.00575,-0.00510,0.00655 s-0.01921,0.00111,-0.03609,0.00043 l-0.00100,-0.21415,0.36817,-0.01792,0.00100,0.00292,-0.32723,0.01616,0.00017,0.20602 Z" />
            <path d="M0.94085,0.97048 c0.01621,0.00293,0.03609,0.00161,0.05079,0.00266 l0.00058,0.00249,-0.09215,-0.00163,0.00125,-0.17886 c0.01362,-0.00094,0.02590,-0.00087,0.03910,-0.00015 l0.00058,0.17799 Z" />
          </clipPath>
        </defs>
      </svg>

      <div 
        className="absolute select-none pointer-events-none overflow-hidden"
        style={{
          boxSizing: "border-box",
          left: "88.16%",
          top: "1.43%",
          width: "8.64%",
          height: "75.37%",
          zIndex: 1,
          clipPath: "url(#window-panes-clip)",
          boxShadow: "inset 0 0 16px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Faint glass sheen overlay */}
        <div 
          className="absolute inset-0 z-[2] shadow-[inset_0_0_30px_rgba(100,140,180,0.06)] opacity-60"
        />

        {/* Rain and smoke canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-[1] opacity-90" 
          style={{
            width: "115%",
            height: "100%",
            transform: "perspective(800px) rotateY(-25deg)",
            transformOrigin: "left center",
          }}
        />

        {/* Lightning overlay within window */}
        <div 
          className="absolute inset-0 bg-[#b8cceb] pointer-events-none z-[3] mix-blend-screen"
          style={{ opacity: "var(--lightning-intensity, 0)" }}
        />
      </div>
    </>
  );
};
