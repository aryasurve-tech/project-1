"use client";

import { ScrollControls } from "@react-three/drei";
import { Journey } from "./Journey";
import { Platform } from "react-native";
import * as THREE from "three";

const isWeb = Platform.OS === "web";

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
      <group position={[0, 0, 0]}>
        <HeroZoneObjects />
      </group>
    </group>
  );
}

// Root Scene component
function Scene() {
  return isWeb ? <WebScene /> : <NativeScene />;
}

export default Scene;
