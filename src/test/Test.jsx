import React, { Suspense, useRef } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// --- 1. The Animated Water Surface ---
function WaterSurface() {
  // Load the local normal map from the public folder
const waterNormals = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/water/Water_1_M_Normal.jpg');
  
  // Make the texture repeat so it covers the whole floor
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
  waterNormals.repeat.set(4, 4);

  // Animate the water ripples frame by frame
  useFrame((state, delta) => {
    waterNormals.offset.y -= delta * 0.05;
    waterNormals.offset.x += delta * 0.01;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial 
         distortionMap={waterNormals} 
         distortion={0.8} // Ripple strength
         mirror={1}
         color="#050510" // Dark blue/black water
         roughness={0.1}
         mixBlur={0}
         depthScale={1}
      />
    </mesh>
  );
}

// --- 2. The Glowing Text ---
function GlowingText() {
  const textRef = useRef();

  // Make the text float up and down slightly
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    textRef.current.position.y = Math.sin(time * 1.5) * 0.05;
  });

  return (
    <group ref={textRef} position={[0, 0, -2]}>
      <Text fontSize={1.8} color="white" anchorX="center" anchorY="bottom" fontWeight="bold">
        We don't
        <meshStandardMaterial emissive="white" emissiveIntensity={2} toneMapped={false} />
      </Text>
      
      {/* Hidden colored lights behind the text to reflect onto the water */}
      <pointLight position={[-1, 0.5, 0]} intensity={5} color="#4b8bf5" distance={10} />
      <pointLight position={[1, 0.5, 0]} intensity={5} color="#f56e4b" distance={10} />
    </group>
  );
}

// --- 3. The Main Test Assembly ---
export default function Test() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      
      {/* Injecting your global CSS directly into the component */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: #010103; /* Deep space background */
        }
        html, body, #root {
          width: 100%;
          height: 100%;
        }
      `}</style>

      <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }}>
        {/* Basic lighting and fog to hide the edges of the 3D world */}
        <ambientLight intensity={0.2} color="#2a3045" />
        <fog attach="fog" args={['#010103', 5, 20]} />
        
        {/* Background stars */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* Suspense waits for the water image to load before showing the scene */}
        <Suspense fallback={null}>
           <GlowingText />
           <WaterSurface />
        </Suspense>

        {/* Post-Processing: Creates the cinematic glowing light bleed */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
        </EffectComposer>
        
      </Canvas>
    </div>
  );
}