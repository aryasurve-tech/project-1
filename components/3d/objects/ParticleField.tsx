'use client';

import { useMemo, useRef, useEffect } from 'react';
import { resolveZoneWeight } from '@/lib/zoneWeights';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  zone?: string;
  weightKey?: 'enter' | 'deep';
  count: number;
  size?: number;
  color?: string;
  opacity?: number;
  center?: [number, number, number];
  radiusMin?: number;
  radiusMax?: number;
  onSelection?: [number, number, number];
  progress?: number;
  drift?: number;
  convergence?: number;
}

/**
 * Generic shader-based point field. Supports slow drift, per-particle size/alpha
 * and optional convergence toward a core (used by the final CTA).
 */
export function ParticleField({
  zone,
  weightKey,
  count,
  size = 2,
  color = '#ffffff',
  opacity = 1,
  center = [0, 0, 0],
  radiusMin = 10,
  radiusMax = 60,
  onSelection,
  progress = 0,
  drift = 0.1,
  convergence = 0,
}: ParticleFieldProps) {
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const basePositions = useRef<Float32Array | null>(null);
  const targetPositions = useRef<Float32Array | null>(null);
  const sizes = useRef<Float32Array | null>(null);
  const alphas = useRef<Float32Array | null>(null);
  const seeds = useRef<Float32Array | null>(null);
  const initialised = useRef(false);

  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const sizeVals = new Float32Array(count);
    const alphaVals = new Float32Array(count);
    const seedVals = new Float32Array(count);
    const target = onSelection ? new THREE.Vector3(...onSelection) : new THREE.Vector3(...center);

    for (let i = 0; i < count; i++) {
      seedVals[i] = Math.random() * Math.PI * 2;

      const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = center[0] + radius * Math.sin(phi) * Math.cos(theta);
      const y = center[1] + radius * Math.sin(phi) * Math.sin(theta);
      const z = center[2] + radius * Math.cos(phi);

      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const tr = 0.5 + Math.pow(Math.random(), 2) * 6;
      const tTheta = Math.random() * Math.PI * 2;
      const tPhi = Math.acos(2 * Math.random() - 1);
      targets[i * 3] = target.x + tr * Math.sin(tPhi) * Math.cos(tTheta);
      targets[i * 3 + 1] = target.y + tr * Math.sin(tPhi) * Math.sin(tTheta);
      targets[i * 3 + 2] = target.z + tr * Math.cos(tPhi);

      sizeVals[i] = 0.4 + Math.random() * 1.6;
      alphaVals[i] = 0.3 + Math.random() * 0.7;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizeVals, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphaVals, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 1 },
        uSize: { value: size },
        uGlow: { value: 1 },
      },
      vertexShader: gpuVertexShader,
      fragmentShader: gpuFragmentShader,
    });

    basePositions.current = base;
    targetPositions.current = targets;
    sizes.current = sizeVals;
    alphas.current = alphaVals;
    seeds.current = seedVals;

    return { geometry, material };
  }, [count, size, color, center, radiusMin, radiusMax, onSelection, progress]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const resolvedP = resolveZoneWeight(zone, weightKey, progress);
    const positions = geometry.attributes.position.array as Float32Array;
    const base = basePositions.current!;
    const targets = targetPositions.current!;
    const p = state.clock.elapsedTime;
    const converged = Math.min(1, Math.max(0, zone ? resolvedP : convergence));

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const seed = seeds.current![i];
      const speed = drift * (0.4 + 0.6 * Math.abs(Math.sin(seed)));

      const px = base[i3] + Math.sin(seed * 13.7 + elapsed * speed) * 2 * drift;
      const py = base[i3 + 1] + Math.cos(seed * 7.3 + elapsed * speed * 1.3) * 2 * drift;
      const pz = base[i3 + 2] + Math.sin(seed * 3.1 + elapsed * speed * 0.7) * 2 * drift;

      positions[i3] = THREE.MathUtils.lerp(px, targets[i3], converged);
      positions[i3 + 1] = THREE.MathUtils.lerp(py, targets[i3 + 1], converged);
      positions[i3 + 2] = THREE.MathUtils.lerp(pz, targets[i3 + 2], converged);
    }

    geometry.attributes.position.needsUpdate = true;
    material.uniforms.uTime.value = elapsed;
    material.uniforms.uOpacity.value = opacity * (0.6 + 0.4 * Math.abs(Math.sin(elapsed * 0.3)));
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

const gpuVertexShader = `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  uniform float uTime;
  uniform float uSize;
  uniform float uGlow;

  void main() {
    vAlpha = aAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float pointSize = uSize * aSize * uGlow * (300.0 / max(1.0, -mvPosition.z));
    gl_PointSize = pointSize;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const gpuFragmentShader = `
  varying float vAlpha;
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.15, 0.0, d);
    float alpha = (soft * 0.6 + core * 0.9) * vAlpha * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;