"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useBoardStore } from "../stores/useBoardStore";
import { boardItems } from "../data/boardItems";

// The WebGL 3D Detective Logo built with native Three.js primitives
// No textures or data URLs required, guaranteeing instant render and compatibility
const WebGlDetectiveLogo: React.FC<{
  logoRef?: React.RefObject<THREE.Group | null>;
  opacityRef?: React.MutableRefObject<number>;
}> = ({ logoRef, opacityRef }) => {
  const [opacity, setOpacity] = useState(1);

  // Sync state with ref for animation
  useFrame(() => {
    if (opacityRef && opacityRef.current !== opacity) {
      setOpacity(opacityRef.current);
    }
  });

  return (
    <group ref={logoRef} position={[0, 0, 0.2]} scale={[2.2, 2.2, 1]}>
      {/* 1. Outer Gold Badge Circle */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.9, 1.0, 64]} />
        <meshBasicMaterial color="#c8a96e" transparent opacity={opacity} />
      </mesh>
      
      {/* 2. Inner Red Dotted Circle */}
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[0.83, 0.85, 64]} />
        <meshBasicMaterial color="#c41e1e" transparent opacity={opacity} />
      </mesh>

      {/* 3. Parchment Face Background */}
      <mesh position={[0, 0, 0.03]}>
        <circleGeometry args={[0.82, 64]} />
        <meshBasicMaterial color="#decfa8" transparent opacity={opacity} />
      </mesh>

      {/* 4. Fedora Hat Crown (Black semi-circle) */}
      <mesh position={[0, 0.22, 0.05]} scale={[0.75, 0.45, 1]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#0c0907" transparent opacity={opacity} />
      </mesh>

      {/* 5. Fedora Brim (Red Plane) */}
      <mesh position={[0, 0.16, 0.06]} scale={[1.2, 0.06, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#c41e1e" transparent opacity={opacity} />
      </mesh>
      
      {/* 6. Fedora Brim Bottom Shadow (Black Plane) */}
      <mesh position={[0, 0.13, 0.07]} scale={[1.15, 0.04, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#0c0907" transparent opacity={opacity} />
      </mesh>

      {/* 7. Sunglasses Left Lens */}
      <mesh position={[-0.18, -0.05, 0.08]} scale={[0.16, 0.12, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#0c0907" transparent opacity={opacity} />
      </mesh>

      {/* 8. Sunglasses Right Lens */}
      <mesh position={[0.18, -0.05, 0.08]} scale={[0.16, 0.12, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#0c0907" transparent opacity={opacity} />
      </mesh>
      
      {/* 9. Sunglasses Bridge */}
      <mesh position={[0, -0.02, 0.09]} scale={[0.2, 0.02, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#0c0907" transparent opacity={opacity} />
      </mesh>

      {/* 10. Coat Shoulders (Black Plane) */}
      <mesh position={[0, -0.45, 0.08]} scale={[0.7, 0.35, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#0c0907" transparent opacity={opacity} />
      </mesh>

      {/* 11. Red Tie (Red Plane) */}
      <mesh position={[0, -0.58, 0.09]} scale={[0.07, 0.22, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#c41e1e" transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

// The 3D Vintage Magnifying Glass Lens following the mouse pointer
const RefractingLens: React.FC<{
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  isLoading: boolean;
}> = ({ mouseRef, isLoading }) => {
  const ref = useRef<THREE.Group>(null);
  const { viewport: vp } = useThree();

  useFrame(() => {
    if (!ref.current) return;
    
    let targetX = 0;
    let targetY = 0;
    
    if (isLoading) {
      // During loading: Lens hovers in the center slightly offset to distort the logo
      targetX = (mouseRef.current.x * vp.width) / 6; // dampened mouse follow
      targetY = (mouseRef.current.y * vp.height) / 6;
    } else {
      // After loading: Lens follows the mouse cursor fully
      targetX = (mouseRef.current.x * vp.width) / 2;
      targetY = (mouseRef.current.y * vp.height) / 2;
    }
    
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, 0.15);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.15);
    ref.current.position.z = 4.0; // Float above everything
  });

  return (
    <group ref={ref}>
      {/* 1. Gold/Brass Bezel Outer Ring */}
      <mesh>
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
      <mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[0.59, 0.008, 8, 64]} />
        <meshBasicMaterial color="#c41e1e" />
      </mesh>

      {/* 3. The 3D Glass Lens Body with magnifying refraction */}
      <mesh scale={[1, 1, 0.25]}>
        <sphereGeometry args={[0.58, 32, 32]} />
        {isLoading ? (
          <MeshTransmissionMaterial
            ior={1.28}
            thickness={1.5}
            anisotropy={0.15}
            chromaticAberration={0.05}
            transmission={1.0}
            roughness={0.0}
            distortion={0.15}
            distortionScale={0.05}
            temporalDistortion={0.0}
          />
        ) : (
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            roughness={0.02}
            metalness={0.05}
            transmission={0.9}
            ior={1.52}
            thickness={1.0}
            clearcoat={1.0}
            clearcoatRoughness={0.0}
          />
        )}
      </mesh>

      {/* 4. Realistic Glass Highlight/Reflection (diagonal gloss shine) */}
      <mesh position={[-0.2, 0.2, 0.12]} scale={[0.1, 0.35, 1]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

// The WebGL preloader and transition scene
const WebGlPreloaderScene: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { viewport } = useThree();
  const isLoading = useBoardStore((state) => state.isLoading);

  const logoRef = useRef<THREE.Group>(null);
  const blackPlaneMatRef = useRef<THREE.MeshBasicMaterial>(null);
  
  // Ref to animate opacity inside useFrame to avoid React component trigger lags
  const logoOpacityRef = useRef(1);

  useEffect(() => {
    if (!isLoading && logoRef.current && blackPlaneMatRef.current) {
      // Coordinates of the folder cover on the HTML board
      const boardW = viewport.width * (isMobile ? 1.7 : 0.94);
      const boardH = viewport.height * (isMobile ? 2.1 : 0.92);
      const pos = isMobile ? boardItems[0].mobile : boardItems[0].desktop; // dossier coordinates

      const targetX = -boardW / 2 + (pos.left / 100) * boardW + ((pos.width / 2) / 100) * boardW;
      const targetY = boardH / 2 - (pos.top / 100) * boardH - ((pos.width * 0.85 / 2) / 100) * boardH;
      const targetW = (pos.width / 100) * boardW;

      // 1. Fly the WebGL logo to the dossier cover in local space
      gsap.to(logoRef.current.position, {
        x: targetX,
        y: targetY,
        z: 0.1, // sit on top of dossier
        duration: 1.2,
        ease: "power2.inOut",
      });

      gsap.to(logoRef.current.scale, {
        x: targetW * 0.35, // scale to fit dossier cover center (approx 35% of dossier width)
        y: targetW * 0.35,
        z: 1.0,
        duration: 1.2,
        ease: "power2.inOut",
      });

      // 2. Fade out WebGL loading screen black background
      gsap.to(blackPlaneMatRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: "power2.out",
        onComplete: () => {
          if (blackPlaneMatRef.current) {
            blackPlaneMatRef.current.visible = false;
          }
        },
      });

      // 3. Once logo lands, fade it out to 0 opacity over 0.5s to reveal the HTML dossier logo
      gsap.to(logoOpacityRef, {
        current: 0,
        duration: 0.5,
        delay: 1.2,
        ease: "power2.out",
        onComplete: () => {
          if (logoRef.current) {
            logoRef.current.visible = false;
          }
        },
      });
    }
  }, [isLoading, viewport, isMobile]);

  return (
    <group>
      {/* WebGL black preloader plane */}
      <mesh scale={[viewport.width * 3, viewport.height * 3, 1]} position={[0, 0, 0.15]}>
        <planeGeometry />
        <meshBasicMaterial ref={blackPlaneMatRef} color="#080808" transparent opacity={1} />
      </mesh>

      {/* WebGL 3D Detective Logo badge */}
      <WebGlDetectiveLogo logoRef={logoRef} opacityRef={logoOpacityRef} />
    </group>
  );
};

export const FluidGlassCursor: React.FC = () => {
  const mouseRef = useRef({ x: 0, y: 0 });
  
  const isLoading = useBoardStore((state) => state.isLoading);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-25 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 15 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 3]} intensity={1.5} />

        {/* 1. WebGL preloader & flying logo scene */}
        <WebGlPreloaderScene isMobile={isMobile} />

        {/* 2. The refracting glass lens following the mouse */}
        <RefractingLens mouseRef={mouseRef} isLoading={isLoading} />
      </Canvas>
    </div>
  );
};
