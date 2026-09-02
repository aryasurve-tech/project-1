"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleField } from "./objects/ParticleField";
import { Structures } from "./objects/Structures";
import { FlowLines } from "./objects/FlowLines";
import { NodeNetwork } from "./objects/NodeNetwork";
import { ClusterField } from "./objects/ClusterField";
import { PrecisionGrid } from "./objects/PrecisionGrid";
import { ProjectModules } from "./objects/ProjectModules";
import { zoneWeights } from "@/lib/zoneWeights";
import { useDeviceCategory } from "@/lib/experience";
import type { SectionKey } from "@/lib/experience";

export function ZoneObjects({ zoneKey }: { zoneKey: SectionKey }) {
  const device = useDeviceCategory();
  const q = qualityByDevice(device);

  switch (zoneKey) {
    case "hero":
      return (
        <group>
          <ParticleField count={q.particles} size={1.6} center={[0, 0, 0]} radiusMin={30} radiusMax={80} opacity={0.7} drift={0.08} />
          <Structures zone="hero" count={q.structures} layout="sphere" center={[0, 0, 0]} radius={50} size={[3.2, 3.2, 3.2]} opacity={0.4} spin={0.018} />
          <FlowLines zone="hero" count={q.lines} center={[0, 0, 0]} spread={55} opacity={0.4} />
        </group>
      );
    case "architecture":
      return (
        <group>
          <ParticleField count={q.structures} size={1} center={[0, 0, 0]} radiusMin={15} radiusMax={45} opacity={0.5} drift={0.05} />
          <Structures zone="architecture" count={q.structures} layout="layers" center={[0, 0, 0]} radius={35} size={[4.5, 1.2, 4.5]} opacity={0.5} spin={0.012} />
          <FlowLines zone="architecture" count={q.lines} center={[0, 0, 0]} spread={40} opacity={0.45} />
        </group>
      );
    case "engineering":
      return (
        <group>
          <Structures zone="engineering" count={q.structures} layout="grid" center={[0, 0, 0]} radius={26} size={[2.2, 2.2, 2.2]} opacity={0.55} spin={0.02} />
          <FlowLines zone="engineering" count={q.lines} center={[0, 0, 0]} spread={34} opacity={0.55} />
          <ParticleField count={q.lines} size={1.2} center={[0, 0, 0]} radiusMin={20} radiusMax={34} opacity={0.5} drift={0.05} />
        </group>
      );
    case "intelligence":
      return (
        <group>
          <NodeNetwork zone="intelligence" nodes={q.nodes} center={[0, 0, 0]} radius={26} shells={3} opacity={0.55} />
          <ParticleField count={q.particles} size={1.4} center={[0, 0, 0]} radiusMin={18} radiusMax={42} opacity={0.6} drift={0.12} />
          <FlowLines zone="intelligence" count={q.lines} center={[0, 0, 0]} spread={36} opacity={0.5} />
        </group>
      );
    case "scale":
      return (
        <group>
          <Structures zone="scale" count={q.structuresLarge} layout="layers" center={[0, 0, -20]} radius={140} size={[5, 5, 5]} opacity={0.35} spin={0.006} />
          <ParticleField count={q.particlesLarge} size={1.1} center={[0, 0, -20]} radiusMin={90} radiusMax={220} opacity={0.5} drift={0.04} />
        </group>
      );
    case "infrastructure":
      return (
        <group>
          <ClusterField zone="infrastructure" clusters={q.clusters} nodesPerCluster={9} center={[0, 0, 0]} extent={46} opacity={0.5} />
          <FlowLines zone="infrastructure" count={q.lines} center={[0, 0, 0]} spread={55} opacity={0.45} />
        </group>
      );
    case "work":
      return (
        <group>
          <ProjectModules
            modules={[
              [0, 0, 0],
              [-26, -8, -6],
              [26, -10, -2],
              [-20, 14, -10],
              [22, 12, -14],
              [6, -30, 10],
            ].map((position, index) => ({ index, position: position as [number, number, number], scale: 1 }))}
          />
          <ParticleField count={q.particles} size={1.2} center={[0, 0, 0]} radiusMin={34} radiusMax={52} opacity={0.4} drift={0.03} />
        </group>
      );
    case "philosophy":
      return (
        <group>
          <PrecisionGrid zone="philosophy" size={34} divisions={7} center={[0, 0, 0]} opacity={0.35} />
          <ParticleField count={300} size={1} center={[0, 0, 0]} radiusMin={30} radiusMax={60} opacity={0.4} drift={0.03} />
        </group>
      );
    case "cta":
      return (
        <group>
          <ParticleField
            zone="cta"
            weightKey="deep"
            count={q.particlesLarge}
            size={1.8}
            center={[0, 0, 0]}
            radiusMin={80}
            radiusMax={180}
            onSelection={[0, 0, 0]}
            opacity={0.8}
            drift={0.06}
          />
          <Structures zone="cta" count={20} layout="sphere" center={[0, 0, 0]} radius={6} size={[1.6, 1.6, 1.6]} opacity={0.5} spin={0.02} />
          <CoreGlow />
        </group>
      );
  }
}

function CoreGlow() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      const deep = zoneWeights.cta?.deep ?? 0;
      meshRef.current.scale.setScalar(0.6 + deep * 1.2 + Math.sin(t * 2) * 0.05 * deep);
    }
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} transparent opacity={0.9} wireframe />
    </mesh>
  );
}

function qualityByDevice(device: "mobile" | "tablet" | "desktop") {
  switch (device) {
    case "mobile":
      return { particles: 700, particlesLarge: 1300, structures: 40, structuresLarge: 80, lines: 60, nodes: 300, clusters: 10 };
    case "tablet":
      return { particles: 1600, particlesLarge: 3200, structures: 90, structuresLarge: 180, lines: 140, nodes: 700, clusters: 18 };
    default:
      return { particles: 3200, particlesLarge: 5600, structures: 160, structuresLarge: 340, lines: 260, nodes: 1200, clusters: 26 };
  }
}
