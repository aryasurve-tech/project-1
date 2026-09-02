'use client';

import { Group, useFrame } from '@react-three/fiber';
import { Fog, FogExp2, Color } from 'three';
import { useMemo, useRef } from 'react';
import { colors } from '@/constants/design';

interface AtmosphericFogProps {
  intensity: number;
}

export function AtmosphericFog({ intensity }: AtmosphericFogProps) {
  const fogRef = useRef<FogExp2>();
  const color = useMemo(() => new Color(colors.fogColor), []);
  
  useFrame((state) => {
    if (!fogRef.current) {
      fogRef.current = new FogExp2(color, 0.001);
      state.gl.scene.fog = fogRef.current;
    }
    
    const targetDensity = 0.0005 + intensity * 0.003;
    fogRef.current.density += (targetDensity - fogRef.current.density) * 0.01;
    fogRef.current.color.lerp(color, 0.01);
  });

  return null;
}