import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const Snow: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 1500;
  
  // Create dummy object once to reuse for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate initial random state for particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        // Spread widely across the scene
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 40 + 10, // Start higher up
        z: (Math.random() - 0.5) * 50,
        // Individual fall speeds
        speed: 0.05 + Math.random() * 0.1,
        // Individual sway parameters
        swaySpeed: 0.5 + Math.random(), 
        swayAmp: 0.1 + Math.random() * 0.2,
        scale: 0.3 + Math.random() * 0.4
      });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Scale delta to ensure smooth motion regardless of framerate
    // If delta is huge (tab switch), clamp it
    const dt = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      // Update Y position (fall)
      p.y -= p.speed * (dt * 60); // approximate normalization

      // Reset when hitting bottom
      if (p.y < -15) {
        p.y = 25;
        p.x = (Math.random() - 0.5) * 50;
        p.z = (Math.random() - 0.5) * 50;
      }

      // Add lateral sway using sine wave
      const sway = Math.sin(time * p.swaySpeed + p.x) * p.swayAmp;

      dummy.position.set(p.x + sway, p.y, p.z);
      dummy.scale.setScalar(p.scale);
      
      // Gentle rotation
      dummy.rotation.x += dt * 0.5;
      dummy.rotation.z += dt * 0.5;
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      {/* Simple low-poly geometry for performance */}
      <octahedronGeometry args={[0.1, 0]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.4} 
        depthWrite={false} 
      />
    </instancedMesh>
  );
};

export default Snow;