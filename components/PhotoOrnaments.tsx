import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { generatePhotoPositions } from '../utils/generator';
import { ParticleData } from '../types';

// --- IMAGE LOADING LOGIC ---
// In Vite, import.meta.glob is a compile-time macro. 
// We must use it exactly as 'import.meta.glob', without casting (import.meta as any).
// Make sure you create 'src/assets/photos' and put images there.

// @ts-ignore - TypeScript might complain if types aren't fully set up, but this is valid Vite code.
const localImages = import.meta.glob('/src/assets/photos/*.{png,jpg,jpeg,svg}', { 
  eager: true, 
  query: '?url', 
  import: 'default' 
});

// Fallback images (Unsplash) in case the local folder is empty
const fallbackImages = [
  "https://images.unsplash.com/photo-1512389142860-9c449e58a543?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1544425690-ab9518e503b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1543589077-47d81606c1bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1482517967863-00e15c9b4499?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
];

const getTextureUrls = () => {
  const localPaths = Object.values(localImages) as string[];
  if (localPaths.length > 0) return localPaths;
  return fallbackImages; // Use fallbacks if no local images found
};

// --- SINGLE FRAMED PHOTO COMPONENT ---
interface FramedPhotoProps {
  url: string;
  data: ParticleData;
  isTreeMode: boolean;
}

const frameGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.1);
const photoGeometry = new THREE.PlaneGeometry(1.0, 1.3);

const frameMaterial = new THREE.MeshStandardMaterial({
  color: '#FFD700', // Gold
  metalness: 1,
  roughness: 0.2,
});

const FramedPhoto: React.FC<FramedPhotoProps> = ({ url, data, isTreeMode }) => {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, url);
  
  // Fix texture orientation if needed
  texture.center.set(0.5, 0.5);
  // Optional: texture.rotation = ...

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    let targetPos = isTreeMode ? data.treePos.clone() : data.scatterPos.clone();

    // --- WIND EFFECT (Copied from InstancedGroup for consistency) ---
    if (isTreeMode) {
      const yNorm = (data.treePos.y + 7) / 14; 
      const windStrength = Math.pow(yNorm, 2) * 0.5;

      const windX = Math.sin(time * 0.8 + data.treePos.y * 0.3) * windStrength;
      const windZ = Math.cos(time * 0.6 + data.treePos.y * 0.2) * windStrength * 0.5;

      targetPos.x += windX;
      targetPos.z += windZ;
    }

    // Smooth movement
    groupRef.current.position.lerp(targetPos, 0.05);

    // Rotation logic
    if (isTreeMode) {
      // Look away from center. 
      // We calculated initial rotation in generator, but dynamic wind changes position.
      // Simplest way: Look at the central axis (0, y, 0) and rotate 180deg (Math.PI)
      const lookAtTarget = new THREE.Vector3(0, targetPos.y, 0);
      groupRef.current.lookAt(lookAtTarget);
      // Rotate 180 deg to face OUT
      groupRef.current.rotateY(Math.PI);
    } else {
      // Tumbling in space
      groupRef.current.rotation.x += delta * 0.2;
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* The Gold Frame */}
      <mesh geometry={frameGeometry} material={frameMaterial} castShadow />
      
      {/* The Photo */}
      {/* Slightly offset in Z to prevent z-fighting with frame back */}
      <mesh geometry={photoGeometry} position={[0, 0, 0.06]}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
};

// --- MAIN CONTAINER ---
interface PhotoOrnamentsProps {
  isTreeMode: boolean;
}

const PhotoOrnaments: React.FC<PhotoOrnamentsProps> = ({ isTreeMode }) => {
  const urls = useMemo(() => getTextureUrls(), []);
  
  // Generate position data based on how many images we found
  // We loop the images if we have fewer images than positions, or vice versa
  const positions = useMemo(() => generatePhotoPositions(urls.length), [urls.length]);

  return (
    <group>
      {positions.map((data, i) => (
        <FramedPhoto 
          key={i} 
          url={urls[i]} 
          data={data} 
          isTreeMode={isTreeMode} 
        />
      ))}
    </group>
  );
};

export default PhotoOrnaments;