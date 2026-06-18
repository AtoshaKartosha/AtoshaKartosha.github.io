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
    <div 
      className="absolute select-none pointer-events-none overflow-hidden"
      style={{
        boxSizing: "border-box",
        left: "88.15%",
        top: "0%",
        width: "11.85%",
        height: "80%",
        zIndex: 1,
        clipPath: "polygon(0% 15.8%, 100% 0%, 100% 98.4%, 0% 94.1%)",
        boxShadow: "inset 0 0 16px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Faint glass sheen overlay */}
      <div 
        className="absolute inset-0 z-[2] shadow-[inset_0_0_30px_rgba(100,140,180,0.06)] opacity-60"
      />

      {/* Rain and smoke canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[1] opacity-90" />

      {/* Lightning overlay within window */}
      <div 
        className="absolute inset-0 bg-[#b8cceb] pointer-events-none z-[3] mix-blend-screen"
        style={{ opacity: "var(--lightning-intensity, 0)" }}
      />
    </div>
  );
};
