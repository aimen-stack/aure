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

  const [activeIndex, setActiveIndex] = useState(2);
  const navigate = useNavigate();

  // Handle Swipe and Drag
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    touchStartX.current = e.clientX || (e.touches && e.touches[0].clientX);
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const currentX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
    const diff = currentX - touchStartX.current;

    if (diff < -50) {
      // Swiped left -> next card
      setActiveIndex(prev => Math.min(prev + 1, projectData.length - 1));
    } else if (diff > 50) {
      // Swiped right -> prev card
      setActiveIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const handleExploreClick = () => {
    navigate('/portfolio-details', { state: { activeIndex } });
  };

  // Setup initial entrance animations
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {

      // Intro animation for background text
      gsap.fromTo(bgTextRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 0.05, scale: 1, duration: 1.5, ease: "power2.out", scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%"
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

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Animate cards whenever activeIndex changes
  useEffect(() => {
    let ctx = gsap.context(() => {

      // Animate text content fade out / in
      gsap.to(textContentRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        onComplete: () => {
          gsap.to(textContentRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
        }
      });

      // Animate cards to their new positions
      cardsRef.current.forEach((card, i) => {
        const diff = i - activeIndex;

        let xPercent = 0;
        let z = 0;
        let rotationY = 0;
        let scale = 1;
        let zIndex = 0;
        let opacity = 1;
        let glow = false;

        if (diff === 0) {
          xPercent = 0; z = 50; rotationY = 0; scale = 1.05; zIndex = 5; glow = true;
        } else if (diff === 1) {
          xPercent = 70; z = -200; rotationY = -20; scale = 0.95; zIndex = 4;
        } else if (diff === -1) {
          xPercent = -70; z = -200; rotationY = 20; scale = 0.95; zIndex = 4;
        } else if (diff === 2) {
          xPercent = 140; z = -400; rotationY = -35; scale = 0.85; zIndex = 3;
        } else if (diff === -2) {
          xPercent = -140; z = -400; rotationY = 35; scale = 0.85; zIndex = 3;
        } else if (diff > 2) {
          xPercent = 180; z = -600; rotationY = -45; scale = 0.7; zIndex = 1; opacity = 0;
        } else if (diff < -2) {
          xPercent = -180; z = -600; rotationY = 45; scale = 0.7; zIndex = 1; opacity = 0;
        }

        gsap.to(card, {
          xPercent,
          z,
          rotationY,
          scale,
          opacity,
          zIndex,
          duration: 0.8,
          ease: "power3.out"
        });

        // Toggle glow styles
        const innerImgContainer = card.querySelector('.inner-img-container');
        if (glow) {
          gsap.to(card, { padding: '4px', background: 'linear-gradient(135deg, #FF8A00, #FF2E93, #9B51E0)', boxShadow: '0 0 40px rgba(255, 46, 147, 0.4), 0 30px 60px rgba(0,0,0,0.8)', duration: 0.4 });
          gsap.to(innerImgContainer, { borderRadius: '20px', border: 'none', duration: 0.4 });
        } else {
          gsap.to(card, { padding: '0px', background: 'transparent', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', duration: 0.4 });
          gsap.to(innerImgContainer, { borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', duration: 0.4 });
        }
      });

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
          position: 'relative',
          zIndex: 2,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1500px',
          padding: '8vh 0',
          touchAction: 'pan-y'
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
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

        {/* Cards Container */}
        <div
          ref={containerRef}
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
            cursor: 'grab'
          }}
        >
          {projectData.map((card, i) => (
            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              onClick={(e) => {
                // If clicking a side card, make it active. If clicking center card, zoom in!
                if (i !== activeIndex) {
                  setActiveIndex(i);
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
                cursor: 'pointer'
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
          marginBottom: '6vh'
        }}>
          {projectData.map((_, i) => (
            <div
              key={i}
              onClick={() => setActiveIndex(i)}
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
          Swipe or Click to explore
          <div style={{ marginTop: '4px', opacity: 0.7 }}>↔</div>
        </div>

      </div>
    </>
  );
}
