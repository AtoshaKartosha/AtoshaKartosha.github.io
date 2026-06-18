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
      if (!canvas) return;
      const w = canvas.parentElement?.clientWidth || canvas.clientWidth || 300;
      const h = canvas.parentElement?.clientHeight || canvas.clientHeight || 400;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
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

      // ponytail: ensure size is up to date dynamically
      const parentW = canvas.parentElement?.clientWidth || canvas.clientWidth || 300;
      const parentH = canvas.parentElement?.clientHeight || canvas.clientHeight || 400;
      if (canvas.width !== parentW || canvas.height !== parentH) {
        canvas.width = parentW;
        canvas.height = parentH;
      }
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

        ctx.strokeStyle = `rgba(255, 30, 30, ${drop.opacity + 0.45})`; // ponytail: bright red for debug
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
            ctx.strokeStyle = `rgba(255, 255, 0, ${trailOpacity + 0.45})`; // ponytail: bright yellow for debug
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(255, 255, 0, 1.0)`; // ponytail: bright yellow for debug
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
            <path d="M0.04860,0.33508 c0.00000,0.00416,-0.00017,0.00812,-0.00449,0.01016 s-0.02098,0.00363,-0.04220,0.00423 v-0.21053 s0.54135,-0.07511,0.54135,-0.07511 c0.01001,0.00560,-0.00069,0.01038,-0.02667,0.01202 l-0.46538,0.06443,-0.00069,0.19479 Z" />
            <path d="M0.04921,0.55947 c0.00000,0.00436,-0.00017,0.00808,-0.00777,0.00961,-0.00682,0.00138,-0.02236,0.00193,-0.04118,0.00208 l-0.00052,-0.20307,0.54265,-0.04992 c0.00596,0.00354,-0.00155,0.00667,-0.01856,0.00814 l-0.47522,0.04248,0.00052,0.19066 Z" />
            <path d="M0.52806,0.56476 c0.00009,0.00118,-0.00017,0.00210,-0.00164,0.00221,-0.04670,0.00311,-0.10886,0.00622,-0.15590,0.00611 l-0.32174,0.01613 v0.20293 c-0.01657,0.00162,-0.03462,0.00175,-0.04826,0.00013 l-0.00052,-0.20335,0.52383,-0.02692 c0.00604,-0.00031,0.01321,-0.00142,0.01666,-0.00131 s0.00811,0.00155,0.00492,0.00280 c-0.00276,0.00107,-0.01027,0.00149,-0.01727,0.00127 Z" />
            <path d="M0.04921,0.97899 l0.47980,0.01320 c0.00941,0.00026,0.01131,0.00053,0.01468,0.00177,0.00216,0.00079,-0.00734,0.00247,-0.05734,0.00247 l-0.53565,-0.01571,-0.00017,-0.17104 c0.01234,-0.00180,0.03375,-0.00203,0.04782,-0.00009 l0.00095,0.16940 Z" />
            
            {/* Right Column Panes */}
            <path d="M0.65798,0.06877 l-0.00060,0.21180 c0.00000,0.00333,0.00000,0.00654,-0.00811,0.00836,-0.00596,0.00134,-0.01994,0.00293,-0.03513,0.00252 l-0.00104,-0.23789,0.37673,-0.05358 c0.00993,0.00212,0.01019,0.00781,-0.00285,0.00963 l-0.32605,0.04568 c-0.01502,0.00249,-0.00302,0.00864,-0.00302,0.01346 Z" />
            <path d="M0.65780,0.52972 c0.00000,0.00341,-0.00095,0.00602,-0.00423,0.00694,-0.00432,0.00120,-0.01735,0.00204,-0.03833,0.00197 l-0.00095,-0.22672,0.37638,-0.03511 c0.00682,0.00024,0.00950,0.00619,0.00207,0.00687 l-0.33469,0.03082,-0.00026,0.21523 Z" />
            <path d="M0.65780,0.78006 c0.00000,0.00370,-0.00095,0.00617,-0.00527,0.00703 s-0.01510,0.00120,-0.02835,0.00046 l-0.00079,-0.22988,0.38044,-0.01924,0.00104,0.00313,-0.33814,0.01734,0.00013,0.22116 Z" />
            <path d="M0.65694,0.99422 c0.01675,0.00315,0.03729,0.00173,0.05249,0.00285 l0.00060,0.00267,-0.09522,-0.00175,0.00129,-0.19201 c0.01407,-0.00101,0.02676,-0.00094,0.04040,-0.00017 l0.00060,0.19107 Z" />
          </clipPath>
        </defs>
      </svg>

      <div 
        className="absolute select-none pointer-events-none overflow-hidden"
        style={{
          boxSizing: "border-box",
          left: "90.79%",
          top: "4.77%",
          width: "8.36%",
          height: "70.22%",
          zIndex: 1,
          // clipPath: "url(#window-panes-clip)",
          outline: "4px solid #ff00ff",
          background: "rgba(255, 0, 255, 0.25)",
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
          className="absolute inset-0 w-full h-full z-[1] opacity-90" 
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
