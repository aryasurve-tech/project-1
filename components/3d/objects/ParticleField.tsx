'use client';

import { Points, useFrame, BufferGeometry, PointsMaterial, Float32BufferAttribute } from '@react-three/fiber';
import { Vector3, Color, AdditiveBlending } from 'three';
import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { colors } from '@/constants/design';

interface ParticleFieldProps {
  count: number;
  size: number;
  opacity: number;
  progress: number;
}

export const ParticleField = forwardRef<ParticleFieldAPI, ParticleFieldProps>(
  ({ count, size, opacity, progress }, ref) => {
    const geometryRef = useRef<BufferGeometry>();
    const positionsRef = useRef<Float32Array>();
    const velocitiesRef = useRef<Float32Array>();
    const sizesRef = useRef<Float32Array>();
    const alphasRef = useRef<Float32Array>();
    const materialRef = useRef<PointsMaterial>();
    const initialized = useRef(false);

    useImperativeHandle(ref, () => ({
      update: (time: number, delta: number, progress: number) => {
        updateParticles(time, delta, progress);
      },
    }), []);

    useFrame((state, delta) => {
      if (!initialized.current) {
        initializeParticles();
        initialized.current = true;
      }
      updateParticles(state.clock.getElapsedTime(), delta, progress);
    });

    function initializeParticles() {
      geometryRef.current = new BufferGeometry();
      positionsRef.current = new Float32Array(count * 3);
      velocitiesRef.current = new Float32Array(count * 3);
      sizesRef.current = new Float32Array(count);
      alphasRef.current = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const radius = 20 + Math.random() * 60;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positionsRef.current[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positionsRef.current[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positionsRef.current[i * 3 + 2] = radius * Math.cos(phi) - 20;

        velocitiesRef.current[i * 3] = (Math.random() - 0.5) * 0.1;
        velocitiesRef.current[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
        velocitiesRef.current[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

        sizesRef.current[i] = size * (0.5 + Math.random() * 1.5);
        alphasRef.current[i] = opacity * (0.1 + Math.random() * 0.9);
      }

      geometryRef.current.setAttribute('position', new Float32BufferAttribute(positionsRef.current, 3));
      geometryRef.current.setAttribute('aSize', new Float32BufferAttribute(sizesRef.current, 1));
      geometryRef.current.setAttribute('aAlpha', new Float32BufferAttribute(alphasRef.current, 1));
    }

    function updateParticles(time: number, delta: number, progress: number) {
      const positions = positionsRef.current;
      const velocities = velocitiesRef.current;
      const alphas = alphasRef.current;
      const easedProgress = progress * progress * (3 - 2 * progress);
      
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3] * delta * 60 * easedProgress;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * delta * 60 * easedProgress;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * delta * 60 * easedProgress;

        const dist = Math.sqrt(
          positions[i * 3] ** 2 + 
          positions[i * 3 + 1] ** 2 + 
          (positions[i * 3 + 2] + 20) ** 2
        );
        
        if (dist > 80) {
          const radius = 20 + Math.random() * 30;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = radius * Math.cos(phi) - 20;
        }

        const pulse = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
        alphas[i] = opacity * (0.05 + 0.95 * pulse * easedProgress);
      }

      geometryRef.current!.attributes.position.needsUpdate = true;
      geometryRef.current!.attributes.aAlpha.needsUpdate = true;
    }

    const material = useMemo(() => new PointsMaterial({
      color: new Color(colors.nodeColor),
      size: size * 100,
      transparent: true,
      opacity: 1,
      vertexColors: false,
      blending: AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }), [size, opacity, progress]);

    materialRef.current = material;

    return (
      <points geometry={geometryRef.current} material={material}>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uProgress: { value: progress },
            uSize: { value: size },
            uOpacity: { value: opacity },
          }}
        />
      </points>
    );
  }
);

ParticleField.displayName = 'ParticleField';

interface ParticleFieldAPI {
  update: (time: number, delta: number, progress: number) => void;
}

const vertexShader = `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  varying float vSize;
  uniform float uTime;
  uniform float uProgress;
  
  void main() {
    vAlpha = aAlpha;
    vSize = aSize;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (300.0 / -mvPosition.z) * vSize * uProgress;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying float vSize;
  uniform float uProgress;
  
  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha * uProgress;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

function shaderMaterial({ vertexShader, fragmentShader, uniforms }: any) {
  return null;
}