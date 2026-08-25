import React, { useEffect, useRef } from 'react';

export default function OrbImageSequence({ 
  frameCount = 100, 
  fps = 30, // Kept for backwards compatibility but not used in hover
  pathPrefix = "/orbimages/frame_",
  pathSuffix = ".png" 
}) {
  const imgRef = useRef(null);
  const targetFrameRef = useRef(1);
  const currentFrameFloatRef = useRef(1);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cursorY = e.clientY;
      const windowHeight = window.innerHeight;
      
      const percentage = cursorY / windowHeight;
      let targetFrame = Math.floor(percentage * frameCount) + 1;
      
      targetFrameRef.current = Math.max(1, Math.min(frameCount, targetFrame));
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    const animate = () => {
      // 0.03 controls the SPEED. Lower number = much slower transition.
      // It creates "momentum" so it doesn't snap instantly to the mouse.
      currentFrameFloatRef.current += (targetFrameRef.current - currentFrameFloatRef.current) * 0.03;
      
      const roundedFrame = Math.round(currentFrameFloatRef.current);
      
      if (imgRef.current) {
        const frameNumberStr = String(roundedFrame).padStart(3, '0');
        imgRef.current.src = `${pathPrefix}${frameNumberStr}${pathSuffix}`;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [frameCount, pathPrefix, pathSuffix]);

  return (
    <img
      ref={imgRef}
      src={`${pathPrefix}001${pathSuffix}`}
      alt="Orb animation sequence"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block"
      }}
    />
  );
}
