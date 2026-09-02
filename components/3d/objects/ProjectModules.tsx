'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { interactionState } from '@/lib/experience';

export interface ProjectModuleData {
  index: number;
  position: [number, number, number];
  scale: number;
}

interface ProjectModulesProps {
  progress?: number;
  modules?: ProjectModuleData[];
}

/**
 * Floating 3D project modules — each is a miniature digital environment.
 * Hovering/clicking highlights a module (expands) and drives the work overlay.
 */
export function ProjectModules({ progress = 0, modules = [] }: ProjectModulesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const shellRefs = useRef<(THREE.Mesh | null)[]>([]);
  const hoverRef = useRef<number>(-1);
  const currentScale = useRef<number[]>([]);

  const { coreGeo, coreMat, shellGeo, shellMat } = useMemo(() => {
    const coreGeo = new THREE.BoxGeometry(4, 4, 4);
    const coreMat = new THREE.MeshStandardMaterial({
      color: '#111111',
      transparent: true,
      opacity: 0.85,
      metalness: 0.5,
      roughness: 0.4,
      depthWrite: true,
    });
    const shellGeo = new THREE.BoxGeometry(6, 6, 6);
    const shellMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.08,
      wireframe: true,
      metalness: 0.8,
      roughness: 0.2,
      depthWrite: false,
    });
    return { coreGeo, coreMat, shellGeo, shellMat };
  }, []);

  if (currentScale.current.length === 0) {
    currentScale.current = modules.map((m) => m.scale);
  }

  function onPointerOver(index: number) {
    hoverRef.current = index;
    interactionState.selectedProject = index;
  }

  function onPointerOut() {
    hoverRef.current = -1;
    interactionState.selectedProject = -1;
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const p = Math.min(1, Math.max(0, progress));
    const group = groupRef.current;
    if (!group) return;

    for (let i = 0; i < modules.length; i++) {
      const m = modules[i];
      const mesh = meshRefs.current[i];
      const shell = shellRefs.current[i];
      if (!mesh || !shell) continue;

      const assemble = Math.min(1, Math.max(0, (p - 0.15) * 2.5));
      const target = m.scale * assemble * (hoverRef.current === i ? 1.35 : 1);
      currentScale.current[i] += (target - currentScale.current[i]) * 0.08;

      mesh.scale.setScalar(currentScale.current[i]);
      shell.scale.setScalar(currentScale.current[i] * (1.3 + Math.sin(time * 0.8 + i) * 0.08));
      mesh.rotation.y = time * 0.1 + i;
      shell.rotation.y = -time * 0.06 + i;

      if (hoverRef.current === i) {
        (mesh.material as THREE.MeshStandardMaterial).opacity = 1;
        (shell.material as THREE.MeshStandardMaterial).opacity = 0.35;
      } else {
        (mesh.material as THREE.MeshStandardMaterial).opacity = 0.85;
        (shell.material as THREE.MeshStandardMaterial).opacity = 0.08;
      }
    }
    group.rotation.y = Math.sin(time * 0.05) * 0.1 * p;
  });

  return (
    <group ref={groupRef}>
      {modules.map((m, i) => (
        <group key={m.index} position={m.position}>
          <mesh
            ref={(el) => {
              meshRefs.current[i] = el;
            }}
            geometry={coreGeo}
            material={coreMat}
            onPointerOver={(e) => {
              e.stopPropagation();
              onPointerOver(i);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              onPointerOut();
            }}
          />
          <mesh
            ref={(el) => {
              shellRefs.current[i] = el;
            }}
            geometry={shellGeo}
            material={shellMat}
          />
        </group>
      ))}
    </group>
  );
}