import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Scene from './components/Scene';

const App: React.FC = () => {
  const [isTreeMode, setIsTreeMode] = useState(true);

  return (
    <div className="relative w-full h-screen bg-[#050505]">
      {/* 3D Canvas */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 18], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.5 }}
        className="w-full h-full"
        onClick={() => setIsTreeMode(!isTreeMode)}
      >
        <Suspense fallback={null}>
          <Scene isTreeMode={isTreeMode} />
        </Suspense>
      </Canvas>

      <Loader containerStyles={{ background: '#050505' }} />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none flex justify-between items-start z-10">
        <div>
          <h1 className="text-white text-3xl font-light tracking-[0.2em] uppercase font-serif">Arix</h1>
          <p className="text-emerald-500 text-xs tracking-widest mt-1 uppercase">Signature Collection</p>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none z-10">
        <p className="text-white/40 text-xs tracking-widest uppercase animate-pulse">
          {isTreeMode ? 'Tap to Scatter' : 'Tap to Assemble'}
        </p>
      </div>
      
      {/* Aesthetic Frame */}
      <div className="absolute inset-0 border-[1px] border-white/5 pointer-events-none m-4"></div>
    </div>
  );
};

export default App;