'use client';

import { Group, InstancedMesh, useFrame, BoxGeometry, MeshStandardMaterial, Color, Matrix4, Euler, Vector3 } from '@react-three/fiber';
import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { colors } from '@/constants/design';

interface ModularSystemProps {
  moduleCount: number;
  progress: number;
}

export const ModularSystem = forwardRef<ModularSystemAPI, ModularSystemProps>(
  ({ moduleCount, progress }, ref) => {
    const geometries = useMemo(() => createGeometries(), []);
    const materials = useMemo(() => createMaterials(progress), [progress]);
    const matrices = useRef<Matrix4[]>([]);
    const moduleData = useRef<ModuleData[]>([]);
    const initialized = useRef(false);
    const dummy = useRef(new THREE.Object3D());

    useImperativeHandle(ref, () => ({
      update: (time: number, delta: number, progress: number) => {
        updateModules(time, delta, progress);
      },
    }), []);

    useFrame((state, delta) => {
      if (!initialized.current) {
        initializeModules();
        initialized.current = true;
      }
      updateModules(state.clock.getElapsedTime(), delta, progress);
    });

    function initializeModules() {
      matrices.current = [];
      moduleData.current = [];

      const gridSize = Math.ceil(Math.sqrt(moduleCount));
      const spacing = 8;

      for (let i = 0; i < moduleCount; i++) {
        const x = (i % gridSize - gridSize / 2) * spacing;
        const y = (Math.floor(i / gridSize) % 3 - 1) * spacing * 1.5;
        const z = Math.floor(i / (gridSize * 3)) * spacing - 30;

        const matrix = new Matrix4();
        const scale = 0.01;
        const rotation = new Euler(0, 0, 0);
        const targetScale = 0.8 + Math.random() * 1.2;
        const targetRotation = new Euler(
          (Math.random() - 0.5) * 0.2,
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.2
        );
        const moduleType = Math.floor(Math.random() * 4);

        dummy.current.position.set(x, y, z);
        dummy.current.scale.set(scale, scale, scale);
        dummy.current.rotation.copy(rotation);
        dummy.current.updateMatrix();

        matrices.current.push(dummy.current.matrix.clone());
        moduleData.current.push({
          index: i,
          position: new Vector3(x, y, z),
          scale,
          rotation,
          targetScale,
          targetRotation,
          moduleType,
          connected: false,
          connectionProgress: 0,
          connections: [] as number[],
        });
      }

      createConnections();
    }

    function createConnections() {
      moduleData.current.forEach((module, i) => {
        const nearby = moduleData.current
          .map((m, j) => ({ module: m, dist: module.position.distanceTo(m.position), index: j }))
          .filter(d => d.dist > 0 && d.dist < 15)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 3);

        nearby.forEach(n => {
          if (!module.connections.includes(n.index)) {
            module.connections.push(n.index);
          }
        });
      });
    }

    function updateModules(time: number, delta: number, progress: number) {
      const easedProgress = easeInOutCubic(progress);
      
      moduleData.current.forEach((module, i) => {
        const currentScale = module.scale;
        const targetScale = module.targetScale * easedProgress;
        module.scale += (targetScale - currentScale) * delta * 3;
        
        module.rotation.x += (module.targetRotation.x - module.rotation.x) * delta * 2;
        module.rotation.y += (module.targetRotation.y - module.rotation.y) * delta * 2;
        module.rotation.z += (module.targetRotation.z - module.rotation.z) * delta * 2;
        
        module.rotation.y += delta * 0.02 * Math.sin(module.index);
        
        if (module.connected) {
          module.connectionProgress = Math.min(1, module.connectionProgress + delta * 0.5);
        } else if (easedProgress > 0.5 && Math.random() < 0.005) {
          module.connected = true;
        }

        dummy.current.position.copy(module.position);
        dummy.current.scale.set(module.scale, module.scale, module.scale);
        dummy.current.rotation.copy(module.rotation);
        dummy.current.updateMatrix();
        matrices.current[i].copy(dummy.current.matrix);
      });
    }

    return (
      <Group>
        <InstancedMesh
          args={[geometries[0], materials[0], moduleCount]}
          instanceMatrix={matrices.current}
          frustumCulled={false}
        />
        <InstancedMesh
          args={[geometries[1], materials[1], moduleCount * 2]}
          instanceMatrix={matrices.current}
          frustumCulled={false}
        />
        <ModuleConnections 
          modules={moduleData.current} 
          matrices={matrices.current}
          progress={progress}
        />
      </Group>
    );
  }
);

ModularSystem.displayName = 'ModularSystem';

interface ModuleData {
  index: number;
  position: Vector3;
  scale: number;
  rotation: Euler;
  targetScale: number;
  targetRotation: Euler;
  moduleType: number;
  connected: boolean;
  connectionProgress: number;
  connections: number[];
}

interface ModularSystemAPI {
  update: (time: number, delta: number, progress: number) => void;
}

function ModuleConnections({ modules, matrices, progress }: { modules: ModuleData[], matrices: Matrix4[], progress: number }) {
  return null;
}

function createGeometries() {
  const mainGeo = new BoxGeometry(3, 1.5, 3);
  const detailGeo = new BoxGeometry(1, 0.3, 1);
  return [mainGeo, detailGeo];
}

function createMaterials(progress: number) {
  const opacity = 0.1 + progress * 0.3;
  
  return [
    new MeshStandardMaterial({
      color: new Color(colors.structureColor),
      transparent: true,
      opacity,
      metalness: 0.4,
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
    new MeshStandardMaterial({
      color: new Color(colors.structureColor),
      transparent: true,
      opacity: opacity * 0.5,
      metalness: 0.6,
      roughness: 0.4,
      wireframe: true,
    }),
  ];
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}