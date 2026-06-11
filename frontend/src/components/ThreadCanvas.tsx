"use client";

import React, { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Geometry, OGLRenderingContext, Camera } from "ogl";
import { useBoardStore } from "../stores/useBoardStore";
import { threadConnections } from "../data/boardItems";

const vertexShader = `
precision mediump float;
attribute vec2 position;
attribute vec2 uv;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;

void main() {
    vUv = uv;
    
    // Organic sway (middle sways, ends are fixed)
    float env = sin(uv.x * 3.14159);
    float sway = sin(uTime * 1.8 + uv.x * 6.28) * env * 4.0;
    
    vec2 pos = position;
    pos.y += sway;
    
    // Map pixels to clip space
    vec2 ndc = (pos / uResolution) * 2.0 - 1.0;
    ndc.y = -ndc.y; // Flip Y for WebGL
    
    gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform float uDrawProgress;
uniform vec3 uColor;
uniform float uTime;
void main() {
    // Reveal animation
    if (vUv.x > uDrawProgress) {
        discard;
    }
    
    // Soft glowing line profile
    float dist = abs(vUv.y);
    float glow = exp(-dist * dist * 4.5);
    
    // Crimson core with soft outer glow
    vec3 color = mix(uColor * 0.3, vec3(1.0, 0.15, 0.15), glow);
    
    // Soft pulsing highlight traveling along the string
    float pulse = sin(vUv.x * 12.0 - uTime * 2.5) * 0.08 + 0.92;
    
    gl_FragColor = vec4(color, glow * 0.95 * pulse);
}
`;

export const ThreadCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const glRef = useRef<OGLRenderingContext | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const programRef = useRef<Program | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const initialized = useRef(false);
  const animationFrameId = useRef<number | null>(null);

  const pinPositions = useBoardStore((state) => state.pinPositions);
  const isLoading = useBoardStore((state) => state.isLoading);

  // Uniform values
  const drawProgress = useRef(0.0);
  const time = useRef(0.0);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Resize handler using ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeObserver = new ResizeObserver(() => {
      setSize({
        width: parent.clientWidth,
        height: parent.clientHeight,
      });
    });

    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || initialized.current) return;

    // 1. Initialize OGL Renderer
    const dpr = Math.min(window.devicePixelRatio, 2);
    const renderer = new Renderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      dpr,
      preserveDrawingBuffer: true,
    });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    glRef.current = gl;

    // Create dummy camera
    const camera = new Camera(gl);
    cameraRef.current = camera;
    // Enable blending for glowing thread transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 2. Program Setup
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uResolution: { value: [canvas.clientWidth, canvas.clientHeight] },
        uTime: { value: 0 },
        uDrawProgress: { value: 0.0 },
        uColor: { value: [0.77, 0.12, 0.12] }, // Crimson red thread
      },
      transparent: true,
      cullFace: null,
      depthTest: false,
      depthWrite: false,
    });
    programRef.current = program;

    initialized.current = true;

    // 3. Cleanup on unmount
    return () => {
      initialized.current = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // Clean WebGL resources
      if (meshRef.current) {
        meshRef.current.geometry.remove();
      }
    };
  }, []);

  // Update Geometry when Pin Positions or Canvas Size changes
  useEffect(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    const program = programRef.current;
    if (!gl || !canvas || !program || size.width === 0 || size.height === 0) return;

    const width = size.width;
    const height = size.height;

    // Make sure we have resolution uniform updated
    program.uniforms.uResolution.value = [width, height];

    // Set canvas dimensions
    if (rendererRef.current) {
      rendererRef.current.setSize(width, height);
    }

    // Filter connections where we have positions for both ends
    const activeConnections = threadConnections.filter(
      (c) => pinPositions[c.from] && pinPositions[c.to]
    );

    if (activeConnections.length === 0) return;

    // Build merged geometry for all active connections
    const segmentsPerLine = 40;
    const thickness = 2.5; // 5px total ribbon width for a delicate, organic thread glow

    const allPositions: number[] = [];
    const allUvs: number[] = [];
    const allIndices: number[] = [];
    let vertexOffset = 0;

    activeConnections.forEach((conn) => {
      const from = pinPositions[conn.from];
      const to = pinPositions[conn.to];

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      const sag = Math.max(25, dist * 0.12);

      for (let i = 0; i <= segmentsPerLine; i++) {
        const t = i / segmentsPerLine;

        // Bezier quadratic curve
        const cx = (from.x + to.x) / 2;
        const cy = (from.y + to.y) / 2 + sag;

        const mt = 1 - t;
        const px = mt * mt * from.x + 2 * mt * t * cx + t * t * to.x;
        const py = mt * mt * from.y + 2 * mt * t * cy + t * t * to.y;

        // Tangent
        const tx = 2 * mt * (cx - from.x) + 2 * t * (to.x - cx);
        const ty = 2 * mt * (cy - from.y) + 2 * t * (to.y - cy);
        const len = Math.hypot(tx, ty);

        let nx = 0;
        let ny = 0;
        if (len > 0) {
          nx = -ty / len;
          ny = tx / len;
        }

        // Side vertices (+thickness and -thickness)
        allPositions.push(px + nx * thickness, py + ny * thickness);
        allUvs.push(t, 1.0);

        allPositions.push(px - nx * thickness, py - ny * thickness);
        allUvs.push(t, -1.0);
      }

      for (let i = 0; i < segmentsPerLine; i++) {
        const v0 = vertexOffset + i * 2;
        const v1 = vertexOffset + i * 2 + 1;
        const v2 = vertexOffset + (i + 1) * 2;
        const v3 = vertexOffset + (i + 1) * 2 + 1;

        allIndices.push(v0, v1, v2);
        allIndices.push(v2, v1, v3);
      }

      vertexOffset += (segmentsPerLine + 1) * 2;
    });

    // Remove previous mesh from render cycle if it exists
    if (meshRef.current) {
      meshRef.current.geometry.remove();
    }
    // Create new OGL Geometry
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array(allPositions) },
      uv: { size: 2, data: new Float32Array(allUvs) },
      index: { data: new Uint16Array(allIndices) },
    });

    // Create Mesh
    meshRef.current = new Mesh(gl, {
      geometry,
      program,
      frustumCulled: false,
    });
    console.log("ThreadCanvas geometry built. Connections:", activeConnections.length, "Positions:", allPositions.length, "Indices:", allIndices.length);
    console.log("Positions sample:", allPositions.slice(0, 10));
  }, [pinPositions, size]);

  // Animation loop
  useEffect(() => {
    let lastTime = 0;

    const renderLoop = (now: number) => {
      const gl = glRef.current;
      const renderer = rendererRef.current;
      const mesh = meshRef.current;
      const program = programRef.current;
      const camera = cameraRef.current;

      if (!gl || !renderer || !program || !mesh || !camera) {
        animationFrameId.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Calculate dt
      const delta = lastTime ? (now - lastTime) / 1000 : 0;
      lastTime = now;

      if (Math.random() < 0.02) {
        console.log("DrawProgress:", drawProgress.current, "isLoading:", isLoading, "meshExists:", !!mesh, "time:", time.current);
      }

      time.current += delta;
      program.uniforms.uTime.value = time.current;

      // Animate draw progress once loading screen clears
      if (!isLoading) {
        if (drawProgress.current < 1.0) {
          drawProgress.current = Math.min(1.0, drawProgress.current + delta * 1.5); // 0.6s draw duration
        }
      } else {
        drawProgress.current = 0.0;
      }
      program.uniforms.uDrawProgress.value = drawProgress.current;

      // Render
      renderer.render({ scene: mesh, camera });

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isLoading]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};
