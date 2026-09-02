'use client';

import { useRef, useMemo } from 'react';
import { resolveZoneWeight } from '@/lib/zoneWeights';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ClusterFieldProps {
  zone?: string;
  weightKey?: 'enter' | 'deep';
  clusters?: number;
  nodesPerCluster?: number;
  progress?: number;
  center?: [number, number, number];
  extent?: number;
  opacity?: number;
}

interface Cluster {
  pos: THREE.Vector3;
  scale: number;
  delay: number;
  rotSpeed: number;
  nodes: THREE.Vector3[];
}

/**
 * Abstract cloud-infrastructure field: clusters of container-like cells
 * interconnected by data lines. Reads as distributed systems / microservices.
 */
export function ClusterField({
  clusters = 24,
  nodesPerCluster = 9,
  zone,
  weightKey,
  progress = 0,
  center = [0, 0, 0],
  extent = 60,
  opacity = 0.2,
}: ClusterFieldProps) {
  const cellRef = useRef<THREE.InstancedMesh>(null);
  const linkRef = useRef<THREE.LineSegments>(null);

  const { clusterList, cellGeometry, cellMaterial, linkGeometry, linkMaterial } = useMemo(() => {
    const rng = randomGen(7);
    const list: Cluster[] = [];
    const cellPositions: number[] = [];
    const cellScales: number[] = [];

    for (let c = 0; c < clusters; c++) {
      const pos = new THREE.Vector3(
        center[0] + (rng() - 0.5) * extent * 2,
        center[1] + (rng() - 0.5) * extent * 0.8,
        center[2] + (rng() - 0.5) * extent * 1.4
      );
      const nodes: THREE.Vector3[] = [];
      for (let n = 0; n < nodesPerCluster; n++) {
        const offset = new THREE.Vector3(
          (rng() - 0.5) * 7,
          (rng() - 0.5) * 7,
          (rng() - 0.5) * 7
        );
        nodes.push(pos.clone().add(offset));
        cellPositions.push(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z);
        cellScales.push(1.2 + rng() * 2);
      }
      list.push({ pos, scale: 1.4 + rng() * 1.6, delay: rng(), rotSpeed: 0.4 + rng(), nodes });
    }

    const cellGeometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const cellMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.3,
      metalness: 0.8,
      roughness: 0.3,
      depthWrite: true,
      wireframe: false,
    });

    // Inter-cluster links (spanning tree on cluster graph).
    const linkPositions: number[] = [];
    for (let c = 1; c < clusters; c++) {
      const a = list[c];
      const b = list[c - 1];
      linkPositions.push(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z);
      if (c > 2) {
        const d = list[c - 2];
        linkPositions.push(a.pos.x, a.pos.y, a.pos.z, d.pos.x, d.pos.y, d.pos.z);
      }
    }

    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3));
    const linkMaterial = new THREE.LineBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { clusterList: list, cellGeometry, cellMaterial, linkGeometry, linkMaterial };
  }, [clusters, nodesPerCluster, center, extent]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const p = Math.min(1, Math.max(0, resolveZoneWeight(zone, weightKey, progress)));
    const mesh = cellRef.current;
    if (mesh) {
      const total = clusters * nodesPerCluster;
      for (let i = 0; i < total; i++) {
        const c = Math.floor(i / nodesPerCluster);
        const n = i % nodesPerCluster;
        const cl = clusterList[c];
        if (!cl) continue;
        const nodePos = cl.nodes[n];
        const assemble = Math.min(1, Math.max(0, (p - cl.delay * 0.5) * 3));
        const s = 0.8 * cl.scale * assemble;
        dummy.position.copy(nodePos);
        dummy.position.x += Math.sin(time * 0.4 + i) * 0.3 * assemble;
        dummy.position.y += Math.cos(time * 0.35 + i * 1.3) * 0.3 * assemble;
        dummy.scale.set(s, s, s);
        dummy.rotation.set(time * 0.05 + n, time * 0.07 + c, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }

    cellMaterial.opacity = opacity * (0.5 + 0.5 * p);
    linkMaterial.opacity = 0.1 + 0.25 * p;
    if (linkRef.current) linkRef.current.rotation.y = time * 0.01 * p;
  });

  return (
    <group>
      <instancedMesh
        ref={cellRef}
        args={[cellGeometry, cellMaterial, clusters * nodesPerCluster]}
        frustumCulled={false}
      />
      <lineSegments ref={linkRef} geometry={linkGeometry} material={linkMaterial} />
    </group>
  );
}

function randomGen(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export {};