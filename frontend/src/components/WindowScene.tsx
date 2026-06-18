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
            <path d="M0.27665,0.35361 c0.00000,0.00385,-0.00013,0.00750,-0.00341,0.00939 s-0.01595,0.00335,-0.03360,0.00391 v-0.19455 s0.41159,-0.06940,0.41159,-0.06940 c0.00761,0.00517,-0.00053,0.00960,-0.02028,0.01111 l-0.35383,0.05954,-0.00053,0.18000 Z" />
            <path d="M0.27711,0.56097 c0.00000,0.00403,-0.00013,0.00747,-0.00591,0.00888,-0.00519,0.00128,-0.01700,0.00179,-0.03131,0.00192 l-0.00039,-0.18766,0.41258,-0.04613 c0.00453,0.00327,-0.00118,0.00616,-0.01411,0.00752 l-0.36132,0.03925,0.00039,0.17619 Z" />
            <path d="M0.64118,0.56586 c0.00007,0.00109,-0.00013,0.00194,-0.00125,0.00204,-0.03551,0.00288,-0.08276,0.00575,-0.11854,0.00565 l-0.24462,0.01491 v0.18752 c-0.01260,0.00150,-0.02632,0.00162,-0.03669,0.00012 l-0.00039,-0.18792,0.39827,-0.02488 c0.00459,-0.00029,0.01004,-0.00131,0.01267,-0.00121 s0.00617,0.00143,0.00374,0.00259 c-0.00210,0.00099,-0.00781,0.00138,-0.01313,0.00117 Z" />
            <path d="M0.27711,0.94865 l0.36479,0.01220 c0.00715,0.00024,0.00860,0.00049,0.01116,0.00163,0.00164,0.00073,0.00092,0.00252,-0.00558,0.00228 l-0.40726,-0.01451,-0.00013,-0.15805 c0.00939,-0.00167,0.02566,-0.00187,0.03636,-0.00009 l0.00072,0.15654 Z" />
            
            {/* Right Column Panes */}
            <path d="M0.73996,0.10752 l-0.00046,0.19573 c0.00000,0.00308,0.00000,0.00604,-0.00617,0.00772,-0.00453,0.00124,-0.01516,0.00271,-0.02671,0.00233 l-0.00079,-0.21984,0.28643,-0.04951 c0.00755,0.00196,0.00774,0.00721,-0.00217,0.00890 l-0.24790,0.04221 c-0.01142,0.00230,-0.00230,0.00798,-0.00230,0.01244 Z" />
            <path d="M0.73983,0.53348 c0.00000,0.00315,-0.00072,0.00556,-0.00322,0.00641,-0.00328,0.00111,-0.01319,0.00189,-0.02914,0.00182 l-0.00072,-0.20951,0.28616,-0.03245 c0.00519,0.00022,0.00722,0.00572,0.00158,0.00635 l-0.25446,0.02848,-0.00020,0.19889 Z" />
            <path d="M0.73983,0.76482 c0.00000,0.00342,-0.00072,0.00570,-0.00400,0.00650 s-0.01510,0.00111,-0.02835,0.00043 l-0.00079,-0.21243,0.28925,-0.01778,0.00079,0.00289,-0.25709,0.01603,0.00013,0.20437 Z" />
            <path d="M0.73917,0.96272 c0.01273,0.00291,0.02835,0.00160,0.03991,0.00264 l0.00046,0.00247,-0.07239,-0.00162,0.00098,-0.17743 c0.01070,-0.00094,0.02035,-0.00087,0.03072,-0.00015 l0.00046,0.17657 Z" />
          </clipPath>
        </defs>
      </svg>

      <div 
        className="absolute select-none pointer-events-none overflow-hidden"
        style={{
          boxSizing: "border-box",
          left: "88.16%",
          top: "1.43%",
          width: "10.99%",
          height: "75.98%",
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
