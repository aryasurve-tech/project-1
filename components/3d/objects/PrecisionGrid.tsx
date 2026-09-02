'use client';

import { useRef, useMemo } from 'react';
import { resolveZoneWeight } from '@/lib/zoneWeights';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PrecisionGridProps {
  zone?: string;
  weightKey?: 'enter' | 'deep';
  progress?: number;
  size?: number;
  divisions?: number;
  center?: [number, number, number];
  opacity?: number;
}

/**
 * A precise, organized lattice of fine lines — reads as engineered structure
 * coming into order. Used for the philosophy section.
 */
export function PrecisionGrid({
  progress = 0,
  zone,
  weightKey,
  size = 40,
  divisions = 9,
  center = [0, 0, 0],
  opacity = 0.25,
}: PrecisionGridProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sideRef = useRef<THREE.LineSegments>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const { sidesGeometry, sidesMaterial, coreGeometry, coreMaterial } = useMemo(() => {
    const rng = randomGen(5);
    const positions: number[] = [];
    const step = (size * 2) / divisions;

    // Confined wireframe cube frames floating at grid intersections.
    for (let gx = -1; gx <= 1; gx++) {
      for (let gy = -1; gy <= 1; gy++) {
        for (let gz = 0; gz <= 0; gz++) {
          const ox = center[0] + gx * size;
          const oy = center[1] + gy * size;
          const oz = center[2] + gz * size + (rng() - 0.5) * 10;
          const half = size * (0.12 + rng() * 0.05);
          const corners: THREE.Vector3[] = [];
          for (let ix = -1; ix <= 1; ix += 2) {
            for (let iy = -1; iy <= 1; iy += 2) {
              for (let iz = -1; iz <= 1; iz += 2) {
                corners.push(
                  new THREE.Vector3(ox + ix * half, oy + iy * half, oz + iz * half)
                );
              }
            }
          }
          const edges: [number, number][] = [
            [0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7],
            [4, 5], [4, 6], [5, 7], [6, 7],
          ];
          for (const [a, b] of edges) {
            positions.push(
              corners[a].x, corners[a].y, corners[a].z,
              corners[b].x, corners[b].y, corners[b].z
            );
          }
        }
      }
    }

    // Fine horizontal grid lines.
    for (let i = 0; i <= divisions; i++) {
      const v = -size + i * step;
      positions.push(-size, center[1], v, size, center[1], v);
      positions.push(v, center[1], -size, v, center[1], size);
    }

    const sidesGeometry = new THREE.BufferGeometry();
    sidesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const sidesMaterial = new THREE.LineBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const coreGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.2,
      depthWrite: false,
    });

    return { sidesGeometry, sidesMaterial, coreGeometry, coreMaterial };
  }, [size, divisions, center]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const p = Math.min(1, Math.max(0, resolveZoneWeight(zone, weightKey, progress)));
    const group = groupRef.current;
    if (group) {
      group.rotation.y = time * 0.02 * p;
      group.position.y = Math.sin(time * 0.4) * 0.6 * p;
    }
    sidesMaterial.opacity = opacity * (0.3 + 0.7 * p);
    coreMaterial.opacity = opacity * 1.5 * p;
    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.4 + 0.6 * p);
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={sideRef} geometry={sidesGeometry} material={sidesMaterial} />
      <mesh ref={coreRef} geometry={coreGeometry} material={coreMaterial} />
    </group>
  );
}

function randomGen(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}