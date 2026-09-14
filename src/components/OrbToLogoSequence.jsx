import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

export default function OrbToLogoSequence() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const frictionRef = useRef(null);
  const whisperRef = useRef(null);
  const paragraphRef = useRef(null);
  const statsRef = useRef(null);
  const gradientsRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const totalFrames = 40;

  useEffect(() => {
    let loadedCount = 0;
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = `/orb-to-logo-frames/ezgif-frame-${paddedIndex}.png`;
      img.onload = () => {
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / totalFrames) * 100));
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

    const hRatio = rect.width / image.width;
    const vRatio = rect.height / image.height;

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
    renderCanvas(0);

    let ctx = gsap.context(() => {
      const playhead = { frame: 0 };
      let lastFrame = 0;

      const updateCanvas = () => {
        const currentFrame = Math.round(playhead.frame);
        if (currentFrame !== lastFrame) {
          renderCanvas(currentFrame);
          lastFrame = currentFrame;
        }
      };

      const handleResize = () => {
        renderCanvas(Math.round(playhead.frame));
      };
      window.addEventListener('resize', handleResize);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=700%', // Increased pin duration for the extended text sequence and stats
          pin: true,
          scrub: true,
          refreshPriority: 2,
        }
      });

      // 1. Play through the frames
      tl.to(playhead, {
        frame: totalFrames - 1,
        ease: 'none',
        duration: 2,
        onUpdate: updateCanvas
      });

      // 2. Hide the canvas almost instantly as the new content starts to appear
      tl.to(canvasRef.current, {
        opacity: 0,
        duration: 0.1,
        ease: 'power2.inOut'
      });

      // 3. Fade in The Friction content and orb.png (starts after canvas is completely hidden)
      if (gradientsRef.current) {
        tl.fromTo(gradientsRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: 'power2.inOut' }
        );
      }

      if (frictionRef.current) {
        tl.fromTo(frictionRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
          "<"
        );
      }

      // Initialize initial states for the sequential animations
      if (whisperRef.current) gsap.set(whisperRef.current, { filter: 'blur(12px)', opacity: 0.4 });
      if (paragraphRef.current) gsap.set(paragraphRef.current, { filter: 'blur(12px)', opacity: 0.4, y: 20 });
      if (statsRef.current) gsap.set(statsRef.current, { filter: 'blur(12px)', opacity: 0.4, y: 30 });

      // 4. Unblur "whispering"
      if (whisperRef.current) {
        tl.to(whisperRef.current, { filter: 'blur(0px)', opacity: 1, duration: 1, ease: 'power2.out' }, "+=0.2");
      }

      // 5. Show paragraph
      if (paragraphRef.current) {
        tl.to(paragraphRef.current, { filter: 'blur(0px)', opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, "+=0.2");
      }

      // 6. Show stats and pan content up slightly to ensure they are visible on shorter screens
      if (statsRef.current && frictionRef.current) {
        tl.to(frictionRef.current, { y: '-15vh', duration: 1, ease: 'power2.out' }, "+=0.2");
        tl.to(statsRef.current, { filter: 'blur(0px)', opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, "<");
      }

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, containerRef);

    // Refresh ScrollTrigger to recalculate positions of elements below this one
    // since we added a pin dynamically after images loaded
    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [isLoaded]);

  return (
    <div style={{ backgroundColor: '#100C1F', margin: 0, padding: 0 }}>
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '125vh', backgroundColor: '#100C1F', overflow: 'hidden' }}>

        {/* Gradients from The Friction (initially hidden) */}
        <div ref={gradientsRef} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>

          <style>{`
            @keyframes orbFloatBg {
              0% { transform: translateX(-50%) translateY(0px) scale(1); }
              50% { transform: translateX(-50%) translateY(-20px) scale(1.03); }
              100% { transform: translateX(-50%) translateY(0px) scale(1); }
            }
          `}</style>

          {/* Moving background orb */}
          <div style={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            animation: 'orbFloatBg 8s ease-in-out infinite',
            zIndex: 1,
            mixBlendMode: 'screen'
          }}>
            <img src="/orb.png" alt="" style={{ width: '600px', height: 'auto', opacity: 0.85, display: 'block' }} />
          </div>

          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(197, 219, 255, 0.6) 0%, rgba(204, 150, 255, 0.4) 30%, rgba(16, 12, 31, 0) 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(255, 230, 217, 0.6) 0%, rgba(131, 192, 255, 0.4) 30%, rgba(16, 12, 31, 0) 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }} />
        </div>

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

        {/* The Friction Content */}
        <div
          ref={frictionRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            pointerEvents: 'none', // Allow clicking through if needed, though text could be selectable
          }}
        >


          <div style={{
            textAlign: 'center',
            maxWidth: '1000px',
            padding: '0 20px',
            marginTop: '8vh' // Reduced drastically so it doesn't push the stats off the bottom of the screen
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '2rem'
            }}>
              THE FRICTION
            </div>

            <h2 style={{
              margin: 0,
              fontSize: 'clamp(3rem, 7vw, 6.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}>
              <span style={{
                background: 'linear-gradient(90deg, #FF7A00 0%, #FF2E93 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                paddingRight: '0.1em'
              }}>
                The market went deaf.
              </span>
              <br />
              <span style={{ color: '#7876A1' }}>
                Most brands keep <span ref={whisperRef} style={{ display: 'inline-block' }}>whispering.</span>
              </span>
            </h2>

            <p ref={paragraphRef} style={{
              margin: '2rem auto 3rem',
              width: '508px',
              height: '54px',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 300,
              fontSize: '18px',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              textAlign: 'center',
              color: '#AFB1DE'
            }}>
              Attention is the only currency left, and blending in is the only real risk. AURÊ exists to make brands impossible to ignore.
            </p>

            {/* Stats */}
            <div ref={statsRef} style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6rem',
              flexWrap: 'wrap',
              margin: '0 auto',
              fontFamily: '"Poppins", sans-serif'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1 }}>8s</div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)' }}>AVERAGE ATTENTION</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1 }}>90%</div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)' }}>OF BRANDS BLEND IN</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1 }}>1</div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)' }}>REAL RISK: SILENCE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          padding: '2.5rem 3rem',
          boxSizing: 'border-box',
          zIndex: 10
        }}>

        </div>
      </div>
    </div>
  );
}
