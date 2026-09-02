'use client';

import { Group, useFrame, Line2, LineGeometry, LineMaterial } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, Vector3, Color } from 'three';
import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { colors } from '@/constants/design';

interface DataPathwaysProps {
  count: number;
  progress: number;
}

export const DataPathways = forwardRef<DataPathwaysAPI, DataPathwaysProps>(
  ({ count, progress }, ref) => {
    const linesRef = useRef<Line2[]>([]);
    const pathwaysRef = useRef<PathwayData[]>([]);
    const initialized = useRef(false);
    const materials = useMemo(() => createMaterials(progress), [progress]);

    useImperativeHandle(ref, () => ({
      update: (time: number, delta: number, progress: number) => {
        updatePathways(time, delta, progress);
      },
    }), []);

    useFrame((state, delta) => {
      if (!initialized.current) {
        initializePathways();
        initialized.current = true;
      }
      updatePathways(state.clock.getElapsedTime(), delta, progress);
    });

    function initializePathways() {
      pathwaysRef.current = [];
      linesRef.current = [];

      for (let i = 0; i < count; i++) {
        const pathway = createPathway();
        pathwaysRef.current.push(pathway);
      }
    }

    function createPathway(): PathwayData {
      const points = [];
      const numPoints = 10 + Math.floor(Math.random() * 20);
      const start = new Vector3(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 80 - 20
      );
      
      let current = start.clone();
      points.push(current.clone());

      for (let j = 1; j < numPoints; j++) {
        const direction = new Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize();
        
        const step = 2 + Math.random() * 5;
        current.addScaledVector(direction, step);
        points.push(current.clone());
      }

      const geometry = new LineGeometry();
      geometry.setPositions(points.flatMap(p => [p.x, p.y, p.z]));
      
      const material = materials[Math.floor(Math.random() * materials.length)];
      const line = new Line2(geometry, material);
      line.computeLineDistances();
      
      return {
        line,
        points,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        progress: 0,
        active: Math.random() > 0.7,
      };
    }

    function updatePathways(time: number, delta: number, progress: number) {
      const easedProgress = progress * progress * (3 - 2 * progress);
      
      pathwaysRef.current.forEach((pathway, i) => {
        if (!pathway.active && Math.random() < 0.001 * easedProgress) {
          pathway.active = true;
          pathway.progress = 0;
        }
        
        if (pathway.active) {
          pathway.progress += delta * pathway.speed * easedProgress;
          
          if (pathway.progress > 1) {
            pathway.active = false;
            pathway.progress = 0;
            pathway.phase = Math.random() * Math.PI * 2;
          }
          
          const dashOffset = -pathway.progress * 100;
          pathway.line.material.dashOffset = dashOffset;
          pathway.line.material.opacity = Math.sin(pathway.progress * Math.PI) * 0.4 * easedProgress;
        } else {
          pathway.line.material.opacity = 0.05 * easedProgress;
        }
        
        pathway.line.rotation.y += delta * 0.005 * (i % 3 + 1);
      });
    }

    return (
      <Group>
        {linesRef.current.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
      </Group>
    );
  }
);

DataPathways.displayName = 'DataPathways';

interface PathwayData {
  line: Line2;
  points: Vector3[];
  phase: number;
  speed: number;
  progress: number;
  active: boolean;
}

interface DataPathwaysAPI {
  update: (time: number, delta: number, progress: number) => void;
}

function createMaterials(progress: number) {
  const baseOpacity = 0.05 + progress * 0.2;
  
  return [
    new LineMaterial({
      color: new Color(colors.pathwayColor),
      linewidth: 0.5,
      dashed: true,
      dashSize: 2,
      gapSize: 4,
      transparent: true,
      opacity: baseOpacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    new LineMaterial({
      color: new Color(colors.pathwayColorActive),
      linewidth: 1,
      dashed: true,
      dashSize: 3,
      gapSize: 6,
      transparent: true,
      opacity: baseOpacity * 2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    new LineMaterial({
      color: new Color(colors.dataSignalColor),
      linewidth: 0.3,
      dashed: true,
      dashSize: 1,
      gapSize: 3,
      transparent: true,
      opacity: baseOpacity * 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  ];
}