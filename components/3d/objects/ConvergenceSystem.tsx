'use client';

import { Group, Points, BufferGeometry, PointsMaterial, Float32BufferAttribute, Line2, LineGeometry, LineMaterial } from '@react-three/fiber';
import { Vector3, Color, AdditiveBlending, Matrix4, MathUtils } from 'three';
import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { colors } from '@/constants/design';

interface ConvergenceSystemProps {
  particleCount: number;
  progress: number;
}

export const ConvergenceSystem = forwardRef<ConvergenceSystemAPI, ConvergenceSystemProps>(
  ({ particleCount, progress }, ref) => {
    const geometryRef = useRef<BufferGeometry>();
    const positionsRef = useRef<Float32Array>();
    const targetPositionsRef = useRef<Float32Array>();
    const velocitiesRef = useRef<Float32Array>();
    const sizesRef = useRef<Float32Array>();
    const alphasRef = useRef<Float32Array>();
    const materialRef = useRef<PointsMaterial>();
    const connectionLinesRef = useRef<Line2[]>([]);
    const initialized = useRef(false);

    useImperativeHandle(ref, () => ({
      update: (time: number, delta: number, progress: number) => {
        updateConvergence(time, delta, progress);
      },
    }), []);

    useFrame((state, delta) => {
      if (!initialized.current) {
        initializeConvergence();
        initialized.current = true;
      }
      updateConvergence(state.clock.getElapsedTime(), delta, progress);
    });

    function initializeConvergence() {
      geometryRef.current = new BufferGeometry();
      const count = Math.min(particleCount, 5000);
      positionsRef.current = new Float32Array(count * 3);
      targetPositionsRef.current = new Float32Array(count * 3);
      velocitiesRef.current = new Float32Array(count * 3);
      sizesRef.current = new Float32Array(count);
      alphasRef.current = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const radius = 50 + Math.random() * 150;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positionsRef.current[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positionsRef.current[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.5;
        positionsRef.current[i * 3 + 2] = radius * Math.cos(phi) - 200;

        const targetRadius = 5 + Math.random() * 15;
        const targetTheta = Math.random() * Math.PI * 2;
        const targetPhi = Math.acos(2 * Math.random() - 1);
        
        targetPositionsRef.current[i * 3] = targetRadius * Math.sin(targetPhi) * Math.cos(targetTheta);
        targetPositionsRef.current[i * 3 + 1] = targetRadius * Math.sin(targetPhi) * Math.sin(targetTheta);
        targetPositionsRef.current[i * 3 + 2] = targetRadius * Math.cos(targetPhi) - 200;

        velocitiesRef.current[i * 3] = 0;
        velocitiesRef.current[i * 3 + 1] = 0;
        velocitiesRef.current[i * 3 + 2] = 0;

        sizesRef.current[i] = 0.5 + Math.random() * 2;
        alphasRef.current[i] = 0.1 + Math.random() * 0.4;
      }

      geometryRef.current.setAttribute('position', new Float32BufferAttribute(positionsRef.current, 3));
      geometryRef.current.setAttribute('aSize', new Float32BufferAttribute(sizesRef.current, 1));
      geometryRef.current.setAttribute('aAlpha', new Float32BufferAttribute(alphasRef.current, 1));
    }

    function updateConvergence(time: number, delta: number, progress: number) {
      const positions = positionsRef.current!;
      const targets = targetPositionsRef.current!;
      const velocities = velocitiesRef.current!;
      const alphas = alphasRef.current!;
      const count = positions.length / 3;
      const easedProgress = progress * progress * (3 - 2 * progress);

      for (let i = 0; i < count; i++) {
        const dx = targets[i * 3] - positions[i * 3];
        const dy = targets[i * 3 + 1] - positions[i * 3 + 1];
        const dz = targets[i * 3 + 2] - positions[i * 3 + 2];
        
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist > 0.1) {
          const force = easedProgress * 0.02;
          velocities[i * 3] += dx * force;
          velocities[i * 3 + 1] += dy * force;
          velocities[i * 3 + 2] += dz * force;
        }
        
        velocities[i * 3] *= 0.95;
        velocities[i * 3 + 1] *= 0.95;
        velocities[i * 3 + 2] *= 0.95;
        
        positions[i * 3] += velocities[i * 3] * delta * 60;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * delta * 60;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * delta * 60;

        const pulse = Math.sin(time * 2 + i * 0.001) * 0.5 + 0.5;
        alphas[i] = (0.2 + 0.8 * pulse) * easedProgress;
      }

      geometryRef.current!.attributes.position.needsUpdate = true;
      geometryRef.current!.attributes.aAlpha.needsUpdate = true;
    }

    const material = useMemo(() => new PointsMaterial({
      color: new Color(colors.nodeColor),
      size: 2,
      transparent: true,
      opacity: 1,
      vertexColors: false,
      blending: AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }), [progress]);

    materialRef.current = material;

    return (
      <Group>
        <points geometry={geometryRef.current} material={material}>
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={{
              uTime: { value: 0 },
              uProgress: { value: progress },
            }}
          />
        </points>
        <ConvergenceCore progress={progress} />
      </Group>
    );
  }
);

ConvergenceSystem.displayName = 'ConvergenceSystem';

interface ConvergenceSystemAPI {
  update: (time: number, delta: number, progress: number) => void;
}

function ConvergenceCore({ progress }: { progress: number }) {
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      const r = Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 200;
    }
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(() => new PointsMaterial({
    color: new Color(colors.accent),
    size: 4,
    transparent: true,
    opacity: progress,
    blending: AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [progress]);

  return <points geometry={geometry} material={material} />;
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