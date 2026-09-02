"use client";

import { ScrollControls } from "@react-three/drei";
import { Journey } from "./Journey";
import { ZoneObjects } from "./ZoneObjects";
import { Platform } from "react-native";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const isWeb = Platform.OS === "web";

function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.6}
        mipmapBlur
        radius={0.7}
      />
    </EffectComposer>
  );
}

// Web: ScrollControls journey
function WebScene() {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 60, 900]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#ffffff", "#000000", 0.4]} />
      <pointLight position={[0, 60, 90]} intensity={100} decay={0} color="#ffffff" />
      <pointLight position={[0, 60, -480]} intensity={100} decay={0} color="#ffffff" />
      <pointLight position={[0, 60, -960]} intensity={100} decay={0} color="#ffffff" />
      <ScrollControls pages={9} damping={2.2} distance={1}>
        <Journey />
      </ScrollControls>
      <PostFX />
    </>
  );
}

// Native: Static hero zone
function NativeScene() {
  return (
    <group>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 60, 900]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#ffffff", "#000000", 0.4]} />
      <pointLight position={[0, 60, 90]} intensity={100} decay={0} color="#ffffff" />
      <ZoneObjects zoneKey="hero" />
    </group>
  );
}

// Root Scene component
function Scene() {
  return isWeb ? <WebScene /> : <NativeScene />;
}

export default Scene;