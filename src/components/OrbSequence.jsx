import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function OrbSequence() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const uiRef = useRef(null);
  const headlineRef = useRef(null);
  const bottomRowRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const totalFrames = 120; // frame sequence from 1 to 120

  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;

    imagesRef.current = new Array(totalFrames);

    const loadImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        const paddedIndex = (index + 1).toString().padStart(3, '0');
        img.src = `/frames/ezgif-frame-${paddedIndex}.png`;
        img.onload = () => {
          if (!isCancelled) {
            imagesRef.current[index] = img;
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / totalFrames) * 100));
            if (index === 0) {
              renderCanvas(0);
              setIsLoaded(true);
            }
          }
          resolve(img);
        };
        img.onerror = () => resolve(null);
      });
    };

    // Load Frame 0 immediately so canvas & ScrollTrigger can mount with zero delay
    loadImage(0).then(() => {
      if (isCancelled) return;

      // Load initial frames (1-14) for immediate scroll readiness
      const initialBatch = [];
      for (let i = 1; i < Math.min(15, totalFrames); i++) {
        initialBatch.push(loadImage(i));
      }

      Promise.all(initialBatch).then(() => {
        if (isCancelled) return;

        // Progressively load remaining frames in small batches
        let currentIndex = 15;
        const loadNextBatch = () => {
          if (isCancelled || currentIndex >= totalFrames) return;
          const batchPromises = [];
          const end = Math.min(currentIndex + 10, totalFrames);
          for (let i = currentIndex; i < end; i++) {
            batchPromises.push(loadImage(i));
          }
          currentIndex = end;
          Promise.all(batchPromises).then(() => {
            if (!isCancelled && currentIndex < totalFrames) {
              if (window.requestIdleCallback) {
                window.requestIdleCallback(() => loadNextBatch(), { timeout: 150 });
              } else {
                setTimeout(loadNextBatch, 25);
              }
            }
          });
        };

        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => loadNextBatch(), { timeout: 150 });
        } else {
          setTimeout(loadNextBatch, 25);
        }
      });
    });

    return () => {
      isCancelled = true;
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
    if (!canvas) return;

    let image = imagesRef.current[frameIndex];
    if (!image || !image.complete || image.naturalWidth === 0) {
      for (let offset = 1; offset < totalFrames; offset++) {
        const prev = imagesRef.current[frameIndex - offset];
        if (prev && prev.complete && prev.naturalWidth !== 0) {
          image = prev;
          break;
        }
        const next = imagesRef.current[frameIndex + offset];
        if (next && next.complete && next.naturalWidth !== 0) {
          image = next;
          break;
        }
      }
    }
    if (!image || !image.complete || image.naturalWidth === 0) return;

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
          refreshPriority: 3,
        }
      });

      // Add a pause before playing so the user completely "scrolls onto" the section
      const startDelay = 0.25;
      const playDuration = 1 - startDelay;

      // Animate frames smoothly across the scroll sequence
      tl.to(playhead, {
        frame: totalFrames - 1,
        ease: 'none',
        duration: playDuration,
        onUpdate: updateCanvas
      }, startDelay);

      // Fade in the UI overlay when the animation begins
      if (uiRef.current) {
        tl.fromTo(uiRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.12, ease: 'none' },
          startDelay
        );
      }

      // Reveal the global header when "We make movements" begins
      const globalHeader = document.getElementById('global-header');
      if (globalHeader) {
        tl.fromTo(globalHeader,
          { autoAlpha: 0, y: -20 },
          { autoAlpha: 1, y: 0, duration: 0.12, ease: 'none' },
          startDelay
        );
      }

      // Blur out the text as the user scrolls down towards the next section
      if (bottomRowRef.current) {
        tl.fromTo(bottomRowRef.current,
          { filter: 'blur(0px)', opacity: 1, y: 0 },
          { filter: 'blur(16px)', opacity: 0, y: -20, duration: 0.22, ease: 'power1.in' },
          0.70
        );
      }

      if (headlineRef.current) {
        tl.fromTo(headlineRef.current,
          { filter: 'blur(0px)', opacity: 1, y: 0 },
          { filter: 'blur(24px)', opacity: 0, y: -30, duration: 0.22, ease: 'power1.in' },
          0.74
        );
      }

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, containerRef); // Scope the GSAP context to the container

    // Refresh ScrollTrigger to recalculate positions of elements below this one
    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

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
        <div
          ref={uiRef}
          style={{
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

          {/* Top spacer reserving space for floating global header */}
          <div style={{ height: '44px', width: '100%', pointerEvents: 'none' }} />

          {/* Bottom Layout (Hero Text + Footer) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', pointerEvents: 'auto' }}>

            {/* Hero Section Typography (Bottom-Left) */}
            <div 
              ref={headlineRef}
              style={{ 
                textAlign: 'left',
                filter: 'blur(0px)',
                willChange: 'filter, opacity, transform',
              }}
            >
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
            <div 
              ref={bottomRowRef}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-end', 
                flexWrap: 'wrap', 
                gap: '24px',
                filter: 'blur(0px)',
                willChange: 'filter, opacity, transform',
              }}
            >

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
