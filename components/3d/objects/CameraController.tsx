'use client';

import { useFrame } from '@react-three/fiber';
import { Camera, Vector3, Euler } from 'three';
import { useMemo, useRef } from 'react';
import { useDeviceType } from '@/hooks/useDeviceType';

interface CameraControllerProps {
  camera: Camera;
  progress: number;
  mode: 'hero' | 'architecture' | 'engineering' | 'intelligence' | 'scale' | 'infrastructure' | 'cta';
}

export function CameraController({ camera, progress, mode }: CameraControllerProps) {
  const deviceType = useDeviceType();
  const targetRef = useRef(new Vector3());
  const rotationRef = useRef(new Euler());
  const mouseRef = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  useFrame((state, delta) => {
    if (!initialized.current) {
      initializeCamera();
      initialized.current = true;
    }

    updateCamera(delta, progress);
  });

  function initializeCamera() {
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);
  }

  function updateCamera(delta: number, progress: number) {
    const easedProgress = progress * progress * (3 - 2 * progress);
    
    switch (mode) {
      case 'hero':
        updateHeroCamera(delta, easedProgress);
        break;
      case 'architecture':
        updateArchitectureCamera(delta, easedProgress);
        break;
      case 'engineering':
        updateEngineeringCamera(delta, easedProgress);
        break;
      case 'intelligence':
        updateIntelligenceCamera(delta, easedProgress);
        break;
      case 'scale':
        updateScaleCamera(delta, easedProgress);
        break;
      case 'infrastructure':
        updateInfrastructureCamera(delta, easedProgress);
        break;
      case 'cta':
        updateCTACamera(delta, easedProgress);
        break;
    }

    if (deviceType === 'desktop') {
      const mouseInfluence = 0.3 * easedProgress;
      camera.position.x += (mouseRef.current.x * mouseInfluence - camera.position.x) * delta * 2;
      camera.position.y += (-mouseRef.current.y * mouseInfluence - camera.position.y) * delta * 2;
    }
  }

  function updateHeroCamera(delta: number, progress: number) {
    const radius = 50 - progress * 20;
    const theta = performance.now() * 0.00005;
    const phi = Math.PI / 3 + progress * 0.2;
    
    targetRef.current.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta) * 0.5,
      radius * Math.cos(phi)
    );
    
    camera.position.lerp(targetRef.current, delta * 0.5);
    camera.lookAt(0, 0, -10);
  }

  function updateArchitectureCamera(delta: number, progress: number) {
    const radius = 30 - progress * 10;
    const height = 5 + progress * 10;
    const theta = performance.now() * 0.00003;
    
    targetRef.current.set(
      radius * Math.cos(theta),
      height,
      radius * Math.sin(theta) - 20
    );
    
    camera.position.lerp(targetRef.current, delta * 0.8);
    camera.lookAt(0, 0, -20);
  }

  function updateEngineeringCamera(delta: number, progress: number) {
    const radius = 25;
    const height = 10 + progress * 5;
    const theta = performance.now() * 0.00002;
    
    targetRef.current.set(
      radius * Math.cos(theta),
      height,
      radius * Math.sin(theta) - 40
    );
    
    camera.position.lerp(targetRef.current, delta * 0.8);
    camera.lookAt(0, 5, -40);
  }

  function updateIntelligenceCamera(delta: number, progress: number) {
    const radius = 20 + progress * 10;
    const height = 15;
    const theta = performance.now() * 0.00004;
    
    targetRef.current.set(
      radius * Math.cos(theta),
      height,
      radius * Math.sin(theta) - 60
    );
    
    camera.position.lerp(targetRef.current, delta * 0.6);
    camera.lookAt(0, 5, -60);
  }

  function updateScaleCamera(delta: number, progress: number) {
    const radius = 30 + progress * 100;
    const height = 20 + progress * 50;
    const theta = performance.now() * 0.00001;
    
    targetRef.current.set(
      radius * Math.cos(theta),
      height,
      radius * Math.sin(theta) - 80
    );
    
    camera.position.lerp(targetRef.current, delta * 0.4);
    camera.lookAt(0, 20, -120);
  }

  function updateInfrastructureCamera(delta: number, progress: number) {
    const radius = 80;
    const height = 50;
    const theta = performance.now() * 0.00002;
    
    targetRef.current.set(
      radius * Math.cos(theta),
      height,
      radius * Math.sin(theta) - 150
    );
    
    camera.position.lerp(targetRef.current, delta * 0.5);
    camera.lookAt(0, 30, -150);
  }

  function updateCTACamera(delta: number, progress: number) {
    const radius = 100 - progress * 80;
    const height = 50 - progress * 40;
    const theta = performance.now() * 0.00003;
    
    targetRef.current.set(
      radius * Math.cos(theta),
      height,
      radius * Math.sin(theta) - 200
    );
    
    camera.position.lerp(targetRef.current, delta * 0.3);
    camera.lookAt(0, 10, -200);
  }

  return null;
}