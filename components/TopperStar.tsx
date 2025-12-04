import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

interface TopperStarProps {
  isTreeMode: boolean;
}

const TopperStar: React.FC<TopperStarProps> = ({ isTreeMode }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Tree Top Position
  const treeTop = new THREE.Vector3(0, 7.5, 0); // slightly above TREE_HEIGHT/2
  // Scatter Position (somewhere far)
  const scatterPos = new THREE.Vector3(0, 20, -10);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const target = isTreeMode ? treeTop : scatterPos;
    meshRef.current.position.lerp(target, 0.05);
    
    // Spin slowly
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh>
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial 
                color="#fff" 
                emissive="#ffddaa"
                emissiveIntensity={4}
                toneMapped={false}
            />
        </mesh>
        {/* Halo */}
        <mesh scale={[1.2, 1.2, 1.2]}>
            <octahedronGeometry args={[1.5, 0]} />
            <meshBasicMaterial 
                color="#ffd700" 
                wireframe 
                transparent 
                opacity={0.3}
            />
        </mesh>
      </Float>
      
      {/* Light source from the star */}
      <pointLight 
        color="#ffaa00" 
        intensity={isTreeMode ? 2 : 0} 
        distance={20} 
        decay={2} 
      />
    </group>
  );
};

export default TopperStar;