"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { Scene } from "./Scene";
import { pointerState } from "@/lib/experience";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

// Adaptive quality settings
const dpr = isWeb ? Math.min(window.devicePixelRatio, 2) : 1;
const events = isWeb ? { compute: (e) => e.touches?.[0] || e } : undefined;

// Pointer tracking
useEffect(() => {
  if (!isWeb) return;
  const onMove = (e: PointerEvent) => {
    pointerState.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerState.y = (e.clientY / window.innerHeight) * 2 - 1;
    pointerState.active = true;
  };
  window.addEventListener("pointermove", onMove);
  return () => window.removeEventListener("pointermove", onMove);
}, []);

// Canvas wrapper
function ExperienceCanvas() {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: true,
      }}
      dpr={[1, dpr]}
      camera={{
        position: [0, 3, 90],
        fov: 55,
        near: 0.1,
        far: 2000,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents compute={events} />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

export default ExperienceCanvas;
