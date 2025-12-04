import React, { useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls, Environment, PerspectiveCamera, Stars as SkyStars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { KernelSize, Resolution } from 'postprocessing';
import { generateParticles } from '../utils/generator';
import InstancedGroup from './InstancedGroup';
import TopperStar from './TopperStar';

interface SceneProps {
  isTreeMode: boolean;
}

// --- GEOMETRY & MATERIALS ---
// Pre-creating these outside the component prevents re-creation on render

// 1. Needles: Deep Emerald Green, slightly metallic
const needleGeo = new THREE.ConeGeometry(0.15, 0.8, 4); // Low poly tetrahedrons look like needles
needleGeo.rotateX(Math.PI / 2); // Point outward
const needleMat = new THREE.MeshStandardMaterial({
  color: '#004225', // Deep Emerald
  roughness: 0.4,
  metalness: 0.3,
  flatShading: true,
});

// 2. Ornaments: Champagne Gold
const ornamentGeo = new THREE.SphereGeometry(0.25, 16, 16);
const ornamentMat = new THREE.MeshStandardMaterial({
  color: '#FFD700',
  roughness: 0.1,
  metalness: 0.9,
  envMapIntensity: 1.5,
});

// 3. Twinkling Stars (Particles): Warm Light
const starGeo = new THREE.OctahedronGeometry(0.1, 0);
const starMat = new THREE.MeshStandardMaterial({
  color: '#fffae3',
  emissive: '#fffae3',
  emissiveIntensity: 3, // High intensity for bloom
  toneMapped: false, // Bypass tone mapping to stay bright
});

const Scene: React.FC<SceneProps> = ({ isTreeMode }) => {
  
  // Generate Data Once
  const needleData = useMemo(() => generateParticles(3500, 'cone'), []);
  const ornamentData = useMemo(() => generateParticles(250, 'cone'), []);
  const starData = useMemo(() => generateParticles(400, 'cone'), []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} />
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={5} 
        maxDistance={40}
        autoRotate={isTreeMode}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
      />

      {/* --- LIGHTING --- */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#fffae3" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#004225" />

      {/* HDRI for Gold Reflections */}
      <Environment preset="city" />

      {/* --- CONTENT --- */}
      <group position={[0, -2, 0]}> {/* Center the tree vertically */}
        
        {/* The Green Needles */}
        <InstancedGroup 
          data={needleData} 
          isTreeMode={isTreeMode} 
          geometry={needleGeo} 
          material={needleMat} 
          speed={0.8}
        />

        {/* The Gold Ornaments */}
        <InstancedGroup 
          data={ornamentData} 
          isTreeMode={isTreeMode} 
          geometry={ornamentGeo} 
          material={ornamentMat} 
          speed={0.6} // Slightly slower for layering effect
        />

        {/* The Glowing Sparkles */}
        <InstancedGroup 
          data={starData} 
          isTreeMode={isTreeMode} 
          geometry={starGeo} 
          material={starMat} 
          speed={0.9} // Fast and sparkly
        />
        
        <TopperStar isTreeMode={isTreeMode} />
      </group>

      {/* Background Stars (Far away) */}
      <SkyStars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* --- POST PROCESSING --- */}
      <EffectComposer disableNormalPass>
        {/* Bloom for the magical glow */}
        <Bloom 
          luminanceThreshold={1.1} // Only very bright things (emissive > 1) glow
          mipmapBlur 
          intensity={0.8} 
          radius={0.6}
        />
        
        {/* Noise for film grain texture */}
        <Noise opacity={0.05} />
        
        {/* Vignette for cinematic focus */}
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Scene;