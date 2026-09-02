"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { zoneConfigs, buildCameraKeyFrames } from "@/lib/journey";
import { scrollState, pointerState, setScrollElement, ZONE_COUNT } from "@/lib/experience";
import { computeZoneWeights } from "@/lib/zoneWeights";
import { ZoneObjects } from "./ZoneObjects";

export function Journey() {
  const { camera } = useThree();
  const scroll = useScroll();
  const keyframes = useMemo(() => buildCameraKeyFrames(), []);

  const camPos = useRef(new THREE.Vector3(0, 3, 90));
  const lookTarget = useRef(new THREE.Vector3(0, 0, -30));

  useEffect(() => {
    setScrollElement(scroll.el);
  }, [scroll.el]);

  useFrame((_, delta) => {
    const progress = scroll.offset ?? 0;
    const dv = progress - scrollState.progress;
    scrollState.velocity = dv / Math.max(delta, 0.001);
    scrollState.progress = progress;
    scrollState.section = Math.max(
      0,
      Math.min(ZONE_COUNT - 1, Math.round(progress * (ZONE_COUNT - 1)))
    );
    computeZoneWeights();

    const t = progress * (keyframes.length - 1);
    const i = Math.min(keyframes.length - 2, Math.max(0, Math.floor(t)));
    const f = smoothstep(t - i);
    const a = keyframes[i];
    const b = keyframes[i + 1];

    const tx = lerp(a.position.x, b.position.x, f) + pointerState.x * 1.6;
    const ty = lerp(a.position.y, b.position.y, f) + pointerState.y * 1.6;
    const tz = lerp(a.position.z, b.position.z, f);

    camPos.current.set(tx, ty, tz);

    const lx = lerp(a.look.x, b.look.x, f);
    const ly = lerp(a.look.y, b.look.y, f);
    const lz = lerp(a.look.z, b.look.z, f);
    lookTarget.current.set(lx, ly, lz);

    const k = 1 - Math.exp(-delta * 5);
    camera.position.lerp(camPos.current, k);
    const before = camera.quaternion.clone();
    camera.lookAt(lookTarget.current);
    camera.quaternion.slerp(before, Math.max(0, 1 - k));
  });

  return (
    <group>
      {zoneConfigs.map((zc) => (
        <group key={zc.key} position={[0, 0, zc.z]}>
          <ZoneObjects zoneKey={zc.key} />
        </group>
      ))}
    </group>
  );
}

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
