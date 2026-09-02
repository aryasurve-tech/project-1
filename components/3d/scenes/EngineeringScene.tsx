'use client';

import { Group, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ModularSystem } from '../objects/ModularSystem';
import { DataPathways } from '../objects/DataPathways';
import { ParticleField } from '../objects/ParticleField';
import { CameraController } from '../objects/CameraController';
import { usePerformanceConfig } from '@/hooks/usePerformanceConfig';
import { sceneConfig } from '@/constants/design';

export function EngineeringScene() {
  const config = usePerformanceConfig();
  const { camera } = useThree();
  const cameraRef = useRef<THREE.Camera>(camera);
  const modularRef = useRef<ModularSystemAPI>(null);
  const pathwaysRef = useRef<DataPathwaysAPI>(null);
  const particlesRef = useRef<ParticleFieldAPI>(null);
  
  const sceneProgress = useSceneProgress(sceneConfig.engineering.progress.start, sceneConfig.engineering.progress.end);

  useFrame((state, delta) => {
    if (modularRef.current) {
      modularRef.current.update(state.clock.getElapsedTime(), delta, sceneProgress);
    }
    if (pathwaysRef.current) {
      pathwaysRef.current.update(state.clock.getElapsedTime(), delta, sceneProgress);
    }
    if (particlesRef.current) {
      particlesRef.current.update(state.clock.getElapsedTime(), delta, sceneProgress);
    }
  });

  return (
    <Group>
      <ParticleField 
        ref={particlesRef}
        count={config.nodeCount * 0.25}
        size={0.02}
        opacity={0.25}
        progress={sceneProgress}
      />
      <ModularSystem 
        ref={modularRef}
        moduleCount={config.structureCount}
        progress={sceneProgress}
      />
      <DataPathways 
        ref={pathwaysRef}
        count={config.pathwayCount * 0.7}
        progress={sceneProgress}
      />
      <CameraController 
        camera={cameraRef.current}
        progress={sceneProgress}
        mode="engineering"
      />
    </Group>
  );
}

function useSceneProgress(start: number, end: number) {
  const { scroll } = useScroll();
  const { pages } = useScroll();
  
  return useMemo(() => {
    if (pages <= 1) return 0;
    const progress = scroll.current / (pages - 1);
    return Math.max(0, Math.min(1, (progress - start) / (end - start)));
  }, [scroll.current, pages, start, end]);
}

function useScroll() {
  return { scroll: { current: 0 }, pages: 7 };
}

function useThree() {
  return { camera: { position: { set: () => {}, lerp: () => {} }, lookAt: () => {} } };
}

interface ModularSystemAPI {
  update: (time: number, delta: number, progress: number) => void;
}

interface DataPathwaysAPI {
  update: (time: number, delta: number, progress: number) => void;
}

interface ParticleFieldAPI {
  update: (time: number, delta: number, progress: number) => void;
}