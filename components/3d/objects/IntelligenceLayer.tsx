'use client';

import { Group, Points, BufferGeometry, PointsMaterial, Float32BufferAttribute, Line2, LineGeometry, LineMaterial } from '@react-three/fiber';
import { Vector3, Color, AdditiveBlending, Matrix4 } from 'three';
import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { colors } from '@/constants/design';

interface IntelligenceLayerProps {
  nodeCount: number;
  progress: number;
}

export const IntelligenceLayer = forwardRef<IntelligenceLayerAPI, IntelligenceLayerProps>(
  ({ nodeCount, progress }, ref) => {
    const particlesRef = useRef<Points>();
    const geometryRef = useRef<BufferGeometry>();
    const positionsRef = useRef<Float32Array>();
    const velocitiesRef = useRef<Float32Array>();
    const intensitiesRef = useRef<Float32Array>();
    const connectionsRef = useRef<Connection[]>([]);
    const connectionLinesRef = useRef<Line2[]>([]);
    const initialized = useRef(false);
    const materialRef = useRef<PointsMaterial>();

    useImperativeHandle(ref, () => ({
      update: (time: number, delta: number, progress: number) => {
        updateIntelligence(time, delta, progress);
      },
    }), []);

    useFrame((state, delta) => {
      if (!initialized.current) {
        initializeIntelligence();
        initialized.current = true;
      }
      updateIntelligence(state.clock.getElapsedTime(), delta, progress);
    });

    function initializeIntelligence() {
      geometryRef.current = new BufferGeometry();
      const count = Math.min(nodeCount, 2000);
      positionsRef.current = new Float32Array(count * 3);
      velocitiesRef.current = new Float32Array(count * 3);
      intensitiesRef.current = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const radius = 15 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positionsRef.current[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positionsRef.current[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positionsRef.current[i * 3 + 2] = radius * Math.cos(phi) - 40;

        velocitiesRef.current[i * 3] = (Math.random() - 0.5) * 0.2;
        velocitiesRef.current[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
        velocitiesRef.current[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

        intensitiesRef.current[i] = 0.1 + Math.random() * 0.9;
      }

      geometryRef.current.setAttribute('position', new Float32BufferAttribute(positionsRef.current, 3));
      geometryRef.current.setAttribute('aIntensity', new Float32BufferAttribute(intensitiesRef.current, 1));

      createConnections(count);
    }

    function createConnections(count: number) {
      connectionsRef.current = [];
      connectionLinesRef.current = [];

      for (let i = 0; i < count * 0.1; i++) {
        const a = Math.floor(Math.random() * count);
        const b = Math.floor(Math.random() * count);
        if (a === b) continue;
        
        const dist = Math.sqrt(
          Math.pow(positionsRef.current![a * 3] - positionsRef.current![b * 3], 2) +
          Math.pow(positionsRef.current![a * 3 + 1] - positionsRef.current![b * 3 + 1], 2) +
          Math.pow(positionsRef.current![a * 3 + 2] - positionsRef.current![b * 3 + 2], 2)
        );
        
        if (dist < 20) {
          connectionsRef.current.push({ a, b, strength: 0, targetStrength: 0, phase: Math.random() * Math.PI * 2 });
        }
      }
    }

    function updateIntelligence(time: number, delta: number, progress: number) {
      const positions = positionsRef.current!;
      const velocities = velocitiesRef.current!;
      const intensities = intensitiesRef.current!;
      const count = positions.length / 3;
      const easedProgress = progress * progress * (3 - 2 * progress);

      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3] * delta * 30 * easedProgress;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * delta * 30 * easedProgress;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * delta * 30 * easedProgress;

        const dist = Math.sqrt(
          positions[i * 3] ** 2 + 
          positions[i * 3 + 1] ** 2 + 
          (positions[i * 3 + 2] + 40) ** 2
        );
        
        if (dist > 70) {
          const radius = 15 + Math.random() * 30;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = radius * Math.cos(phi) - 40;
        }

        const pulse = Math.sin(time * 3 + i * 0.01) * 0.5 + 0.5;
        intensities[i] = (0.1 + 0.9 * pulse) * easedProgress;
      }

      geometryRef.current!.attributes.position.needsUpdate = true;
      geometryRef.current!.attributes.aIntensity.needsUpdate = true;

      updateConnections(time, delta, easedProgress);
    }

    function updateConnections(time: number, delta: number, progress: number) {
      connectionsRef.current.forEach(conn => {
        conn.targetStrength = Math.sin(time * 0.5 + conn.phase) * 0.5 + 0.5;
        conn.strength += (conn.targetStrength * progress - conn.strength) * delta * 2;
      });
    }

    const material = useMemo(() => new PointsMaterial({
      color: new Color(colors.dataSignalColor),
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
      </Group>
    );
  }
);

IntelligenceLayer.displayName = 'IntelligenceLayer';

interface IntelligenceLayerAPI {
  update: (time: number, delta: number, progress: number) => void;
}

interface Connection {
  a: number;
  b: number;
  strength: number;
  targetStrength: number;
  phase: number;
}

const vertexShader = `
  attribute float aIntensity;
  varying float vIntensity;
  uniform float uTime;
  uniform float uProgress;
  
  void main() {
    vIntensity = aIntensity * uProgress;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 2.0 * (300.0 / -mvPosition.z) * vIntensity * uProgress;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vIntensity;
  uniform float uProgress;
  
  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.1, dist) * vIntensity * uProgress;
    vec3 color = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 1.0, 1.0), vIntensity);
    gl_FragColor = vec4(color, alpha);
  }
`;

function shaderMaterial({ vertexShader, fragmentShader, uniforms }: any) {
  return null;
}