import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';
import { projectData } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioSection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const textContentRef = useRef(null);
  const bgTextRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const handleExploreClick = () => {
    navigate('/portfolio-details', { state: { activeIndex } });
  };

  // Compute 3D layout properties for any card relative to active position (supports continuous fractional diffs)
  const getCardProps = (diff) => {
    const absDiff = Math.abs(diff);
    const sign = Math.sign(diff) || 0;

    let xPercent = 0;
    let z = 0;
    let rotationY = 0;
    let scale = 1;
    let zIndex = 5;
    let opacity = 1;
    let glow = false;

    if (absDiff <= 1) {
      xPercent = sign * absDiff * 70;
      z = 50 - absDiff * 250;
      rotationY = -sign * absDiff * 20;
      scale = 1.05 - absDiff * 0.1;
      zIndex = Math.round(5 - absDiff);
      opacity = 1;
      glow = absDiff < 0.35;
    } else if (absDiff <= 2) {
      const t = absDiff - 1; // 0 to 1
      xPercent = sign * (70 + t * 70);
      z = -200 - t * 200;
      rotationY = -sign * (20 + t * 15);
      scale = 0.95 - t * 0.1;
      zIndex = Math.round(4 - t);
      opacity = 1;
      glow = false;
    } else {
      const t = Math.min(1, absDiff - 2); // 0 to 1
      xPercent = sign * (140 + t * 40);
      z = -400 - t * 200;
      rotationY = -sign * (35 + t * 10);
      scale = 0.85 - t * 0.15;
      zIndex = 1;
      opacity = Math.max(0, 1 - t * 1.5);
      glow = false;
    }

    return { xPercent, z, rotationY, scale, zIndex, opacity, glow };
  };

  // Animate cards cleanly to a target index with GSAP
  const animateCards = (targetIndex, duration = 0.75) => {
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const diff = i - targetIndex;
      const props = getCardProps(diff);

      gsap.to(card, {
        xPercent: props.xPercent,
        z: props.z,
        rotationY: props.rotationY,
        scale: props.scale,
        opacity: props.opacity,
        zIndex: props.zIndex,
        duration: duration,
        ease: "power3.out",
        overwrite: "auto"
      });

      const innerImgContainer = card.querySelector('.inner-img-container');
      if (props.glow) {
        gsap.to(card, {
          padding: '4px',
          background: 'linear-gradient(135deg, #FF8A00, #FF2E93, #9B51E0)',
          boxShadow: '0 0 40px rgba(255, 46, 147, 0.4), 0 30px 60px rgba(0,0,0,0.8)',
          duration: 0.35,
          overwrite: "auto"
        });
        if (innerImgContainer) {
          gsap.to(innerImgContainer, { borderRadius: '20px', border: 'none', duration: 0.35, overwrite: "auto" });
        }
      } else {
        gsap.to(card, {
          padding: '0px',
          background: 'transparent',
          boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
          duration: 0.35,
          overwrite: "auto"
        });
        if (innerImgContainer) {
          gsap.to(innerImgContainer, { borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', duration: 0.35, overwrite: "auto" });
        }
      }
    });
  };

  // Programmatic index changer that synchronizes ScrollTrigger scroll position
  const changeActiveIndex = (newIndex) => {
    const clampedIndex = Math.max(0, Math.min(projectData.length - 1, newIndex));
    if (clampedIndex === activeIndexRef.current) return;
    activeIndexRef.current = clampedIndex;
    setActiveIndex(clampedIndex);

    const st = scrollTriggerRef.current;
    if (st && st.start !== undefined) {
      isProgrammaticScrollRef.current = true;
      const targetScroll = st.start + (clampedIndex / (projectData.length - 1)) * (st.end - st.start);
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 700);
    }
  };

  // Drag and Swipe Handlers
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    // If clicking an arrow button, do not capture pointer or start drag
    if (e.target.closest('button') || e.target.closest('.nav-arrow')) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartTimeRef.current = Date.now();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;

    // Detect if this is mostly a vertical gesture before drag has initiated
    if (!hasDraggedRef.current && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
      return;
    }

    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
    }

    if (!hasDraggedRef.current) return;

    // Resistance when dragging beyond first or last project
    let effectiveDeltaX = deltaX;
    const currIndex = activeIndexRef.current;
    if ((currIndex === 0 && deltaX > 0) || (currIndex === projectData.length - 1 && deltaX < 0)) {
      effectiveDeltaX = deltaX * 0.28;
    }

    const cardSpacing = Math.min(window.innerWidth * 0.28, 320);
    const dragFraction = effectiveDeltaX / cardSpacing;
    const virtualIndex = currIndex - dragFraction;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const diff = i - virtualIndex;
      const props = getCardProps(diff);

      gsap.set(card, {
        xPercent: props.xPercent,
        z: props.z,
        rotationY: props.rotationY,
        scale: props.scale,
        opacity: props.opacity,
        zIndex: props.zIndex
      });

      const innerImgContainer = card.querySelector('.inner-img-container');
      if (props.glow) {
        card.style.padding = '4px';
        card.style.background = 'linear-gradient(135deg, #FF8A00, #FF2E93, #9B51E0)';
        card.style.boxShadow = '0 0 40px rgba(255, 46, 147, 0.4), 0 30px 60px rgba(0,0,0,0.8)';
        if (innerImgContainer) {
          innerImgContainer.style.borderRadius = '20px';
          innerImgContainer.style.border = 'none';
        }
      } else {
        card.style.padding = '0px';
        card.style.background = 'transparent';
        card.style.boxShadow = '0 30px 60px rgba(0,0,0,0.8)';
        if (innerImgContainer) {
          innerImgContainer.style.borderRadius = '24px';
          innerImgContainer.style.border = '1px solid rgba(255,255,255,0.1)';
        }
      }
    });
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const deltaX = e.clientX - dragStartXRef.current;
    const deltaTime = Math.max(1, Date.now() - dragStartTimeRef.current);
    const velocity = deltaX / deltaTime;

    const currIndex = activeIndexRef.current;
    let stepChange = 0;

    if (Math.abs(deltaX) > 40 || Math.abs(velocity) > 0.3) {
      if (Math.abs(deltaX) > 160) {
        stepChange = Math.round(-deltaX / 180);
      } else {
        stepChange = deltaX < 0 ? 1 : -1;
      }
    }

    const nextIndex = Math.max(0, Math.min(projectData.length - 1, currIndex + stepChange));

    if (nextIndex !== currIndex) {
      changeActiveIndex(nextIndex);
    } else {
      animateCards(currIndex, 0.45);
    }

    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 120);
  };

  const handlePointerCancel = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    animateCards(activeIndexRef.current, 0.45);
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 120);
  };

  // Setup initial entrance animations & ScrollTrigger pinning
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {

      // Intro animation for background text
      gsap.fromTo(bgTextRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 0.05, scale: 1, duration: 1.5, ease: "power2.out", scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            refreshPriority: -2
          }
        }
      );

      // Continuous floating animation for all cards
      cardsRef.current.forEach((card, i) => {
        gsap.to(card, {
          y: "+=12",
          rotationZ: i % 2 === 0 ? 1 : -1,
          yoyo: true,
          repeat: -1,
          duration: 2 + i * 0.15,
          ease: "sine.inOut"
        });
      });

      // Pin the section and map scroll progress to activeIndex
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${projectData.length * 800}`, // The more items, the longer the scroll
        pin: true,
        scrub: true,
        refreshPriority: -2,
        onUpdate: (self) => {
          if (isDraggingRef.current || isProgrammaticScrollRef.current) return;
          const progress = self.progress;
          let newIndex = Math.round(progress * (projectData.length - 1));
          newIndex = Math.max(0, Math.min(newIndex, projectData.length - 1));
          
          setActiveIndex((prevIndex) => {
            if (prevIndex !== newIndex) {
              return newIndex;
            }
            return prevIndex;
          });
        }
      });

      scrollTriggerRef.current = st;

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Keyboard navigation support (Left / Right Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeActiveIndex(activeIndexRef.current - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        changeActiveIndex(activeIndexRef.current + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Animate cards whenever activeIndex changes
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Animate text content fade out / in
      gsap.to(textContentRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.18,
        onComplete: () => {
          gsap.to(textContentRef.current, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
        }
      });

      animateCards(activeIndex, 0.75);
    }, containerRef);
    return () => ctx.revert();
  }, [activeIndex]);

  const activeData = projectData[activeIndex];

  return (
    <>
      {/* Main Portfolio Layout */}
      <div
        ref={sectionRef}
        style={{
          backgroundColor: '#030305',
          overflow: 'hidden',
          width: '100vw',
          height: '100vh',
          position: 'relative',
          zIndex: 2,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1500px',
        }}
      >
        {/* Dynamic Background Glow */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '50%',
          height: '60%',
          background: 'radial-gradient(ellipse at bottom left, rgba(0, 50, 255, 0.4), transparent 60%)',
          zIndex: 1,
          pointerEvents: 'none',
          mixBlendMode: 'screen'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '50%',
          height: '60%',
          background: 'radial-gradient(ellipse at bottom right, rgba(255, 0, 100, 0.4), transparent 60%)',
          zIndex: 1,
          pointerEvents: 'none',
          mixBlendMode: 'screen'
        }} />

        {/* Giant Background Text */}
        <div
          ref={bgTextRef}
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '24vw',
            fontWeight: 900,
            color: '#fff',
            whiteSpace: 'nowrap',
            zIndex: 1,
            pointerEvents: 'none',
            letterSpacing: '-0.02em',
            userSelect: 'none'
          }}
        >
          Featured
        </div>

        {/* Header */}
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 10, pointerEvents: 'none', marginTop: '2vh' }}>
          <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Proof</div>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 900,
            margin: 0,
            background: 'linear-gradient(90deg, #FF8A00 0%, #FF2E93 50%, #9B51E0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
            letterSpacing: '-0.02em'
          }}>Our Portfolio</h2>
          <p style={{ color: '#ccc', fontSize: '1.2rem', marginTop: '12px', fontWeight: 400 }}>Four focused pillars one team, end to end.</p>
        </div>

        {/* Cards Container with Drag and Swipe Support */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            position: 'relative',
            width: '100%',
            height: '48vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            margin: '8vh 0 4vh 0',
            transformStyle: 'preserve-3d',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'pan-y'
          }}
        >
          {/* Previous Arrow Button */}
          {activeIndex > 0 && (
            <button
              type="button"
              className="nav-arrow"
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeActiveIndex(activeIndex - 1);
              }}
              aria-label="Previous Project"
              style={{
                position: 'absolute',
                left: 'clamp(1rem, 5vw, 4rem)',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 60,
                transition: 'all 0.25s ease',
                boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
                pointerEvents: 'auto'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 46, 147, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(255, 46, 147, 0.8)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 46, 147, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.6)';
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          {/* Next Arrow Button */}
          {activeIndex < projectData.length - 1 && (
            <button
              type="button"
              className="nav-arrow"
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeActiveIndex(activeIndex + 1);
              }}
              aria-label="Next Project"
              style={{
                position: 'absolute',
                right: 'clamp(1rem, 5vw, 4rem)',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 60,
                transition: 'all 0.25s ease',
                boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
                pointerEvents: 'auto'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 46, 147, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(255, 46, 147, 0.8)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 46, 147, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.6)';
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}

          {projectData.map((card, i) => (
            <div
              key={i}
              ref={el => (cardsRef.current[i] = el)}
              onClick={(e) => {
                if (hasDraggedRef.current) {
                  e.stopPropagation();
                  return;
                }
                if (i !== activeIndex) {
                  changeActiveIndex(i);
                } else {
                  handleExploreClick();
                }
              }}
              style={{
                position: 'absolute',
                width: '22vw',
                minWidth: '240px',
                maxWidth: '320px',
                aspectRatio: '3.2/4',
                borderRadius: '24px',
                transformStyle: 'preserve-3d',
                boxSizing: 'border-box',
                cursor: isDragging ? 'grabbing' : 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              <div className="inner-img-container" style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: '#111',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <img src={card.src} alt={`Project ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div style={{
          position: 'relative',
          display: 'flex',
          gap: '12px',
          zIndex: 10,
          marginTop: '6vh',
          marginBottom: '2vh'
        }}>
          {projectData.map((_, i) => (
            <div
              key={i}
              onClick={() => changeActiveIndex(i)}
              style={{
                width: activeIndex === i ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: activeIndex === i ? '#FF2E93' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Footer Details - Dynamic Text */}
        <div
          ref={textContentRef}
          style={{
            position: 'relative',
            width: '90%',
            maxWidth: '1200px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            zIndex: 10,
            color: '#fff',
            pointerEvents: 'none',
            marginBottom: '2vh'
          }}
        >
          {/* Left Quote */}
          <div style={{ flex: '1', maxWidth: '320px', paddingRight: '20px' }}>
            <div style={{ color: '#FF2E93', fontSize: '3rem', fontFamily: 'serif', lineHeight: 0.5, marginBottom: '15px' }}>"</div>
            <p style={{ fontSize: '1rem', color: '#e0e0e0', fontStyle: 'italic', lineHeight: 1.5 }}>
              {activeData.quote}
            </p>
            <div style={{
              marginTop: '20px',
              color: '#FF2E93',
              fontWeight: '900',
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              display: 'inline-block',
              borderBottom: '2px solid #FF2E93',
              paddingBottom: '2px'
            }}>
              {activeData.ceo}
            </div>
          </div>

          {/* Center Title */}
          <div style={{ flex: '1', textAlign: 'center', padding: '0 20px' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>{activeData.title}</h3>
            <p style={{ color: '#ccc', fontSize: '1.1rem', margin: 0 }}>{activeData.subtitle}</p>
          </div>

          {/* Right Info */}
          <div style={{ flex: '1', maxWidth: '320px', paddingLeft: '20px', pointerEvents: 'auto' }}>
            <Link to="/projects" style={{
              color: '#fff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: '600',
              borderBottom: '1px solid rgba(255,255,255,0.3)',
              paddingBottom: '12px',
              marginBottom: '15px',
              transition: 'border-color 0.3s'
            }}>
              See All Project
              <span style={{ color: '#FF2E93', fontWeight: '300', fontSize: '1.2rem' }}>→</span>
            </Link>
            <p style={{ fontSize: '1rem', color: '#e0e0e0', lineHeight: 1.5 }}>
              {activeData.desc}
            </p>
          </div>
        </div>

        {/* Interaction indicator */}
        <div
          onClick={handleExploreClick}
          style={{
            position: 'relative',
            textAlign: 'center',
            color: '#888',
            fontSize: '0.75rem',
            zIndex: 10,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'color 0.3s',
            padding: '10px'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
          onMouseOut={(e) => e.currentTarget.style.color = '#888'}
        >
          Drag, Swipe or Click to explore
          <div style={{ marginTop: '4px', opacity: 0.7 }}>↔</div>
        </div>

      </div>
    </>
  );
}
