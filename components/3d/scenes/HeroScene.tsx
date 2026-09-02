'use client';

import { Group, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ComputationalArchitecture } from '../objects/ComputationalArchitecture';
import { DataPathways } from '../objects/DataPathways';
import { ParticleField } from '../objects/ParticleField';
import { AtmosphericFog } from '../objects/AtmosphericFog';
import { CameraController } from '../objects/CameraController';
import { usePerformanceConfig } from '@/hooks/usePerformanceConfig';
import { sceneConfig } from '@/constants/design';

export function HeroScene() {
  const config = usePerformanceConfig();
  const { camera } = useThree();
  const cameraRef = useRef<THREE.Camera>(camera);
  const architectureRef = useRef<ComputationalArchitecture>(null);
  const pathwaysRef = useRef<DataPathways>(null);
  const particlesRef = useRef<ParticleField>(null);
  
  const sceneProgress = useSceneProgress(sceneConfig.hero.progress.start, sceneConfig.hero.progress.end);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    if (architectureRef.current) {
      architectureRef.current.update(time, delta, sceneProgress);
    }
    if (pathwaysRef.current) {
      pathwaysRef.current.update(time, delta, sceneProgress);
    }
    if (particlesRef.current) {
      particlesRef.current.update(time, delta, sceneProgress);
    }
  });

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  return (
    <Group>
      <AtmosphericFog intensity={sceneProgress} />
      <ParticleField 
        ref={particlesRef} 
        count={config.nodeCount * 0.3}
        size={0.02}
        opacity={0.3}
        progress={sceneProgress}
      />
      <ComputationalArchitecture 
        ref={architectureRef}
        structureCount={config.structureCount}
        progress={sceneProgress}
      />
      <DataPathways 
        ref={pathwaysRef}
        count={config.pathwayCount}
        progress={sceneProgress}
      />
      <CameraController 
        camera={cameraRef.current}
        progress={sceneProgress}
        mode="hero"
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