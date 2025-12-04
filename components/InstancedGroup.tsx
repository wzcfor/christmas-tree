import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ParticleData } from '../types';

interface InstancedGroupProps {
  data: ParticleData[];
  isTreeMode: boolean;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  color?: string;
  speed?: number; // Speed of transition
}

const InstancedGroup: React.FC<InstancedGroupProps> = ({ 
  data, 
  isTreeMode, 
  geometry, 
  material,
  color,
  speed = 0.1 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize positions randomly to avoid everything starting at 0,0,0
  useLayoutEffect(() => {
    if (meshRef.current) {
      data.forEach((particle, i) => {
        dummy.position.copy(particle.scatterPos);
        dummy.rotation.copy(particle.rotation);
        dummy.scale.setScalar(particle.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, dummy]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Damp factor for smooth transition (Magnetic spring effect)
    // We adjust speed based on delta time to keep it framerate independent
    const damping = THREE.MathUtils.damp(0, 1, 4 * speed, delta); 

    // We iterate through all instances and lerp their positions
    // This is performant enough for < 10k instances in a loop
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (let i = 0; i < data.length; i++) {
      const particle = data[i];

      // Get current instance state
      meshRef.current.getMatrixAt(i, matrix);
      matrix.decompose(position, quaternion, scale);

      // Determine Target
      const target = isTreeMode ? particle.treePos : particle.scatterPos;

      // Interpolate Position
      // We use a simple lerp here, but since it runs every frame towards the target, 
      // it creates an asymptotic ease-out curve.
      position.lerp(target, 0.05 + (Math.random() * 0.02)); // Add slight randomness to speed for organic feel

      // Reconstruct Matrix
      dummy.position.copy(position);
      // We keep original rotation/scale for now, maybe rotate slowly later
      dummy.rotation.copy(particle.rotation);
      
      // Gentle rotation for ornaments/stars
      if (!isTreeMode) {
         dummy.rotation.x += delta * 0.2;
         dummy.rotation.y += delta * 0.2;
      }

      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
      castShadow
      receiveShadow
    >
       {/* If we wanted specific colors per instance, we would use setColorAt, but for this luxury look, uniform materials are better */}
    </instancedMesh>
  );
};

export default InstancedGroup;