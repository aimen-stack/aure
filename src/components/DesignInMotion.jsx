import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FaceO = () => (
  <span style={{
    display: 'inline-block',
    width: '0.85em',
    height: '0.85em',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF7A00 0%, #FF2E93 100%)',
    position: 'relative',
    margin: '0 0.05em',
    transform: 'translateY(0.08em)'
  }}>
    <span style={{
      position: 'absolute', top: '35%', left: '25%', width: '15%', height: '15%',
      backgroundColor: '#fff', borderRadius: '50%'
    }}>
      <span style={{position:'absolute', top:'30%', left:'30%', width:'40%', height:'40%', backgroundColor:'#000', borderRadius:'50%'}}></span>
    </span>
    <span style={{
      position: 'absolute', top: '35%', right: '25%', width: '15%', height: '15%',
      backgroundColor: '#fff', borderRadius: '50%'
    }}>
      <span style={{position:'absolute', top:'30%', left:'30%', width:'40%', height:'40%', backgroundColor:'#000', borderRadius:'50%'}}></span>
    </span>
  </span>
);

export default function DesignInMotion() {
  const containerRef = useRef(null);
  const leftTextRef = useRef(null);
  const rightTextRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const totalFrames = 50; // Based on public/orbimages

  useEffect(() => {
    let loadedCount = 0;
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = `/orbimages/ezgif-frame-${paddedIndex}.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          setIsLoaded(true);
        }
      };
      imagesRef.current.push(img);
    }
  }, []);

  const renderCanvas = (frameIndex) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[frameIndex];
    if (!canvas || !image) return;

    const context = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(dpr, dpr);

    // Contain the orb in the center
    const hRatio = rect.width / image.width;
    const vRatio = rect.height / image.height;
    const ratio = Math.min(hRatio, vRatio) * 0.8; // Scale down slightly so it doesn't touch edges

    const centerShift_x = (rect.width - image.width * ratio) / 2;
    const centerShift_y = (rect.height - image.height * ratio) / 2;

    context.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      centerShift_x,
      centerShift_y,
      image.width * ratio,
      image.height * ratio
    );
  };

  useLayoutEffect(() => {
    if (!isLoaded) return;
    renderCanvas(0);

    let ctx = gsap.context(() => {
      const playhead = { frame: 0 };
      let lastFrame = 0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=200%', // 200vh pin duration for the animation
          pin: true,
          scrub: 1,
          refreshPriority: 0,
        }
      });

      // Animate text moving towards center horizontally, keeping their vertical offset
      tl.fromTo(leftTextRef.current, 
        { x: '-60vw', y: '-10vh', opacity: 0 },
        { x: '-12vw', y: '-10vh', opacity: 1, ease: 'power2.out', duration: 1 },
        0
      );

      tl.fromTo(rightTextRef.current,
        { x: '60vw', y: '10vh', opacity: 0 },
        { x: '12vw', y: '10vh', opacity: 1, ease: 'power2.out', duration: 1 },
        0
      );

      // Animate canvas frames
      tl.to(playhead, {
        frame: totalFrames - 1,
        ease: 'none',
        duration: 1,
        onUpdate: () => {
          const currentFrame = Math.round(playhead.frame);
          if (currentFrame !== lastFrame) {
            renderCanvas(currentFrame);
            lastFrame = currentFrame;
          }
        }
      }, 0);

    }, containerRef);

    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [isLoaded]);

  return (
    <div ref={containerRef} style={{
      backgroundColor: '#090815', // Dark blue/purple bg matching screenshot
      height: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      zIndex: 2
    }}>
      {/* Background/Orb Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
      
      {/* Typography Overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        
        {/* DESIGN IN */}
        <div ref={leftTextRef} style={{
          position: 'absolute',
          fontSize: 'clamp(3rem, 7vw, 6rem)',
          fontWeight: 600,
          color: '#E0E0FF', // Soft purple-tinted white
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap'
        }}>
          DESIGN IN
        </div>

        {/* MOTION */}
        <div ref={rightTextRef} style={{
          position: 'absolute',
          fontSize: 'clamp(3rem, 7vw, 6rem)',
          fontWeight: 600,
          color: '#E0E0FF',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center'
        }}>
          MOTI<FaceO />N
        </div>

      </div>
    </div>
  );
}
