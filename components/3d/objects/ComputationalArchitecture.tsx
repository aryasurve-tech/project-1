'use client';

import { Group, useFrame, useLoader, InstancedMesh } from '@react-three/fiber';
import { BoxGeometry, MeshStandardMaterial, Color, Vector3, Matrix4, Euler } from 'three';
import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { performanceConfig } from '@/constants/design';
import { colors } from '@/constants/design';

interface ComputationalArchitectureProps {
  structureCount: number;
  progress: number;
}

export const ComputationalArchitecture = forwardRef<ComputationalArchitectureAPI, ComputationalArchitectureProps>(
  ({ structureCount, progress }, ref) => {
    const geometries = useMemo(() => createGeometries(), []);
    const materials = useMemo(() => createMaterials(progress), [progress]);
    const matrices = useRef<Matrix4[]>([]);
    const scales = useRef<number[]>([]);
    const rotations = useRef<Euler[]>([]);
    const targetScales = useRef<number[]>([]);
    const targetRotations = useRef<Euler[]>([]);
    const initialized = useRef(false);

    const dummy = useRef(new THREE.Object3D());

    useImperativeHandle(ref, () => ({
      update: (time: number, delta: number, progress: number) => {
        updateArchitecture(time, delta, progress);
      },
    }), []);

    useFrame((state, delta) => {
      if (!initialized.current) {
        initializeStructures();
        initialized.current = true;
      }
      updateArchitecture(state.clock.getElapsedTime(), delta, progress);
    });

    function initializeStructures() {
      matrices.current = [];
      scales.current = [];
      rotations.current = [];
      targetScales.current = [];
      targetRotations.current = [];

      for (let i = 0; i < structureCount; i++) {
        const matrix = new Matrix4();
        const scale = 0.01;
        const rotation = new Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        const targetScale = 0.5 + Math.random() * 2;
        const targetRotation = new Euler(
          Math.random() * Math.PI * 0.5,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.5
        );

        const radius = 15 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi) - 20;

        dummy.current.position.set(x, y, z);
        dummy.current.scale.set(scale, scale, scale);
        dummy.current.rotation.copy(rotation);
        dummy.current.updateMatrix();
        
        matrices.current.push(dummy.current.matrix.clone());
        scales.current.push(scale);
        rotations.current.push(rotation);
        targetScales.current.push(targetScale);
        targetRotations.current.push(targetRotation);
      }
    }

    function updateArchitecture(time: number, delta: number, progress: number) {
      const easedProgress = easeInOutCubic(progress);
      
      for (let i = 0; i < structureCount; i++) {
        const currentScale = scales.current[i];
        const targetScale = targetScales.current[i] * easedProgress;
        scales.current[i] += (targetScale - currentScale) * delta * 2;
        
        const currentRot = rotations.current[i];
        const targetRot = targetRotations.current[i];
        currentRot.x += (targetRot.x - currentRot.x) * delta * 0.5;
        currentRot.y += (targetRot.y - currentRot.y) * delta * 0.5;
        currentRot.z += (targetRot.z - currentRot.z) * delta * 0.5;
        
        const slowRotation = time * 0.02 * (0.5 + Math.sin(i) * 0.5);
        currentRot.y += delta * 0.01 * (i % 3 + 1);
        
        dummy.current.position.setFromMatrixPosition(matrices.current[i]);
        dummy.current.scale.set(scales.current[i], scales.current[i], scales.current[i]);
        dummy.current.rotation.copy(currentRot);
        dummy.current.rotation.y += slowRotation * 0.1;
        dummy.current.updateMatrix();
        matrices.current[i].copy(dummy.current.matrix);
      }
    }

    return (
      <Group>
        <InstancedMesh
          args={[geometries[0], materials[0], structureCount]}
          instanceMatrix={matrices.current}
          instanceColor={null}
          frustumCulled={false}
        />
        <InstancedMesh
          args={[geometries[1], materials[1], structureCount * 0.3]}
          instanceMatrix={matrices.current}
          instanceColor={null}
          frustumCulled={false}
        />
      </Group>
    );
  }
);

ComputationalArchitecture.displayName = 'ComputationalArchitecture';

interface ComputationalArchitectureAPI {
  update: (time: number, delta: number, progress: number) => void;
}

function createGeometries() {
  const mainGeo = new BoxGeometry(1, 1, 1);
  const detailGeo = new BoxGeometry(0.3, 0.3, 0.3);
  return [mainGeo, detailGeo];
}

function createMaterials(progress: number) {
  const opacity = 0.05 + progress * 0.15;
  const mainMaterial = new MeshStandardMaterial({
    color: new Color(colors.structureColor),
    transparent: true,
    opacity,
    metalness: 0.3,
    roughness: 0.7,
    wireframe: false,
    side: THREE.DoubleSide,
  });
  
  const detailMaterial = new MeshStandardMaterial({
    color: new Color(colors.structureColor),
    transparent: true,
    opacity: opacity * 0.5,
    metalness: 0.5,
    roughness: 0.5,
    wireframe: true,
  });
  
  return [mainMaterial, detailMaterial];
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}