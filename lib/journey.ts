"use client";

import * as THREE from "three";
import type { SectionKey } from "./experience";

export const ZONE_SPACING = 120;

export interface ZoneCameraFrame {
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface ZoneConfig {
  key: SectionKey;
  z: number;
  camera: ZoneCameraFrame;
}

export const zoneConfigs: ZoneConfig[] = [
  { key: "hero", z: 0, camera: { position: [0, 3, 90], lookAt: [0, 0, -30] } },
  { key: "architecture", z: -120, camera: { position: [0, 4, -55], lookAt: [0, 0, -120] } },
  { key: "engineering", z: -240, camera: { position: [0, 12, -175], lookAt: [0, 8, -250] } },
  { key: "intelligence", z: -360, camera: { position: [0, 8, -295], lookAt: [0, 0, -360] } },
  { key: "scale", z: -480, camera: { position: [0, 45, -415], lookAt: [0, 18, -540] } },
  { key: "infrastructure", z: -600, camera: { position: [0, 58, -540], lookAt: [0, 30, -640] } },
  { key: "work", z: -720, camera: { position: [0, 14, -655], lookAt: [0, 0, -720] } },
  { key: "philosophy", z: -840, camera: { position: [0, 24, -775], lookAt: [0, 0, -840] } },
  { key: "cta", z: -960, camera: { position: [0, 4, -895], lookAt: [0, 0, -960] } },
];

export function buildCameraKeyFrames() {
  return zoneConfigs.map((zone) => ({
    position: new THREE.Vector3(...zone.camera.position),
    look: new THREE.Vector3(...zone.camera.lookAt),
  }));
}
