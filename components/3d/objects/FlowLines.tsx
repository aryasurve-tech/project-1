'use client';

import { useRef, useMemo, useEffect } from 'react';
import { resolveZoneWeight } from '@/lib/zoneWeights';
import { useFrame } from '@react-three/fiber';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';
import * as THREE from 'three';

interface FlowLinesProps {
  zone?: string;
  weightKey?: 'enter' | 'deep';
  count: number;
  progress?: number;
  center?: [number, number, number];
  spread?: number;
  color?: string;
  opacity?: number;
  resolution?: { width: number; height: number };
}

interface FlowLineData {
  line: Line2;
  phase: number;
  speed: number;
}

/**
 * Curved data pathway lines that animate dashes flowing along their path,
 * like data traveling through a network.
 */
export function FlowLines({
  count,
  progress = 0,
  zone,
  weightKey,
  center = [0, 0, 0],
  spread = 50,
  color = '#ffffff',
  opacity = 0.5,
  resolution,
}: FlowLinesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<FlowLineData[]>([]);
  const initialized = useRef(false);
  const devices = useRef(Array.from({ length: count }).map(() => Math.random()));

  const viewport = useMemo(
    () => resolution ?? { width: 1920, height: 1080 },
    [resolution?.width, resolution?.height]
  );

  const material = useMemo(() => {
    const mat = new LineMaterial({
      color: color as unknown as number,
      linewidth: 0.8,
      dashed: true,
      dashSize: 2,
      gapSize: 4,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      resolution: new THREE.Vector2(viewport.width, viewport.height),
    });
    return mat;
  }, [color, viewport.width, viewport.height]);

  useFrame((state) => {
    if (!initialized.current) {
      buildLines();
      initialized.current = true;
    }

    const time = state.clock.getElapsedTime();
    const p = Math.min(1, Math.max(0, resolveZoneWeight(zone, weightKey, progress)));

    for (const l of linesRef.current) {
      const t = (time * l.speed + l.phase) % 1;
      const mat = l.line.material as unknown as LineMaterial;
      mat.dashOffset = -t * 200;
      mat.opacity = opacity * (0.12 + 0.88 * Math.abs(Math.sin(t * Math.PI))) * p;
      mat.dashSize = 1.2 + Math.abs(Math.sin(t * Math.PI * 3)) * 2.5;
    }
  });

  function buildLines() {
    linesRef.current = [];
    if (!groupRef.current) return;

    for (let i = 0; i < count; i++) {
      const r1 = devices.current[i];
      const r2 = devices.current[(i * 3 + 1) % count];
      const r3 = devices.current[(i * 5 + 2) % count];
      const r4 = devices.current[(i * 7 + 3) % count];

      const startTheta = r1 * Math.PI * 2;
      const startPhi = Math.acos(2 * r2 - 1);
      const startR = spread * (0.2 + r3 * 0.8);
      const segs = 6 + Math.floor(r4 * 10);

      const sx = center[0] + startR * Math.sin(startPhi) * Math.cos(startTheta);
      const sy = center[1] + startR * Math.sin(startPhi) * Math.sin(startTheta);
      const sz = center[2] + startR * Math.cos(startPhi);

      const tx = center[0] + (r2 - 0.5) * spread * 0.8;
      const ty = center[1] + (r1 - 0.5) * spread * 0.8;

      const points: THREE.Vector3[] = [new THREE.Vector3(sx, sy, sz)];
      for (let j = 1; j <= segs; j++) {
        const t = j / segs;
        const bend = Math.sin(t * Math.PI) * spread * 0.3;
        const bx = sx + (tx - sx) * t + (r3 - 0.5) * bend;
        const by = sy + (ty - sy) * t + (r4 - 0.5) * bend;
        const bz = sz + (center[2] - sz) * t + (r1 - 0.5) * bend * 0.6;
        points.push(new THREE.Vector3(bx, by, bz));
      }

      const geo = new LineGeometry();
      geo.setPositions(points.flatMap((v) => [v.x, v.y, v.z]));
      const line = new Line2(geo, material.clone());
      line.computeLineDistances();
      groupRef.current.add(line);
      linesRef.current.push({ line, phase: r3, speed: 0.12 + r4 * 0.4 });
    }
  }

  useEffect(() => {
    return () => {
      if (groupRef.current) groupRef.current.clear();
      linesRef.current = [];
      material.dispose();
    };
  }, [material]);

  return <group ref={groupRef} />;
}