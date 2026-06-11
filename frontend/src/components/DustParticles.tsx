"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  fadeSpeed: number;
  targetAlpha: number;
}

export const DustParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const maxParticles = 25;

    const createParticle = (initY = false): Particle => {
      return {
        x: Math.random() * width,
        y: initY ? Math.random() * height : height + 10,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.1 - Math.random() * 0.2, // Float upward slowly
        radius: 0.8 + Math.random() * 1.5,
        alpha: 0,
        targetAlpha: 0.15 + Math.random() * 0.3,
        fadeSpeed: 0.005 + Math.random() * 0.01,
      };
    };

    // Populate initially across the screen
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Warm dust color matching the lamp light (yellowish golden tone)
      ctx.fillStyle = "rgba(224, 204, 168, 1)";

      particles.forEach((p, idx) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Sine wave drift
        p.x += Math.sin(p.y * 0.01 + idx) * 0.1;

        // Fade in
        if (p.alpha < p.targetAlpha) {
          p.alpha = Math.min(p.targetAlpha, p.alpha + p.fadeSpeed);
        }

        // Fade out near the top
        if (p.y < 100) {
          p.alpha = Math.max(0, p.alpha - 0.01);
        }

        // Recycle when out of bounds or faded
        if (p.y < -10 || p.x < -10 || p.x > width + 10 || (p.y < 100 && p.alpha <= 0)) {
          particles[idx] = createParticle(false);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-15 mix-blend-screen"
    />
  );
};
