'use client';

import { Group, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ConvergenceSystem } from '../objects/ConvergenceSystem';
import { ParticleField } from '../objects/ParticleField';
import { CameraController } from '../objects/CameraController';
import { usePerformanceConfig } from '@/hooks/usePerformanceConfig';
import { sceneConfig } from '@/constants/design';

export function CTAScene() {
  const config = usePerformanceConfig();
  const { camera } = useThree();
  const cameraRef = useRef<THREE.Camera>(camera);
  const convergenceRef = useRef<ConvergenceSystemAPI>(null);
  const particlesRef = useRef<ParticleFieldAPI>(null);
  
  const sceneProgress = useSceneProgress(sceneConfig.cta.progress.start, sceneConfig.cta.progress.end);

  useFrame((state, delta) => {
    if (convergenceRef.current) {
      convergenceRef.current.update(state.clock.getElapsedTime(), delta, sceneProgress);
    }
    if (particlesRef.current) {
      particlesRef.current.update(state.clock.getElapsedTime(), delta, sceneProgress);
    }
  });

  return (
    <Group>
      <ParticleField 
        ref={particlesRef}
        count={config.nodeCount}
        size={0.02}
        opacity={0.3}
        progress={sceneProgress}
      />
      <ConvergenceSystem 
        ref={convergenceRef}
        particleCount={config.nodeCount * 3}
        progress={sceneProgress}
      />
      <CameraController 
        camera={cameraRef.current}
        progress={sceneProgress}
        mode="cta"
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

interface ConvergenceSystemAPI {
  update: (time: number, delta: number, progress: number) => void;
}

interface ParticleFieldAPI {
  update: (time: number, delta: number, progress: number) => void;
}