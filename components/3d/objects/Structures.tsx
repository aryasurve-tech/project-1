'use client';

import { useRef, useMemo, useEffect } from 'react';
import { resolveZoneWeight } from '@/lib/zoneWeights';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StructuresProps {
  zone?: string;
  weightKey?: 'enter' | 'deep';
  count: number;
  progress?: number;
  layout?: 'sphere' | 'grid' | 'layers';
  center?: [number, number, number];
  radius?: number;
  size?: [number, number, number];
  opacity?: number;
  wireframeRatio?: number;
  spin?: number;
}

interface StructureData {
  position: THREE.Vector3;
  targetScale: number;
  delay: number;
  rotationSpeed: number;
  phase: number;
}

/**
 * Instanced box structures that assemble (scale from 0) as progress goes 0->1.
 */
export function Structures({
  count,
  progress = 0,
  zone,
  weightKey,
  layout = 'sphere',
  center = [0, 0, 0],
  radius = 40,
  size = [3, 3, 3],
  opacity = 0.15,
  wireframeRatio = 0.25,
  spin = 0.02,
}: StructuresProps) {
  const mainMeshRef = useRef<THREE.InstancedMesh>(null);
  const wireMeshRef = useRef<THREE.InstancedMesh>(null);
  const initialized = useRef(false);

  const wireCount = Math.max(1, Math.min(count, Math.floor(count * wireframeRatio)));

  const geometry = useMemo(() => new THREE.BoxGeometry(size[0], size[1], size[2]), [size]);
  const wireGeometry = useMemo(() => new THREE.BoxGeometry(size[0], size[1], size[2]), [size]);

  const { mainMaterial, wireMaterial } = useMemo(() => {
    const main = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.5,
      metalness: 0.6,
      roughness: 0.4,
      depthWrite: true,
      envMapIntensity: 1,
    });
    const wire = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
      depthWrite: false,
    });
    return { mainMaterial: main, wireMaterial: wire };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dataRef = useRef<StructureData[]>([]);

  useMemo(() => {
    const data: StructureData[] = [];
    let rng = 42;
    const rand = () => {
      rng = (rng * 16807) % 2147483647;
      return rng / 2147483647;
    };

    for (let i = 0; i < count; i++) {
      const r = rand();
      const s = rand();
      const pos = new THREE.Vector3();

      if (layout === 'grid') {
        const cols = Math.ceil(Math.sqrt(count));
        const row = Math.floor(i / cols);
        const col = i % cols;
        pos.set(
          center[0] + (col - cols / 2) * (radius * 2) / cols,
          center[1] + (row - cols / 2) * (radius * 2) / cols,
          center[2] + (s - 0.5) * radius * 0.5
        );
      } else if (layout === 'layers') {
        const layers = 6;
        const layer = i % layers;
        const perLayer = Math.ceil(count / layers);
        const idx = Math.floor(i / layers);
        const ang = (idx / perLayer) * Math.PI * 2;
        const rl = radius * (0.3 + (layer % 3) * 0.2);
        pos.set(
          center[0] + Math.cos(ang) * rl,
          center[1] + (layer - layers / 2) * 5,
          center[2] + Math.sin(ang) * rl
        );
      } else {
        const theta = r * Math.PI * 2;
        const phi = Math.acos(2 * s - 1);
        const rr = radius * (0.3 + Math.pow(rand(), 2) * 0.7);
        pos.set(
          center[0] + rr * Math.sin(phi) * Math.cos(theta),
          center[1] + rr * Math.sin(phi) * Math.sin(theta) * 0.55,
          center[2] + rr * Math.cos(phi)
        );
      }

      data.push({
        position: pos,
        targetScale: 0.4 + rand() * 1.8,
        delay: rand(),
        rotationSpeed: 0.4 + rand() * 1.2,
        phase: i * 0.7,
      });
    }
    dataRef.current = data;
    return data;
  }, [count, layout, center, radius]);

  useEffect(() => {
    const mm = mainMeshRef.current;
    const wm = wireMeshRef.current;
    if (mm) mm.count = count;
    if (wm) wm.count = wireCount;
  }, [count, wireCount]);

  useFrame((state, _delta) => {
    const time = state.clock.getElapsedTime();
    const p = Math.min(1, Math.max(0, resolveZoneWeight(zone, weightKey, progress)));
    const mm = mainMeshRef.current;

    if (mm && !initialized.current) {
      initialized.current = true;
    }

    if (!mm) return;

    for (let i = 0; i < count; i++) {
      const d = dataRef.current[i];
      if (!d) continue;
      const assembly = easeInOut(Math.min(1, Math.max(0, (p - d.delay * 0.6) * 2.2)));
      const scale = Math.max(0.001, d.targetScale * assembly);
      dummy.position.copy(d.position);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(
        time * spin * d.rotationSpeed * 0.5,
        time * spin * d.rotationSpeed,
        time * spin * d.rotationSpeed * 0.25
      );
      dummy.updateMatrix();
      mm.setMatrixAt(i, dummy.matrix);
    }

    mainMaterial.opacity = opacity * (0.5 + 0.5 * p);
    if (wireMeshRef.current) {
      const wm = wireMeshRef.current;
      wireMaterial.opacity = opacity * 0.6 * p;
      for (let i = 0; i < wireCount; i++) {
        const d = dataRef.current[i % count];
        dummy.position.copy(d.position);
        const s = Math.max(0.001, d.targetScale * Math.min(1, p * 2));
        dummy.scale.set(s, s, s);
        dummy.rotation.set(time * spin * 0.3, time * spin * 0.5, time * spin * 0.2);
        dummy.updateMatrix();
        wm.setMatrixAt(i, dummy.matrix);
      }
      wm.instanceMatrix.needsUpdate = true;
      wm.computeBoundingSphere();
    }

    mm.instanceMatrix.needsUpdate = true;
    mm.computeBoundingSphere();
  });

  return (
    <group>
      <instancedMesh ref={mainMeshRef} args={[geometry, mainMaterial, count]} frustumCulled={false} />
      <instancedMesh ref={wireMeshRef} args={[wireGeometry, wireMaterial, wireCount]} frustumCulled={false} />
    </group>
  );
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}