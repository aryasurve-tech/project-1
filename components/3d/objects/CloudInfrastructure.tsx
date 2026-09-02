'use client';

import { Group, InstancedMesh, Line2, LineGeometry, LineMaterial } from '@react-three/fiber';
import { BoxGeometry, MeshStandardMaterial, Color, Matrix4, Euler, Vector3, AdditiveBlending } from 'three';
import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { colors } from '@/constants/design';

interface CloudInfrastructureProps {
  clusterCount: number;
  progress: number;
}

export const CloudInfrastructure = forwardRef<CloudInfrastructureAPI, CloudInfrastructureProps>(
  ({ clusterCount, progress }, ref) => {
    const geometries = useMemo(() => createGeometries(), []);
    const materials = useMemo(() => createMaterials(progress), [progress]);
    const lineMaterials = useMemo(() => createLineMaterials(progress), [progress]);
    
    const clusterMatrices = useRef<Matrix4[]>([]);
    const clusterData = useRef<ClusterData[]>([]);
    const connectionLines = useRef<Line2[]>([]);
    const initialized = useRef(false);
    const dummy = useRef(new THREE.Object3D());

    useImperativeHandle(ref, () => ({
      update: (time: number, delta: number, progress: number) => {
        updateInfrastructure(time, delta, progress);
      },
    }), []);

    useFrame((state, delta) => {
      if (!initialized.current) {
        initializeInfrastructure();
        initialized.current = true;
      }
      updateInfrastructure(state.clock.getElapsedTime(), delta, progress);
    });

    function initializeInfrastructure() {
      clusterMatrices.current = [];
      clusterData.current = [];
      connectionLines.current = [];

      const clustersPerRow = Math.ceil(Math.sqrt(clusterCount));
      const spacing = 25;

      for (let i = 0; i < clusterCount; i++) {
        const row = Math.floor(i / clustersPerRow);
        const col = i % clustersPerRow;
        const layer = Math.floor(i / (clustersPerRow * clustersPerRow));

        const x = (col - clustersPerRow / 2) * spacing;
        const y = (row - clustersPerRow / 2) * spacing * 0.5 + layer * 40;
        const z = layer * spacing * 2 - 150;

        const matrix = new Matrix4();
        const scale = 0.01;
        const rotation = new Euler(0, Math.random() * Math.PI * 2, 0);
        const targetScale = 1.5 + Math.random() * 2;
        const clusterType = Math.floor(Math.random() * 3);

        dummy.current.position.set(x, y, z);
        dummy.current.scale.set(scale, scale, scale);
        dummy.current.rotation.copy(rotation);
        dummy.current.updateMatrix();

        clusterMatrices.current.push(dummy.current.matrix.clone());
        clusterData.current.push({
          index: i,
          position: new Vector3(x, y, z),
          scale,
          rotation,
          targetScale,
          clusterType,
          nodes: createClusterNodes(clusterType),
          active: false,
          activationDelay: Math.random() * 2,
        });
      }

      createInterClusterConnections();
    }

    function createClusterNodes(type: number) {
      const nodes = [];
      const nodeCount = type === 0 ? 8 : type === 1 ? 12 : 16; // container, service, database
      
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 3 + Math.random() * 2;
        nodes.push({
          angle,
          radius,
          offsetY: (Math.random() - 0.5) * 2,
          phase: Math.random() * Math.PI * 2,
        });
      }
      return nodes;
    }

    function createInterClusterConnections() {
      clusterData.current.forEach((cluster, i) => {
        const nearby = clusterData.current
          .map((c, j) => ({ cluster: c, dist: cluster.position.distanceTo(c.position), index: j }))
          .filter(d => d.dist > 0 && d.dist < 50)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 4);

        nearby.forEach(n => {
          const geometry = new LineGeometry();
          const positions = [
            cluster.position.x, cluster.position.y, cluster.position.z,
            n.cluster.position.x, n.cluster.position.y, n.cluster.position.z,
          ];
          geometry.setPositions(positions);
          
          const material = lineMaterials[Math.floor(Math.random() * lineMaterials.length)];
          const line = new Line2(geometry, material);
          line.computeLineDistances();
          connectionLines.current.push(line);
        });
      });
    }

    function updateInfrastructure(time: number, delta: number, progress: number) {
      const easedProgress = easeInOutCubic(progress);
      
      clusterData.current.forEach((cluster, i) => {
        const delayedProgress = Math.max(0, easedProgress - cluster.activationDelay / 2);
        
        if (delayedProgress > 0 && !cluster.active) {
          cluster.active = true;
        }
        
        if (cluster.active) {
          const currentScale = cluster.scale;
          const targetScale = cluster.targetScale * Math.min(1, delayedProgress * 2);
          cluster.scale += (targetScale - currentScale) * delta * 3;
          
          cluster.rotation.y += delta * 0.01;
          
          dummy.current.position.copy(cluster.position);
          dummy.current.scale.set(cluster.scale, cluster.scale, cluster.scale);
          dummy.current.rotation.copy(cluster.rotation);
          dummy.current.updateMatrix();
          clusterMatrices.current[i].copy(dummy.current.matrix);
        }

        connectionLines.current.forEach((line, idx) => {
          const lineProgress = Math.min(1, easedProgress * 1.5);
          line.material.dashOffset = -time * 10 * lineProgress;
          line.material.opacity = 0.05 + 0.15 * lineProgress * Math.sin(time * 2 + idx) * 0.5 + 0.5;
        });
      });
    }

    return (
      <Group>
        <InstancedMesh
          args={[geometries[0], materials[0], clusterCount]}
          instanceMatrix={clusterMatrices.current}
          frustumCulled={false}
        />
        <InstancedMesh
          args={[geometries[1], materials[1], clusterCount * 4]}
          instanceMatrix={clusterMatrices.current}
          frustumCulled={false}
        />
        <Group>
          {connectionLines.current.map((line, i) => (
            <primitive key={i} object={line} />
          ))}
        </Group>
      </Group>
    );
  }
);

CloudInfrastructure.displayName = 'CloudInfrastructure';

interface ClusterData {
  index: number;
  position: Vector3;
  scale: number;
  rotation: Euler;
  targetScale: number;
  clusterType: number;
  nodes: ClusterNode[];
  active: boolean;
  activationDelay: number;
}

interface ClusterNode {
  angle: number;
  radius: number;
  offsetY: number;
  phase: number;
}

interface CloudInfrastructureAPI {
  update: (time: number, delta: number, progress: number) => void;
}

function createGeometries() {
  return [
    new BoxGeometry(5, 2, 5),
    new BoxGeometry(1, 0.5, 1),
  ];
}

function createMaterials(progress: number) {
  const opacity = 0.1 + progress * 0.25;
  
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
      opacity: opacity * 0.4,
      metalness: 0.6,
      roughness: 0.4,
      wireframe: true,
    }),
  ];
}

function createLineMaterials(progress: number) {
  const opacity = 0.02 + progress * 0.1;
  
  return [
    new LineMaterial({
      color: new Color(colors.pathwayColor),
      linewidth: 0.3,
      dashed: true,
      dashSize: 5,
      gapSize: 10,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
    new LineMaterial({
      color: new Color(colors.pathwayColorActive),
      linewidth: 0.8,
      dashed: true,
      dashSize: 8,
      gapSize: 16,
      transparent: true,
      opacity: opacity * 2,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  ];
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}