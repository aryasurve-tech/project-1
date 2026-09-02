'use client';

import { Group, InstancedMesh, Points, BufferGeometry, PointsMaterial, Float32BufferAttribute } from '@react-three/fiber';
import { BoxGeometry, MeshStandardMaterial, Color, Matrix4, Euler, Vector3, AdditiveBlending } from 'three';
import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { colors } from '@/constants/design';

interface MassiveScaleProps {
  nodeCount: number;
  structureCount: number;
  progress: number;
}

export const MassiveScale = forwardRef<MassiveScaleAPI, MassiveScaleProps>(
  ({ nodeCount, structureCount, progress }, ref) => {
    const structureGeos = useMemo(() => createStructureGeometries(), []);
    const structureMats = useMemo(() => createStructureMaterials(progress), [progress]);
    const particleGeo = useMemo(() => createParticleGeometry(nodeCount), [nodeCount]);
    const particleMat = useMemo(() => createParticleMaterial(progress), [progress]);
    
    const structureMatrices = useRef<Matrix4[]>([]);
    const structureData = useRef<StructureData[]>([]);
    const initialized = useRef(false);
    const dummy = useRef(new THREE.Object3D());

    useImperativeHandle(ref, () => ({
      update: (time: number, delta: number, progress: number) => {
        updateScale(time, delta, progress);
      },
    }), []);

    useFrame((state, delta) => {
      if (!initialized.current) {
        initializeScale();
        initialized.current = true;
      }
      updateScale(state.clock.getElapsedTime(), delta, progress);
    });

    function initializeScale() {
      structureMatrices.current = [];
      structureData.current = [];

      const layers = 5;
      const perLayer = Math.ceil(structureCount / layers);

      for (let layer = 0; layer < layers; layer++) {
        for (let i = 0; i < perLayer; i++) {
          const index = layer * perLayer + i;
          if (index >= structureCount) break;

          const radius = 20 + layer * 40 + Math.random() * 20;
          const theta = (i / perLayer) * Math.PI * 2 + Math.random() * 0.5;
          const phi = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
          
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta) * 0.3;
          const z = radius * Math.cos(phi) - layer * 30 - 80;

          const matrix = new Matrix4();
          const scale = 0.01;
          const rotation = new Euler(
            Math.random() * Math.PI * 0.5,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 0.5
          );
          const targetScale = 1 + Math.random() * 3;
          const targetRotation = new Euler(0, Math.random() * Math.PI * 2, 0);
          const layerIndex = layer;

          dummy.current.position.set(x, y, z);
          dummy.current.scale.set(scale, scale, scale);
          dummy.current.rotation.copy(rotation);
          dummy.current.updateMatrix();

          structureMatrices.current.push(dummy.current.matrix.clone());
          structureData.current.push({
            index,
            position: new Vector3(x, y, z),
            scale,
            rotation,
            targetScale,
            targetRotation,
            layer: layerIndex,
            delay: layer * 0.15 + Math.random() * 0.1,
          });
        }
      }
    }

    function updateScale(time: number, delta: number, progress: number) {
      const easedProgress = easeInOutCubic(progress);
      
      structureData.current.forEach((structure, i) => {
        const delayedProgress = Math.max(0, easedProgress - structure.delay) / (1 - structure.delay);
        const clampedProgress = Math.min(1, Math.max(0, delayedProgress));
        
        const currentScale = structure.scale;
        const targetScale = structure.targetScale * clampedProgress;
        structure.scale += (targetScale - currentScale) * delta * 2;
        
        structure.rotation.y += (structure.targetRotation.y - structure.rotation.y) * delta * 1;
        structure.rotation.y += delta * 0.005 * (structure.layer + 1);
        
        dummy.current.position.copy(structure.position);
        dummy.current.scale.set(structure.scale, structure.scale, structure.scale);
        dummy.current.rotation.copy(structure.rotation);
        dummy.current.updateMatrix();
        structureMatrices.current[i].copy(dummy.current.matrix);
      });
    }

    return (
      <Group>
        <InstancedMesh
          args={[structureGeos[0], structureMats[0], structureCount]}
          instanceMatrix={structureMatrices.current}
          frustumCulled={false}
        />
        <InstancedMesh
          args={[structureGeos[1], structureMats[1], structureCount * 2]}
          instanceMatrix={structureMatrices.current}
          frustumCulled={false}
        />
        <Points
          geometry={particleGeo}
          material={particleMat}
        />
      </Group>
    );
  }
);

MassiveScale.displayName = 'MassiveScale';

interface StructureData {
  index: number;
  position: Vector3;
  scale: number;
  rotation: Euler;
  targetScale: number;
  targetRotation: Euler;
  layer: number;
  delay: number;
}

interface MassiveScaleAPI {
  update: (time: number, delta: number, progress: number) => void;
}

function createStructureGeometries() {
  return [
    new BoxGeometry(4, 4, 4),
    new BoxGeometry(1.5, 1.5, 1.5),
  ];
}

function createStructureMaterials(progress: number) {
  const opacity = 0.05 + progress * 0.2;
  
  return [
    new MeshStandardMaterial({
      color: new Color(colors.structureColor),
      transparent: true,
      opacity,
      metalness: 0.3,
      roughness: 0.7,
      side: THREE.DoubleSide,
    }),
    new MeshStandardMaterial({
      color: new Color(colors.structureColor),
      transparent: true,
      opacity: opacity * 0.4,
      metalness: 0.5,
      roughness: 0.5,
      wireframe: true,
    }),
  ];
}

function createParticleGeometry(count: number) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const radius = 30 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.5;
    positions[i * 3 + 2] = radius * Math.cos(phi) - 100;

    sizes[i] = 0.5 + Math.random() * 2;
    alphas[i] = 0.05 + Math.random() * 0.15;
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('aAlpha', new Float32BufferAttribute(alphas, 1));

  return geometry;
}

function createParticleMaterial(progress: number) {
  return new PointsMaterial({
    color: new Color(colors.nodeColor),
    size: 1,
    transparent: true,
    opacity: 1,
    vertexColors: false,
    blending: AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}