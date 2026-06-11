"use client";

import React, { useRef, useState, useEffect, memo } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useBoardStore } from "../stores/useBoardStore";
import { boardItems } from "../data/boardItems";

interface ModeWrapperProps {
  children: React.ReactNode;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  isLoading: boolean;
  size: { width: number; height: number };
}

// The WebGL 3D Detective Logo built with native Three.js primitives
const WebGlDetectiveLogo: React.FC<{
  logoRef?: React.RefObject<THREE.Group | null>;
  opacityRef?: React.MutableRefObject<number>;
}> = ({ logoRef, opacityRef }) => {
  const [opacity, setOpacity] = useState(1);

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

      {/* 4. Fedora Hat Crown */}
      <mesh position={[0, 0.22, 0.05]} scale={[0.75, 0.45, 1]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#0c0907" transparent opacity={opacity} />
      </mesh>

      {/* 5. Fedora Brim */}
      <mesh position={[0, 0.16, 0.06]} scale={[1.2, 0.06, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#c41e1e" transparent opacity={opacity} />
      </mesh>
      
      {/* 6. Fedora Brim Shadow */}
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

      {/* 10. Coat Shoulders */}
      <mesh position={[0, -0.45, 0.08]} scale={[0.7, 0.35, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#0c0907" transparent opacity={opacity} />
      </mesh>

      {/* 11. Red Tie */}
      <mesh position={[0, -0.58, 0.09]} scale={[0.07, 0.22, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#c41e1e" transparent opacity={opacity} />
      </mesh>
    </group>
  );
};


// ModeWrapper handles FBO creation and rendering the lens following the mouse
const ModeWrapper = memo(function ModeWrapper({
  children,
  mouseRef,
  isLoading,
  size,
}: ModeWrapperProps) {
  const ref = useRef<THREE.Group>(null);
  
  // Custom manual WebGLRenderTarget to avoid WebGL2 immutable texture errors
  const [renderTarget] = useState(() => new THREE.WebGLRenderTarget(512, 512, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  }));

  const bgPlaneMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const { viewport: vp, camera } = useThree();
  const [scene] = useState(() => new THREE.Scene());

  // Keep render target size synchronized with canvas viewport (accounting for DPR)
  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderTarget.setSize(size.width * dpr, size.height * dpr);
    }
  }, [size, renderTarget]);

  // Fade out WebGL flat background plane when loading completes
  useEffect(() => {
    if (!isLoading && bgPlaneMatRef.current) {
      gsap.to(bgPlaneMatRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: "power2.out",
        onComplete: () => {
          if (bgPlaneMatRef.current) {
            bgPlaneMatRef.current.visible = false;
          }
        },
      });
    }
  }, [isLoading]);

  useFrame((state) => {
    const { gl } = state;
    if (!ref.current) return;
    
    // Smoothly follow the mouse (normalized to viewport units)
    const targetX = (mouseRef.current.x * vp.width) / 2;
    const targetY = (mouseRef.current.y * vp.height) / 2;
    
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, 0.15);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.15);
    ref.current.position.z = 3.0; // Float above the board items

    // Apply clean texture magnification center & repeat based on lens position
    const u_L = (ref.current.position.x / (vp.width / 2) + 1) / 2;
    const v_L = (ref.current.position.y / (vp.height / 2) + 1) / 2;
    
    const zoomFactor = isLoading ? 1.0 : 1.4; // Zoom by 1.4x
    
    // renderTarget.texture.center.set(u_L, v_L);
    // renderTarget.texture.repeat.set(1 / zoomFactor, 1 / zoomFactor);

    // Render off-screen scene into renderTarget
    gl.setRenderTarget(renderTarget);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  return (
    <>
      {/* Portals the board items AND lights into the off-screen scene */}
      {createPortal(
        <>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.0} />
          {children}
        </>,
        scene
      )}


      {/* Render the background FBO texture flat on screen (fades out after loading) */}
      <mesh scale={[vp.width, vp.height, 1]} position={[0, 0, 0]}>
        <planeGeometry />
        <meshBasicMaterial
          ref={bgPlaneMatRef}
          map={renderTarget.texture}
          transparent
          opacity={1}
        />
      </mesh>

      {/* The 3D Vintage Magnifying Glass Lens following the mouse pointer */}
      <group ref={ref}>
        {/* 1. Gold/Brass Bezel Outer Ring */}
        <mesh>
          <torusGeometry args={[0.62, 0.03, 16, 64]} />
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
          <torusGeometry args={[0.59, 0.006, 8, 64]} />
          <meshBasicMaterial color="#c41e1e" />
        </mesh>

        {/* 3. The refracting glass lens body */}
        <mesh scale={[0.58, 0.58, 0.15]} position={[0, 0, 0.005]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshTransmissionMaterial
            buffer={renderTarget.texture}
            ior={1.20}
            thickness={1.5}
            anisotropy={0.1}
            chromaticAberration={0.03}
            transmission={1.0}
            roughness={0.0}
            distortion={0.0}
            distortionScale={0.0}
            temporalDistortion={0.0}
          />
        </mesh>

        {/* 4. Wooden Handle and Brass Details */}
        <group position={[0, 0, -0.01]}>
          {/* Handle Brass Joint */}
          <mesh position={[-0.46, -0.46, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08, 16]} />
            <meshPhysicalMaterial
              color="#c8a96e"
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Wooden Grip */}
          <mesh position={[-0.61, -0.61, -0.01]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.025, 0.025, 0.4, 16]} />
            <meshPhysicalMaterial
              color="#3e2723"
              roughness={0.65}
              metalness={0.1}
            />
          </mesh>

          {/* Handle Brass Tip */}
          <mesh position={[-0.77, -0.77, -0.01]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.027, 0.027, 0.06, 16]} />
            <meshPhysicalMaterial
              color="#c8a96e"
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </group>
      </group>
    </>
  );
});

// The WebGL scene matching the HTML board exactly using basic geometries
const WebGlBoardScene: React.FC<{ isMobile: boolean; panOffset: { x: number; y: number } }> = ({
  isMobile,
  panOffset,
}) => {
  const { viewport } = useThree();
  const isLoading = useBoardStore((state) => state.isLoading);
  const logoRef = useRef<THREE.Group>(null);
  const blackPlaneMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const logoOpacityRef = useRef(1);

  // Load high-fidelity textures using Drei's useTexture
  const textures = useTexture({
    dossier: "/images/board/dossier.png",
    "suspect-1": "/images/board/suspect-1.png",
    "suspect-2": "/images/board/suspect-2.png",
    map: "/images/board/map.png",
    phone: "/images/board/phone.png",
    clock: "/images/board/clock.png",
    evidence: "/images/board/evidence.png",
    newspaper: "/images/board/newspaper.png",
    note: "/images/board/note.png",
  });

  // Ensure textures use correct sRGB encoding
  useEffect(() => {
    Object.values(textures).forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
    });
  }, [textures]);

  // Procedural gradient corkboard texture
  const [bgTexture] = useState(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
      grad.addColorStop(0, "#201811");
      grad.addColorStop(1, "#0a0806");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Add noise
      const imgData = ctx.getImageData(0, 0, 512, 512);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 8;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
        data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // Animate the WebGL logo flight and fade out the black preloader plane
  useEffect(() => {
    if (!isLoading && logoRef.current) {
      const boardW = viewport.width * (isMobile ? 1.7 : 0.94);
      const boardH = viewport.height * (isMobile ? 2.1 : 0.92);
      const pos = isMobile ? boardItems[0].mobile : boardItems[0].desktop; // dossier coordinates

      const targetX = -boardW / 2 + (pos.left / 100) * boardW + ((pos.width / 2) / 100) * boardW;
      const targetW = (pos.width / 100) * boardW;
      const targetY = boardH / 2 - (pos.top / 100) * boardH - (targetW * 0.8 / 2);

      // 1. Fly the WebGL logo to the dossier cover in local space
      gsap.to(logoRef.current.position, {
        x: targetX,
        y: targetY,
        z: 0.1, // sit exactly on top of dossier
        duration: 1.2,
        ease: "power2.inOut",
      });

      gsap.to(logoRef.current.scale, {
        x: targetW * 0.35, // scale to fit the dossier cover center (approx 35% of dossier width)
        y: targetW * 0.35,
        z: 1.0,
        duration: 1.2,
        ease: "power2.inOut",
      });

      // 2. Once logo lands, fade it out to 0 opacity over 0.5s to reveal the HTML dossier logo
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

  // Compute scale multiplier for mobile pan offset to match viewport
  const panScaleX = isMobile ? viewport.width / window.innerWidth : 0;
  const panScaleY = isMobile ? viewport.height / window.innerHeight : 0;

  // Render the WebGL board items matching their HTML counterpart positions
  return (
    <group
      position={[
        panOffset.x * panScaleX,
        panOffset.y * panScaleY,
        0,
      ]}
    >
      {/* Background board shadow/border card */}
      <mesh scale={[viewport.width * (isMobile ? 1.7 : 0.94), viewport.height * (isMobile ? 2.1 : 0.92), 1]} position={[0, 0, -0.5]}>
        <planeGeometry />
        <meshBasicMaterial color="#1b140e" />
      </mesh>

      {/* Repeating cork board background */}
      <mesh scale={[viewport.width * (isMobile ? 1.68 : 0.92), viewport.height * (isMobile ? 2.08 : 0.90), 1]} position={[0, 0, -0.4]}>
        <planeGeometry />
        <meshBasicMaterial color="#2c1d12" />
      </mesh>

      {/* The WebGL loading screen background (black plane that fades out) */}
      {isLoading && (
        <mesh scale={[viewport.width * 3, viewport.height * 3, 1]} position={[0, 0, 0.15]}>
          <planeGeometry />
          <meshBasicMaterial ref={blackPlaneMatRef} color="#080808" transparent opacity={1} />
        </mesh>
      )}

      {/* Render WebGL representation of each board item using basic geometries */}
      {boardItems.map((item) => {
        const pos = isMobile ? item.mobile : item.desktop;

        const boardW = viewport.width * (isMobile ? 1.7 : 0.94);
        const boardH = viewport.height * (isMobile ? 2.1 : 0.92);

        const w = (pos.width / 100) * boardW;
        
        let aspect = 1.2;
        if (item.id === "dossier") aspect = 0.8;
        else if (item.id === "map" || item.id === "phone" || item.id === "clock") aspect = 1.0;
        else if (item.id === "evidence") aspect = 1.25;
        else if (item.id === "newspaper") aspect = 1.22;
        const h = w * aspect;

        const x = -boardW / 2 + (pos.left / 100) * boardW + w / 2;
        const y = boardH / 2 - (pos.top / 100) * boardH - h / 2;

        const texture = (textures as any)[item.id];

        if (texture && item.id !== "dossier" && item.id !== "phone") {
          return (
            <group key={item.id} position={[x, y, 0.1]} rotation={[0, 0, (pos.rotation * Math.PI) / 180]}>
              <mesh scale={[w, h, 1]}>
                <planeGeometry />
                <meshBasicMaterial map={texture} transparent={true} />
              </mesh>
            </group>
          );
        }

        return (
          <group key={item.id} position={[x, y, 0.1]} rotation={[0, 0, (pos.rotation * Math.PI) / 180]}>
            {item.id === "dossier" && (
              // Dossier Folder
              <mesh scale={[w, h, 1]}>
                <planeGeometry />
                <meshBasicMaterial color="#bfae93" />
              </mesh>
            )}

            {item.id === "suspect-1" && (
              // Suspect 1 (Femme Fatale) - Polaroid
              <group>
                <mesh scale={[w, h, 1]}>
                  <planeGeometry />
                  <meshBasicMaterial color="#f1ece1" />
                </mesh>
                <mesh scale={[w * 0.88, h * 0.72, 1]} position={[0, h * 0.08, 0.01]}>
                  <planeGeometry />
                  <meshBasicMaterial color="#2c2014" />
                </mesh>
              </group>
            )}

            {item.id === "suspect-2" && (
              // Suspect 2 (Mobster) - Polaroid
              <group>
                <mesh scale={[w, h, 1]}>
                  <planeGeometry />
                  <meshBasicMaterial color="#eae3d5" />
                </mesh>
                <mesh scale={[w * 0.88, h * 0.72, 1]} position={[0, h * 0.08, 0.01]}>
                  <planeGeometry />
                  <meshBasicMaterial color="#241a12" />
                </mesh>
              </group>
            )}

            {item.id === "map" && (
              // Map Card (Beige with red pin circle)
              <group>
                <mesh scale={[w, h, 1]}>
                  <planeGeometry />
                  <meshBasicMaterial color="#decfa8" />
                </mesh>
                <mesh position={[0, 0, 0.01]} scale={[w * 0.14, w * 0.14, 1]}>
                  <circleGeometry args={[1, 32]} />
                  <meshBasicMaterial color="#c41e1e" />
                </mesh>
              </group>
            )}

            {item.id === "phone" && (
              // Phone (Black circle body + cream dial circle)
              <group>
                <mesh scale={[w * 0.9, h * 0.9, 1]}>
                  <circleGeometry args={[1, 32]} />
                  <meshBasicMaterial color="#1c1b18" />
                </mesh>
                <mesh position={[0, -h * 0.08, 0.01]} scale={[w * 0.35, w * 0.35, 1]}>
                  <circleGeometry args={[1, 32]} />
                  <meshBasicMaterial color="#eae2d2" />
                </mesh>
              </group>
            )}

            {item.id === "clock" && (
              // Clock (Gold case + cream dial face)
              <group>
                <mesh scale={[w, h, 1]}>
                  <circleGeometry args={[1, 32]} />
                  <meshBasicMaterial color="#c8a96e" />
                </mesh>
                <mesh position={[0, 0, 0.01]} scale={[w * 0.84, h * 0.84, 1]}>
                  <circleGeometry args={[1, 32]} />
                  <meshBasicMaterial color="#ecdcb9" />
                </mesh>
              </group>
            )}

            {item.id === "evidence" && (
              // Evidence Bag (translucent sheet + red/black dice)
              <group>
                <mesh scale={[w, h, 1]}>
                  <planeGeometry />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.16} />
                </mesh>
                <mesh position={[-w * 0.2, -h * 0.2, 0.01]} scale={[w * 0.22, w * 0.22, 1]} rotation={[0, 0, 0.2]}>
                  <planeGeometry />
                  <meshBasicMaterial color="#c41e1e" />
                </mesh>
                <mesh position={[w * 0.2, -h * 0.25, 0.01]} scale={[w * 0.22, w * 0.22, 1]} rotation={[0, 0, -0.3]}>
                  <planeGeometry />
                  <meshBasicMaterial color="#1c1b18" />
                </mesh>
              </group>
            )}

            {item.id === "newspaper" && (
              // Newspaper (Aged yellow-beige clipping)
              <mesh scale={[w, h, 1]}>
                <planeGeometry />
                <meshBasicMaterial color="#dfd6c0" />
              </mesh>
            )}

            {item.id === "note" && (
              // Typewritten Note (Beige card)
              <mesh scale={[w, h, 1]}>
                <planeGeometry />
                <meshBasicMaterial color="#decfa8" />
              </mesh>
            )}
          </group>
        );
      })}

      {/* WebGL 3D Detective Logo badge */}
      <WebGlDetectiveLogo logoRef={logoRef} opacityRef={logoOpacityRef} />
    </group>
  );
};


export const FluidGlassCursor: React.FC = () => {
  const mouseRef = useRef({ x: 0, y: 0 });
  
  const isLoading = useBoardStore((state) => state.isLoading);
  const panOffset = useBoardStore((state) => state.panOffset);
  const [isMobile, setIsMobile] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Resize handler using ResizeObserver
  useEffect(() => {
    const canvas = document.querySelector(".fluid-glass-canvas canvas");
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeObserver = new ResizeObserver(() => {
      setSize({
        width: parent.clientWidth,
        height: parent.clientHeight,
      });
      setIsMobile(window.innerWidth < 1024);
    });

    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
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
    <div className="fluid-glass-canvas absolute inset-0 w-full h-full pointer-events-none z-25 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 15 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 3]} intensity={1.5} />

        <ModeWrapper
          mouseRef={mouseRef}
          isLoading={isLoading}
          size={size}
        >
          {/* Renders the matching WebGL scene inside the FBO only */}
          <React.Suspense fallback={null}>
            <WebGlBoardScene isMobile={isMobile} panOffset={panOffset} />
          </React.Suspense>
        </ModeWrapper>
      </Canvas>
    </div>
  );
};
