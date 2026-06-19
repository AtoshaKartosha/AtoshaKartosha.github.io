"use client";

import React, { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Geometry, OGLRenderingContext, Camera } from "ogl";
import { useBoardStore } from "../stores/useBoardStore";
import { threadConnections } from "../data/boardItems";

const SEGMENTS_PER_LINE = 40;
const THICKNESS = 2.5; // 5px total ribbon width for a delicate, organic thread glow
const vertexShader = `
precision mediump float;
attribute vec2 position;
attribute vec2 uv;
attribute float hovered;
attribute float vibration;

varying vec2 vUv;
varying float vHovered;

uniform vec2 uResolution;
uniform float uTime;

void main() {
    vUv = uv;
    vHovered = hovered;
    
    // Organic sway envelope (ends are fixed, middle sways)
    float env = sin(uv.x * 3.14159);
    
    // Slow background sway (constant frequency, constant amplitude)
    float slowSway = sin(uTime * 1.8 + uv.x * 6.28) * env * 3.0;
    
    // Fast high-frequency vibration (constant frequency, fades in with vibration intensity)
    float fastVibe = sin(uTime * 8.0 + uv.x * 12.56) * env * 5.0 * vibration;
    
    float sway = slowSway + fastVibe;
    
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
varying float vHovered;

uniform float uDrawProgress;
uniform vec3 uColor;
uniform float uTime;

void main() {
    // Reveal animation
    if (vUv.x > uDrawProgress) {
        discard;
    }
    
    // Soft glowing line profile (glow gets slightly wider/stronger if hovered)
    float dist = abs(vUv.y);
    float glowCoeff = mix(4.5, 3.5, vHovered);
    float glow = exp(-dist * dist * glowCoeff);
    
    // Crimson core with soft outer glow - make it brighter and more vibrant if hovered
    vec3 baseColor = mix(uColor * 0.3, vec3(1.0, 0.15, 0.15), glow);
    vec3 activeColor = mix(uColor * 0.5, vec3(1.0, 0.35, 0.35), glow);
    vec3 color = mix(baseColor, activeColor, vHovered);
    
    // Soft pulsing highlight traveling along the string (constant speed, more intense if hovered)
    float pulseAmp = mix(0.08, 0.18, vHovered);
    float pulse = sin(vUv.x * 12.0 - uTime * 3.0) * pulseAmp + (1.0 - pulseAmp * 0.5);
    
    gl_FragColor = vec4(color, glow * mix(0.95, 1.0, vHovered) * pulse);
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
  const hoveredItemId = useBoardStore((state) => state.hoveredItemId);
  const hoveredItemIdRef = useRef<string | null>(null);
  const hoverProgressesRef = useRef<Record<string, number>>({});
  const vibrationProgressesRef = useRef<Record<string, number>>({});
  const prevHoveredStateRef = useRef<Record<string, boolean>>({});
  const activeConnectionsRef = useRef<{ from: string; to: string }[]>([]);

  useEffect(() => {
    hoveredItemIdRef.current = hoveredItemId;
  }, [hoveredItemId]);

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
      const gl = glRef.current;
      const program = programRef.current;
      if (meshRef.current) {
        meshRef.current.geometry.remove();
      }
      if (program && gl) {
        program.remove();
      }
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
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
    activeConnectionsRef.current = activeConnections;

    if (activeConnections.length === 0) return;

    // Build merged geometry for all active connections
    // Build merged geometry for all active connections
    const allPositions: number[] = [];
    const allUvs: number[] = [];
    const allHovered: number[] = [];
    const allVibration: number[] = [];
    const allIndices: number[] = [];
    let vertexOffset = 0;
    activeConnections.forEach((conn) => {
      const from = pinPositions[conn.from];
      const to = pinPositions[conn.to];

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      const sag = Math.max(25, dist * 0.12);

      const key = `${conn.from}-${conn.to}`;
      const isConnectionHovered = conn.from === hoveredItemIdRef.current || conn.to === hoveredItemIdRef.current;
      
      if (hoverProgressesRef.current[key] === undefined) {
        hoverProgressesRef.current[key] = isConnectionHovered ? 1.0 : 0.0;
      }
      const hoveredVal = hoverProgressesRef.current[key];

      if (vibrationProgressesRef.current[key] === undefined) {
        vibrationProgressesRef.current[key] = isConnectionHovered ? 0.12 : 0.0;
      }
      const vibrationVal = vibrationProgressesRef.current[key];

      for (let i = 0; i <= SEGMENTS_PER_LINE; i++) {
        const t = i / SEGMENTS_PER_LINE;

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
        allPositions.push(px + nx * THICKNESS, py + ny * THICKNESS);
        allUvs.push(t, 1.0);
        allHovered.push(hoveredVal);
        allVibration.push(vibrationVal);

        allPositions.push(px - nx * THICKNESS, py - ny * THICKNESS);
        allUvs.push(t, -1.0);
        allHovered.push(hoveredVal);
        allVibration.push(vibrationVal);
      }

      for (let i = 0; i < SEGMENTS_PER_LINE; i++) {
        const v0 = vertexOffset + i * 2;
        const v1 = vertexOffset + i * 2 + 1;
        const v2 = vertexOffset + (i + 1) * 2;
        const v3 = vertexOffset + (i + 1) * 2 + 1;

        allIndices.push(v0, v1, v2);
        allIndices.push(v2, v1, v3);
      }

      vertexOffset += (SEGMENTS_PER_LINE + 1) * 2;
    });

    // Remove previous mesh from render cycle if it exists
    if (meshRef.current) {
      meshRef.current.geometry.remove();
    }
    // Create new OGL Geometry
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array(allPositions) },
      uv: { size: 2, data: new Float32Array(allUvs) },
      hovered: { size: 1, data: new Float32Array(allHovered) },
      vibration: { size: 1, data: new Float32Array(allVibration) },
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

      // Smoothly update hover and vibration values for each active connection
      const currentProgresses = hoverProgressesRef.current;
      const currentVibrations = vibrationProgressesRef.current;
      const prevHoveredState = prevHoveredStateRef.current;

      const hoveredAttr = mesh.geometry.attributes.hovered;
      const vibrationAttr = mesh.geometry.attributes.vibration;

      const hoveredData = hoveredAttr?.data as Float32Array | undefined;
      const vibrationData = vibrationAttr?.data as Float32Array | undefined;

      if (hoveredAttr && vibrationAttr && hoveredData && vibrationData) {
        const activeConnections = activeConnectionsRef.current;
        let needsUpdate = false;
        const activeHoveredId = hoveredItemIdRef.current;

        activeConnections.forEach((conn) => {
          const key = `${conn.from}-${conn.to}`;
          const isCurrentlyHovered = (conn.from === activeHoveredId || conn.to === activeHoveredId);
          const targetHover = isCurrentlyHovered ? 1.0 : 0.0;
          
          if (currentProgresses[key] === undefined) {
            currentProgresses[key] = 0.0;
            needsUpdate = true;
          }
          if (currentVibrations[key] === undefined) {
            currentVibrations[key] = 0.0;
            needsUpdate = true;
          }
          if (prevHoveredState[key] === undefined) {
            prevHoveredState[key] = false;
          }

          // Pluck trigger: transition from unhovered to hovered
          if (isCurrentlyHovered && !prevHoveredState[key]) {
            currentVibrations[key] = 1.0;
            needsUpdate = true;
          }
          prevHoveredState[key] = isCurrentlyHovered;

          // 1. Smoothly update hover value (for glow)
          const currentHover = currentProgresses[key];
          if (currentHover !== targetHover) {
            const hoverSpeed = 6.0;
            let newHover = currentHover + (targetHover - currentHover) * (1.0 - Math.exp(-delta * hoverSpeed));
            if (Math.abs(newHover - targetHover) < 0.001) {
              newHover = targetHover;
            }
            currentProgresses[key] = newHover;
            needsUpdate = true;
          }

          // 2. Smoothly update vibration value (for physics)
          const currentVibe = currentVibrations[key];
          let targetVibe = 0.0;
          let vibeDecaySpeed = 4.0; // decay speed when unhovered
          
          if (isCurrentlyHovered) {
            targetVibe = 0.12; // hum rest vibration amplitude
            vibeDecaySpeed = 1.5; // dampening speed when hovered
          }

          if (currentVibe !== targetVibe) {
            let newVibe = currentVibe + (targetVibe - currentVibe) * (1.0 - Math.exp(-delta * vibeDecaySpeed));
            if (Math.abs(newVibe - targetVibe) < 0.001) {
              newVibe = targetVibe;
            }
            currentVibrations[key] = newVibe;
            needsUpdate = true;
          }
        });

        // Only update WebGL attribute arrays and flag upload to GPU when active state transitions are occurring
        if (needsUpdate) {
          let vertexIndex = 0;
          activeConnections.forEach((conn) => {
            const key = `${conn.from}-${conn.to}`;
            const hVal = currentProgresses[key];
            const vVal = currentVibrations[key];
            
            const count = (SEGMENTS_PER_LINE + 1) * 2;
            for (let i = 0; i < count; i++) {
              hoveredData[vertexIndex + i] = hVal;
              vibrationData[vertexIndex + i] = vVal;
            }
            vertexIndex += count;
          });

          hoveredAttr.needsUpdate = true;
          vibrationAttr.needsUpdate = true;
        }
      }

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
      aria-hidden="true"
    />
  );
};
