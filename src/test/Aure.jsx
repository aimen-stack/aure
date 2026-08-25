import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Aure() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const totalFrames = 120; // frame sequence from 1 to 120

  useEffect(() => {
    let loadedCount = 0;
    
    // Disable scrolling while loading
    document.body.style.overflow = 'hidden';

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = `/frames/ezgif-frame-${paddedIndex}.png`;
      img.onload = () => {
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / totalFrames) * 100));
        if (loadedCount === totalFrames) {
          setIsLoaded(true);
          document.body.style.overflow = 'auto'; // Restore scroll
        }
      };
      imagesRef.current.push(img);
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useLayoutEffect(() => {
    // Override #root constraints from index.css to ensure full screen width
    const root = document.getElementById('root');
    if (root) {
      root.style.width = '100%';
      root.style.maxWidth = '100%';
      root.style.border = 'none';
      root.style.margin = '0';
      root.style.padding = '0';
    }
    
    return () => {
      if (root) {
        // Reset styles on unmount
        root.style.width = '';
        root.style.maxWidth = '';
        root.style.border = '';
        root.style.margin = '';
        root.style.padding = '';
      }
    };
  }, []);

  const renderCanvas = (frameIndex) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[frameIndex];
    if (!canvas || !image) return;

    const context = canvas.getContext('2d');
    
    // Handle devicePixelRatio for sharp rendering on retina screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    
    // Clear the canvas cleanly
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(dpr, dpr);

    const hRatio = rect.width / image.width;
    const vRatio = rect.height / image.height;
    
    // Using Math.max for a full screen cover effect
    const ratio = Math.max(hRatio, vRatio); 
    
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

    // Draw initial frame
    renderCanvas(0);

    let ctx = gsap.context(() => {
      const playhead = { frame: 0 };
      let lastFrame = 0;

      const updateCanvas = () => {
        // Redraw only when the frame index actually changes to prevent flicker
        const currentFrame = Math.round(playhead.frame);
        if (currentFrame !== lastFrame) {
          renderCanvas(currentFrame);
          lastFrame = currentFrame;
        }
      };

      const handleResize = () => {
        // Force redraw on resize
        renderCanvas(Math.round(playhead.frame));
      };
      window.addEventListener('resize', handleResize);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=400%', // Pin for 400vh for a smooth long scroll
          pin: true,
          scrub: true, // True linear mapping
        }
      });

      tl.to(playhead, {
        frame: totalFrames - 1,
        ease: 'none', // Linear progression without easing
        onUpdate: updateCanvas
      });

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, containerRef); // Scope the GSAP context to the container

    return () => ctx.revert();
  }, [isLoaded]);



  return (
    <div style={{ backgroundColor: '#C9A38C', margin: 0, padding: 0 }}>
      {/* 
        This is the single scroll section. GSAP handles pinning this element.
        Once the sequence finishes, scrolling naturally resumes past this point.
      */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#C9A38C', overflow: 'hidden' }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', 
            height: '100%', 
            display: 'block',
            zIndex: 1
          }} 
        />

        {/* UI Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          padding: '2.5rem 3rem', 
          boxSizing: 'border-box', 
          pointerEvents: 'none', 
          color: '#fff', 
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
        }}>
          
          {/* Navigation Bar (Top) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'auto' }}>
            {/* Top-Left: Glowing, multi-colored abstract gradient circle logo */}
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '50%', 
              background: 'conic-gradient(from 180deg at 50% 50%, #FF2E93 0deg, #FF8A00 120deg, #FFC700 240deg, #FF2E93 360deg)', 
              boxShadow: '0 0 24px rgba(255, 46, 147, 0.5)',
              cursor: 'pointer'
            }} />
            
            {/* Top-Right: Interactive pill elements */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #FF7A00 0%, #FF2E93 50%, #9B51E0 100%)', 
                boxShadow: '0 4px 12px rgba(255, 46, 147, 0.5), 0 0 20px rgba(155, 81, 224, 0.4)',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                border: 'none', 
                cursor: 'pointer',
                padding: 0,
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: '1px' }}>
                  <path d="M13.5 15.5l-3-3.2-5.5 3.2 6.2-6.5 3 3.2 5.5-3.2-6.2 6.5z" />
                </svg>
              </button>
              
              <button style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '6px 16px 6px 6px', 
                borderRadius: '999px', 
                backgroundColor: '#fff', 
                color: '#000', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: '13px',
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: '#e0e0e0', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  overflow: 'hidden' 
                }}>
                  <img src="https://i.pravatar.cc/100?img=33" alt="avatar" style={{width: '100%', height: '100%'}}/>
                </div>
                Let's talk
              </button>
              <button style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '10px 20px', 
                borderRadius: '999px', 
                backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                backdropFilter: 'blur(8px)', 
                color: '#fff', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: '13px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                MENU
              </button>
            </div>
          </div>

          {/* Bottom Layout (Hero Text + Footer) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', pointerEvents: 'auto' }}>
            
            {/* Hero Section Typography (Bottom-Left) */}
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ margin: 0, fontSize: 'clamp(3.5rem, 8.5vw, 7rem)', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.03em' }}>
                <span style={{ color: '#fff', display: 'block' }}>We make</span>
                <span style={{ 
                  display: 'block', 
                  background: 'linear-gradient(90deg, #FF7A00 0%, #FF2E93 100%)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>movements.</span>
              </h1>
            </div>

            {/* Footer / Bottom Layout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
              
              {/* Bottom-Left Button */}
              <div style={{ flex: '1 1 0', minWidth: '200px', textAlign: 'left' }}>
                <button style={{ 
                  padding: '14px 28px', 
                  borderRadius: '999px', 
                  backgroundColor: 'transparent', 
                  color: '#fff', 
                  border: '1px solid rgba(255, 255, 255, 0.6)', 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  fontSize: '12px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#fff'; }}
                >
                  Start your movement
                </button>
              </div>

              {/* Bottom-Center text */}
              <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center', minWidth: '250px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                }}>
                  HOLD THE 
                  <span style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    border: '1px solid rgba(255, 255, 255, 0.5)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }} />
                  </span>
                  TO BLASH
                </div>
              </div>

              {/* Bottom-Right Paragraph */}
              <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-end', minWidth: '350px' }}>
                <p style={{ 
                  margin: 0,
                  textAlign: 'right', 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '14px', 
                  lineHeight: 1.6, 
                  maxWidth: '480px',
                  fontWeight: 400
                }}>
                  The creative engine for brands that refuse to be background noise. Strategy, story, and craft engineered for impact.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
