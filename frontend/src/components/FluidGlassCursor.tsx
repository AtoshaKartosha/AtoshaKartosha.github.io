"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBoardStore } from "../stores/useBoardStore";

// The 3D Vintage Magnifying Glass Lens following the mouse pointer
const RefractingLens: React.FC<{
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ mouseRef }) => {
  const ref = useRef<THREE.Group>(null);
  const { viewport: vp } = useThree();

  useFrame(() => {
    if (!ref.current) return;
    
    // Smoothly follow the mouse (normalized to viewport units)
    const targetX = (mouseRef.current.x * vp.width) / 2;
    const targetY = (mouseRef.current.y * vp.height) / 2;
    
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, 0.2);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.2);
    ref.current.position.z = 4.0; // Float above everything
  });

  return (
    <group ref={ref}>
      {/* 1. Gold/Brass Bezel Outer Ring */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.62, 0.035, 16, 64]} />
        <meshPhysicalMaterial
          color="#c8a96e"
          roughness={0.15}
          metalness={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* 2. Inner Red Bezel Accenting Ring */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0.01]}>
        <torusGeometry args={[0.59, 0.008, 8, 64]} />
        <meshBasicMaterial color="#c41e1e" />
      </mesh>

      {/* 3. The 3D Glass Lens Body */}
      <mesh scale={[1, 1, 0.25]}>
        <sphereGeometry args={[0.58, 32, 32]} />
        <meshPhysicalMaterial
          color="#f4f0e6"
          transparent
          opacity={0.35}
          roughness={0.0}
          metalness={0.0}
          transmission={0.95}
          ior={1.4}
          thickness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
        />
      </mesh>

      {/* 4. Realistic Glass Highlight/Reflection (diagonal gloss shine) */}
      <mesh position={[-0.2, 0.2, 0.12]} scale={[0.1, 0.35, 1]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

export const FluidGlassCursor: React.FC = () => {
  const mouseRef = useRef({ x: 0, y: 0 });
  const isLoading = useBoardStore((state) => state.isLoading);

  // Update mouse coordinates globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to clip space coordinates (-1 to 1)
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (isLoading) return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-25 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 15 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Lights to illuminate the 3D brass bezel and glass reflection */}
        <ambientLight intensity={1.2} />
        {/* Directional light positioned to match the desk lamp top-right cone */}
        <directionalLight position={[5, 8, 3]} intensity={1.5} />
        
        {/* The floating magnifying glass lens */}
        <RefractingLens mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};
