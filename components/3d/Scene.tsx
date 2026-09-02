'use client';

import { Group, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, HTML, useScroll } from '@react-three/drei';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { HeroScene } from './scenes/HeroScene';
import { ArchitectureScene } from './scenes/ArchitectureScene';
import { EngineeringScene } from './scenes/EngineeringScene';
import { IntelligenceScene } from './scenes/IntelligenceScene';
import { ScaleScene } from './scenes/ScaleScene';
import { InfrastructureScene } from './scenes/InfrastructureScene';
import { CTAScene } from './scenes/CTAScene';
import { SceneUI } from '@/components/ui/SceneUI';
import { Navigation } from '@/components/ui/Navigation';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { sceneConfig } from '@/constants/design';
import { colors } from '@/constants/design';

export function Scene() {
  const { camera, scene, gl } = useThree();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const progress = useScrollProgress();
  const reducedMotion = useReducedMotion();

  const scenes = useMemo(() => [
    { key: 'hero', component: <HeroScene />, config: sceneConfig.hero },
    { key: 'architecture', component: <ArchitectureScene />, config: sceneConfig.architecture },
    { key: 'engineering', component: <EngineeringScene />, config: sceneConfig.engineering },
    { key: 'intelligence', component: <IntelligenceScene />, config: sceneConfig.intelligence },
    { key: 'scale', component: <ScaleScene />, config: sceneConfig.scale },
    { key: 'infrastructure', component: <InfrastructureScene />, config: sceneConfig.infrastructure },
    { key: 'cta', component: <CTAScene />, config: sceneConfig.cta },
  ], []);

  useFrame((state, delta) => {
    if (!reducedMotion) {
      camera.position.x += (state.mouse.x * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (-state.mouse.y * 0.5 - camera.position.y) * 0.02;
    }
  });

  useEffect(() => {
    const sceneIndex = scenes.findIndex(s => 
      progress >= s.config.progress.start && progress < s.config.progress.end
    ) ?? scenes.length - 1;
    setCurrentScene(sceneIndex);
  }, [progress, scenes]);

  return (
    <Group>
      <ScrollControls
        ref={scrollRef}
        pages={scenes.length}
        distance={1}
        damping={4}
        horizontal={false}
        infinite={false}
      >
        <Group>
          {scenes.map((sceneItem, index) => (
            <Group key={sceneItem.key} position={[0, 0, -index * 100]}>
              <HTML
                wrapperClass="scene-wrapper"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              >
                {sceneItem.component}
              </HTML>
            </Group>
          ))}
        </Group>
      </ScrollControls>

      <SceneUI 
        currentScene={currentScene} 
        progress={progress}
        scenes={scenes.map(s => s.config.name)}
      />
      <Navigation />
      
      <AmbientEnvironment />
    </Group>
  );
}

function AmbientEnvironment() {
  return (
    <>
      <fog attach="fog" args={[colors.fogColor, 10, 200]} />
    </>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}