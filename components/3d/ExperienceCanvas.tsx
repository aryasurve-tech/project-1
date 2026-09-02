'use client';

import { Canvas, extend } from '@react-three/fiber';
import { EffectComposer, RenderPixelatedPass } from '@react-three/postprocessing';
import { useMemo, Suspense, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { Scene } from './Scene';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { usePerformanceConfig } from '@/hooks/usePerformanceConfig';
import { design } from '@/constants/design';

extend({ EffectComposer, RenderPixelatedPass });

export function ExperienceCanvas() {
  const config = usePerformanceConfig();
  const pixelRatio = useMemo(() => config.pixelRatio, [config.pixelRatio]);

  return (
    <Canvas
      camera={{ position: [0, 0, 50], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: true,
      }}
      shadows={config.enableShadows}
      dpr={[pixelRatio, 2]}
      style={{ touchAction: 'none' }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Scene />
        {config.enablePostProcessing && <Effects />}
      </Suspense>
    </Canvas>
  );
}

function Effects() {
  return (
    <EffectComposer multisampling={0} renderPriority={1}>
      <RenderPixelatedPass pixelSize={1} />
    </EffectComposer>
  );
}

export function ExperienceCanvasDesktop() {
  return <ExperienceCanvas />;
}