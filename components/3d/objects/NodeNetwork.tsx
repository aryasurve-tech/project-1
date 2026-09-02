'use client';

import { useRef, useMemo } from 'react';
import { resolveZoneWeight } from '@/lib/zoneWeights';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NodeNetworkProps {
  zone?: string;
  weightKey?: 'enter' | 'deep';
  nodes?: number;
  progress?: number;
  center?: [number, number, number];
  radius?: number;
  shells?: number;
  pulseColor?: string;
  opacity?: number;
}

interface Node {
  pos: THREE.Vector3;
  shell: number;
}

/**
 * Structured node network: concentric shells of nodes connected by ordered
 * links. Data pulses travel along the links (shader-driven flow), conveying
 * an integrated computational intelligence layer.
 */
export function NodeNetwork({
  nodes = 400,
  progress = 0,
  zone,
  weightKey,
  center = [0, 0, 0],
  radius = 30,
  shells = 3,
  pulseColor = '#ffffff',
  opacity = 0.6,
}: NodeNetworkProps) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const initialized = useRef(false);

  const perShell = Math.ceil(nodes / shells);

  const { lineGeometry, pointsGeometry, lineMaterial, pointsMaterial } = useMemo(() => {
    const nodeList: Node[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let s = 0; s < shells; s++) {
      const n = perShell;
      const rr = radius * (0.35 + (s / (shells - 1 || 1)) * 0.65);
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1 || 1)) * 2;
        const rad = Math.sqrt(1 - y * y);
        const theta = golden * i;
        const x = Math.cos(theta) * rad;
        const z = Math.sin(theta) * rad;
        nodeList.push({
          pos: new THREE.Vector3(center[0] + x * rr, center[1] + y * rr, center[2] + z * rr),
          shell: s,
        });
      }
    }

    // Build ordered edge rings per shell + radial spokes to inner shells.
    const segments: [number, number][] = [];
    let idx = 0;
    for (let s = 0; s < shells; s++) {
      const first = idx;
      for (let i = 0; i < perShell - 1; i++) {
        segments.push([first + i, first + i + 1]);
      }
      segments.push([first + perShell - 1, first]);
      idx += perShell;
    }
    for (let s = 1; s < shells; s++) {
      const outer = s * perShell;
      const inner = (s - 1) * perShell;
      for (let i = 0; i < perShell; i += 7) {
        segments.push([outer + i, inner + (i * 5) % perShell]);
      }
    }

    // Line geometry with spent-distance attribute for flow pulses.
    const linePositions: number[] = [];
    const flow: number[] = [];
    for (const [a, b] of segments) {
      const na = nodeList[a];
      const nb = nodeList[b];
      const mid = na.pos.clone().add(nb.pos).multiplyScalar(0.5);
      const arr = (v: THREE.Vector3) => [
        v.x + (mid.x - v.x) * 0.02,
        v.y + (mid.y - v.y) * 0.02,
        v.z + (mid.z - v.z) * 0.02,
      ];
      linePositions.push(...arr(na.pos), ...arr(nb.pos));
      flow.push(0, 1);
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('aFlow', new THREE.Float32BufferAttribute(flow, 1));

    const lineMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(pulseColor) },
        uOpacity: { value: 1 },
        uSpeed: { value: 0.3 },
      },
      vertexShader: flowVertexShader,
      fragmentShader: flowFragmentShader,
    });

    const pointPositions = nodeList.map((n) => [n.pos.x, n.pos.y, n.pos.z]).flat();
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(pulseColor),
      size: 1.6,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { lineGeometry, pointsGeometry, lineMaterial, pointsMaterial };
  }, [perShell, shells, center, radius, pulseColor]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const p = Math.min(1, Math.max(0, resolveZoneWeight(zone, weightKey, progress)));

    lineMaterial.uniforms.uTime.value = elapsed;
    lineMaterial.uniforms.uOpacity.value = opacity * p;
    pointsMaterial.opacity = opacity * 0.8 * p;

    lineMaterial.uniforms.uSpeed.value = 0.25 + 0.15 * p;
    materialRef.current = lineMaterial;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = elapsed * 0.02 * p;
    }
    if (lineRef.current) {
      lineRef.current.rotation.y = elapsed * 0.02 * p;
    }
  });

  return (
    <group>
      <lineSegments ref={lineRef} geometry={lineGeometry} material={lineMaterial} />
      <points ref={pointsRef} geometry={pointsGeometry} material={pointsMaterial} />
    </group>
  );
}

const flowVertexShader = `
  attribute float aFlow;
  varying float vFlow;
  void main() {
    vFlow = aFlow;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const flowFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uSpeed;
  varying float vFlow;

  void main() {
    float wave = fract(vFlow * 12.0 - uTime * uSpeed * 3.0);
    float pulse = smoothstep(1.0, 0.55, wave) * 0.7 + smoothstep(1.0, 0.7, wave) * 0.3;
    float base = 0.16;
    float alpha = (base + pulse * 0.9) * uOpacity;
    gl_FragColor = vec4(uColor * (0.4 + 0.6 * pulse), alpha);
  }
`;