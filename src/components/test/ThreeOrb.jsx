import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color } from 'three';

const vertexShader = `
uniform float uTime;
uniform float uScroll;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

// Simplex 3D Noise by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0; 
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z); 
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ ); 
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  // Calculate noise for vertex displacement (the "wobble")
  // uScroll goes from 0.0 (perfectly round) to 1.0 (fully wobbling)
  float noiseScale = 1.5 + (uScroll * 2.0);
  float noiseAmount = 0.3 * uScroll;
  float noiseValue = snoise(position * noiseScale + uTime * 0.8) * noiseAmount;
  vec3 displacedPosition = position + normal * noiseValue;
  
  vPosition = (modelViewMatrix * vec4(displacedPosition, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`;

const fragmentShader = `
uniform vec3 colorA;
uniform vec3 colorB;
uniform float uTime;
uniform float uScroll;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  // Calculate Fresnel effect (glow at the edges based on view angle)
  vec3 viewDirection = normalize(-vPosition);
  float fresnel = dot(viewDirection, vNormal);
  fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
  fresnel = pow(fresnel, 2.0); // Sharpen the edge glow

  // Mix orange and purple based on Fresnel and Time
  float mixFactor = smoothstep(0.0, 1.0, fresnel + sin(vUv.y * 5.0 + uTime) * 0.2);
  vec3 baseColor = mix(colorA, colorB, mixFactor);

  // Add a bright inner core glow
  float coreGlow = smoothstep(0.7, 1.0, 1.0 - fresnel);
  baseColor += vec3(1.0, 0.9, 0.8) * coreGlow * 0.4;
  
  // Final color output, boosted for that iridescent "Apple" glowing look
  // Make the glow more intense when scrolling
  vec3 finalColor = baseColor + (colorB * fresnel * (1.5 + uScroll));
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const OrbMesh = () => {
  const materialRef = useRef();

  const scrollTarget = useRef(0);
  const currentScroll = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      colorA: { value: new Color('#ffcf9e') }, // Warm pastel orange
      colorB: { value: new Color('#c9a6f5') }, // Iridescent purple
    }),
    []
  );

  // Listen for scroll/wheel events globally
  useEffect(() => {
    const handleWheel = (e) => {
      // Accumulate scroll delta
      scrollTarget.current += e.deltaY * 0.002;
      // Clamp between 0 (round) and 1 (fully wobbling)
      scrollTarget.current = Math.max(0, Math.min(1, scrollTarget.current));
    };
    
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly animate the scroll value (ease out)
      currentScroll.current += (scrollTarget.current - currentScroll.current) * 0.05;
      materialRef.current.uniforms.uScroll.value = currentScroll.current;
    }
  });

  return (
    <mesh>
      {/* High segment count for smooth vertex displacement */}
      <sphereGeometry args={[1.5, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export default function ThreeOrb() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <OrbMesh />
      </Canvas>
    </div>
  );
}
