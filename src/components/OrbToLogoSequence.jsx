import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function OrbToLogoSequence() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const frictionRef = useRef(null);
  const line1Ref = useRef(null);
  const gradientsRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const totalFrames = 40;

  // Content data
  const line1Words = ["The", "market", "went", "deaf."];
  const line2Words = ["Most", "brands", "keep", "whispering."];
  const paragraphWords = [
    "Attention", "is", "the", "only", "currency", "left,",
    "and", "blending", "in", "is", "the", "only", "real", "risk.",
    "AURÉ", "exists", "to", "make", "brands", "impossible", "to", "ignore."
  ];

  const stats = [
    { num: "8s", label: "AVERAGE ATTENTION" },
    { num: "90%", label: "OF BRANDS BLEND IN" },
    { num: "1", label: "REAL RISK: SILENCE" }
  ];

  // Motion and responsive detection
  const isReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const blurVal = isMobile ? 8 : 12;

  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;

    imagesRef.current = new Array(totalFrames);

    const loadImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        const paddedIndex = (index + 1).toString().padStart(3, '0');
        img.src = `/orb-to-logo-frames/ezgif-frame-${paddedIndex}.png`;
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

    // Load Frame 0 first so canvas has initial frame ready
    loadImage(0).then(() => {
      if (isCancelled) return;

      // Progressively load remaining frames in small batches during idle
      let currentIndex = 1;
      const loadNextBatch = () => {
        if (isCancelled || currentIndex >= totalFrames) return;
        const batchPromises = [];
        const end = Math.min(currentIndex + 8, totalFrames);
        for (let i = currentIndex; i < end; i++) {
          batchPromises.push(loadImage(i));
        }
        currentIndex = end;
        Promise.all(batchPromises).then(() => {
          if (!isCancelled && currentIndex < totalFrames) {
            if (window.requestIdleCallback) {
              window.requestIdleCallback(() => loadNextBatch(), { timeout: 150 });
            } else {
              setTimeout(loadNextBatch, 30);
            }
          }
        });
      };

      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => loadNextBatch(), { timeout: 150 });
      } else {
        setTimeout(loadNextBatch, 30);
      }
    });

    return () => {
      isCancelled = true;
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

  // Keep the gradient continuous across all words in headline line 1
  const updateGradientPositions = () => {
    if (!line1Ref.current) return;
    const parentRect = line1Ref.current.getBoundingClientRect();
    const parentWidth = parentRect.width;
    if (parentWidth <= 0) return;

    const wordEls = line1Ref.current.querySelectorAll('.word-gradient');
    wordEls.forEach((el) => {
      const elRect = el.getBoundingClientRect();
      const offsetLeft = elRect.left - parentRect.left;
      el.style.backgroundImage = 'linear-gradient(90deg, #FF7A00 0%, #FF2E93 50%, #9B51E0 100%)';
      el.style.backgroundSize = `${parentWidth}px 100%`;
      el.style.backgroundPosition = `-${offsetLeft}px 0px`;
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
      el.style.color = 'transparent';
    });
  };

  useLayoutEffect(() => {
    if (imagesRef.current.length > 0 && imagesRef.current[0]?.complete) {
      renderCanvas(0);
    }

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
        updateGradientPositions();
      };
      window.addEventListener('resize', handleResize);

      // Initial gradient alignment
      updateGradientPositions();

      // Recalculate once webfonts are ready
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          updateGradientPositions();
          ScrollTrigger.refresh();
        });
      }

      // If user prefers reduced motion, show everything clear immediately and avoid pinning
      if (isReducedMotion) {
        if (gradientsRef.current) gsap.set(gradientsRef.current, { opacity: 1 });
        if (frictionRef.current) gsap.set(frictionRef.current, { opacity: 1 });
        gsap.set(containerRef.current.querySelectorAll('.word, .stat-item, .friction-eyebrow'), {
          filter: 'none',
          opacity: 1,
          transform: 'none'
        });
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }

      // Main pinned ScrollTrigger sequence
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: isMobile ? '+=450%' : '+=600%',
          pin: true,
          scrub: 1, // Smooth scrubbed response to scroll
          refreshPriority: 2,
        }
      });

      // 1. Play through canvas frames
      tl.to(playhead, {
        frame: totalFrames - 1,
        ease: 'none',
        duration: 1.6,
        onUpdate: updateCanvas
      });

      // 2. Hide the canvas as The Friction content takes over
      tl.to(canvasRef.current, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.inOut'
      });

      // 3. Fade in glowing gradients and friction container
      if (gradientsRef.current) {
        tl.to(gradientsRef.current, {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out'
        }, "<");
      }

      if (frictionRef.current) {
        tl.to(frictionRef.current, {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out'
        }, "<");
      }

      // 4. Reveal Eyebrow "THE FRICTION"
      const eyebrow = frictionRef.current?.querySelector('.friction-eyebrow');
      if (eyebrow) {
        tl.to(eyebrow, {
          filter: 'blur(0px)',
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power1.out'
        }, "+=0.05");
      }

      // 5. Headline Line 1: Word by Word ("The" -> "market" -> "went" -> "deaf.")
      const line1WordEls = frictionRef.current?.querySelectorAll('.line1-word') || [];
      line1WordEls.forEach((el, i) => {
        tl.to(el, {
          filter: 'blur(0px)',
          opacity: 1,
          y: 0,
          duration: 0.32,
          ease: 'power1.out'
        }, i === 0 ? "+=0.08" : "<0.12");
      });

      // 6. Headline Line 2: Word by Word ("Most" -> "brands" -> "keep" -> "whispering.")
      const line2WordEls = frictionRef.current?.querySelectorAll('.line2-word') || [];
      line2WordEls.forEach((el, i) => {
        tl.to(el, {
          filter: 'blur(0px)',
          opacity: 1,
          y: 0,
          duration: 0.32,
          ease: 'power1.out'
        }, i === 0 ? "+=0.08" : "<0.12");
      });

      // 7. Paragraph: Word by Word (faster stagger than headline!)
      const paragraphWordEls = frictionRef.current?.querySelectorAll('.paragraph-word') || [];
      paragraphWordEls.forEach((el, i) => {
        tl.to(el, {
          filter: 'blur(0px)',
          opacity: 1,
          y: 0,
          duration: 0.18,
          ease: 'power1.out'
        }, i === 0 ? "+=0.1" : "<0.05");
      });

      // 8. Stats: Column by column (Number first, then its Label)
      const statEls = frictionRef.current?.querySelectorAll('.stat-item') || [];
      statEls.forEach((el, i) => {
        tl.to(el, {
          filter: 'blur(0px)',
          opacity: 1,
          y: 0,
          duration: 0.28,
          ease: 'power1.out'
        }, i === 0 ? "+=0.12" : "<0.12");
      });

      // 9. Reading hold: all text and stats sit 100% sharp and readable
      tl.to({}, { duration: 0.6 });

      // 10. Switching Transition to CardsSequence (matching HeroWater -> OrbSequence)
      // As CardsSequence slides up over the end of this pinned section (-100vh),
      // The Friction content shifts up smoothly and fades out with a soft dissolve
      if (frictionRef.current) {
        tl.to(frictionRef.current, {
          y: '-18vh',
          opacity: 0,
          filter: 'blur(6px)',
          duration: 1.0,
          ease: 'power2.inOut'
        });
      }

      if (gradientsRef.current) {
        tl.to(gradientsRef.current, {
          opacity: 0,
          duration: 1.0,
          ease: 'power2.inOut'
        }, "<");
      }

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, containerRef);

    // Refresh ScrollTrigger positioning
    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      updateGradientPositions();
    });

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ backgroundColor: '#101236', margin: 0, padding: 0 }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundColor: '#101236',
          overflow: 'hidden'
        }}
      >
        {/* Gradients from The Friction (initially hidden) */}
        <div
          ref={gradientsRef}
          style={{
            opacity: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
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
            background: 'radial-gradient(ellipse at center, rgba(197, 219, 255, 0.6) 0%, rgba(204, 150, 255, 0.4) 30%, rgba(16, 18, 54, 0) 70%)',
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
            background: 'radial-gradient(ellipse at center, rgba(255, 230, 217, 0.6) 0%, rgba(131, 192, 255, 0.4) 30%, rgba(16, 18, 54, 0) 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }} />
        </div>

        {/* Canvas for the orb-to-logo frame sequence */}
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
            pointerEvents: 'auto',
            padding: '2rem 1.5rem',
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            textAlign: 'center',
            maxWidth: '1000px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* 1. Eyebrow label */}
            <div
              className="friction-eyebrow"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: 'clamp(1rem, 2vh, 1.75rem)',
                willChange: 'filter, opacity, transform',
                filter: isReducedMotion ? 'none' : 'blur(8px)',
                opacity: isReducedMotion ? 1 : 0,
                transform: isReducedMotion ? 'none' : 'translateY(15px)',
              }}
            >
              THE FRICTION
            </div>

            {/* 2 & 3. Headline */}
            <h2
              aria-label="The market went deaf. Most brands keep whispering."
              style={{
                margin: '0 0 clamp(1.25rem, 2.5vh, 2rem) 0',
                fontSize: 'clamp(2.4rem, 6.5vw, 6rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.02em',
                textAlign: 'center'
              }}
            >
              {/* Headline line 1: pink→orange→purple gradient text */}
              <span
                ref={line1Ref}
                style={{ display: 'inline-block', position: 'relative' }}
              >
                {line1Words.map((word, idx) => (
                  <React.Fragment key={idx}>
                    <span
                      className="word word-gradient line1-word"
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(90deg, #FF7A00 0%, #FF2E93 50%, #9B51E0 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent',
                        willChange: 'filter, opacity, transform',
                        filter: isReducedMotion ? 'none' : `blur(${blurVal}px)`,
                        opacity: isReducedMotion ? 1 : 0.15,
                        transform: isReducedMotion ? 'none' : 'translateY(20px)',
                      }}
                    >
                      {word}
                    </span>
                    {idx < line1Words.length - 1 && ' '}
                  </React.Fragment>
                ))}
              </span>
              <br />
              {/* Headline line 2: muted lavender/purple */}
              <span style={{ display: 'inline-block' }}>
                {line2Words.map((word, idx) => (
                  <React.Fragment key={idx}>
                    <span
                      className="word line2-word"
                      style={{
                        display: 'inline-block',
                        color: '#9896C5',
                        willChange: 'filter, opacity, transform',
                        filter: isReducedMotion ? 'none' : `blur(${blurVal}px)`,
                        opacity: isReducedMotion ? 1 : 0.15,
                        transform: isReducedMotion ? 'none' : 'translateY(20px)',
                      }}
                    >
                      {word}
                    </span>
                    {idx < line2Words.length - 1 && ' '}
                  </React.Fragment>
                ))}
              </span>
            </h2>

            {/* 4. Paragraph */}
            <p
              aria-label="Attention is the only currency left, and blending in is the only real risk. AURÉ exists to make brands impossible to ignore."
              style={{
                margin: '0 auto clamp(1.75rem, 3.5vh, 2.75rem)',
                maxWidth: '520px',
                width: '90%',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 300,
                fontSize: 'clamp(15px, 1.25vw, 18px)',
                lineHeight: 1.5,
                letterSpacing: '-0.02em',
                textAlign: 'center',
                color: '#AFB1DE'
              }}
            >
              {paragraphWords.map((word, idx) => {
                const isAure = word.includes('AURÉ');
                return (
                  <React.Fragment key={idx}>
                    <span
                      className="word paragraph-word"
                      style={{
                        display: 'inline-block',
                        color: isAure ? '#FF2E93' : '#AFB1DE',
                        fontWeight: isAure ? 600 : 300,
                        willChange: 'filter, opacity, transform',
                        filter: isReducedMotion ? 'none' : `blur(${blurVal}px)`,
                        opacity: isReducedMotion ? 1 : 0.15,
                        transform: isReducedMotion ? 'none' : 'translateY(20px)',
                      }}
                    >
                      {word}
                    </span>
                    {idx < paragraphWords.length - 1 && ' '}
                  </React.Fragment>
                );
              })}
            </p>

            {/* 5. Stats Row: 3 columns */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(2rem, 6vw, 6rem)',
              flexWrap: 'wrap',
              margin: '0 auto',
              fontFamily: '"Poppins", sans-serif'
            }}>
              {stats.map((stat, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div
                    className="stat-item"
                    style={{
                      fontSize: 'clamp(2.2rem, 3.5vw, 2.8rem)',
                      fontWeight: 800,
                      color: '#fff',
                      marginBottom: '0.4rem',
                      lineHeight: 1,
                      willChange: 'filter, opacity, transform',
                      filter: isReducedMotion ? 'none' : `blur(${blurVal}px)`,
                      opacity: isReducedMotion ? 1 : 0.15,
                      transform: isReducedMotion ? 'none' : 'translateY(20px)',
                    }}
                  >
                    {stat.num}
                  </div>
                  <div
                    className="stat-item"
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      color: 'rgba(255, 255, 255, 0.5)',
                      willChange: 'filter, opacity, transform',
                      filter: isReducedMotion ? 'none' : `blur(${blurVal}px)`,
                      opacity: isReducedMotion ? 1 : 0.15,
                      transform: isReducedMotion ? 'none' : 'translateY(20px)',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Header Overlay Spacer */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          padding: '2.5rem 3rem',
          boxSizing: 'border-box',
          zIndex: 10,
          pointerEvents: 'none'
        }} />
      </div>
    </div>
  );
}
