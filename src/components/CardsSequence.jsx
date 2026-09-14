import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CardsSequence() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  const cards = [
    '/cards/card1.png',
    '/cards/card2.png',
    '/cards/card3.png',
    '/cards/card4.png'
  ];

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const container = containerRef.current;
      const cardsElements = gsap.utils.toArray('.card-element');

      // 1. Entrance Animation (3D Diagonal Entry)
      gsap.fromTo(cardsElements, 
        { 
          x: 100, 
          y: 80, 
          z: -50,
          rotationY: -15,
          rotationX: 10,
          scale: 1, 
          opacity: 0, 
          filter: 'blur(8px) grayscale(80%)' 
        },
        {
          x: 0,
          y: 0,
          z: 0,
          rotationY: 0,
          rotationX: 0,
          opacity: (i) => i === 0 ? 1 : 0.5,
          scale: (i) => i === 0 ? 1.05 : 1,
          filter: (i) => i === 0 ? 'blur(0px) grayscale(0%)' : 'blur(8px) grayscale(80%)',
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%", // Start entrance before it pins
          }
        }
      );

      // 2. Horizontal Scroll & Focus Shift Animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${container.scrollWidth}`, // scroll distance
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        }
      });

      // Background transition from Frosted Glass to Solid White
      tl.to('.bg-solid', { opacity: 1, duration: 1, ease: 'none' }, 0);
      tl.to('.bg-transition', { opacity: 0, duration: 1, ease: 'none' }, 0);

      // Horizontal scrolling movement
      const moveDuration = cards.length * 2; 
      tl.to(container, {
        x: () => -(container.scrollWidth - window.innerWidth),
        ease: "none",
        duration: moveDuration
      }, 0);

      // Focus & Blur Behavior during scroll
      cardsElements.forEach((card, i) => {
        if (i === 0) {
          // First card loses focus as it moves away
          tl.to(card, {
            scale: 1,
            filter: 'blur(8px) grayscale(80%)',
            opacity: 0.5,
            duration: 1.5,
            ease: "power2.inOut"
          }, 0);
        } else {
          // Other cards gain focus when they reach the active position, then lose it
          const startUnblur = (i * 2) - 0.5; // Gain focus
          const startBlur = (i * 2) + 1.5;   // Lose focus (optional if we want only 1 active at a time)
          
          tl.to(card, {
            scale: 1.05,
            filter: 'blur(0px) grayscale(0%)',
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
          }, startUnblur);
          
          // Only blur out if it's not the last card
          if (i !== cardsElements.length - 1) {
            tl.to(card, {
              scale: 1,
              filter: 'blur(8px) grayscale(80%)',
              opacity: 0.5,
              duration: 1.5,
              ease: "power2.in"
            }, startBlur);
          }
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        backgroundColor: 'transparent',
        overflow: 'hidden',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Background layers */}
      <div
        className="bg-solid"
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          zIndex: -2,
          backgroundColor: '#FFFFFF',
          opacity: 0,
        }}
      />
      <div
        className="bg-transition"
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          zIndex: -1,
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.95) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />

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

      {/* Fixed Centered Text Content */}
      <div style={{
        textAlign: 'center',
        paddingTop: '6vh', // Reduced top padding to leave more room for cards below
        flexShrink: 0,
        position: 'relative',
        zIndex: 5
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#999',
          marginBottom: '1.5rem'
        }}>
          THE ARSENAL
        </div>
        <h2 style={{
          margin: 0,
          fontSize: 'clamp(2.5rem, min(6vw, 7vh), 6.5rem)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.04em',
          color: '#111'
        }}>
          Everything a<br />
          <span style={{
            background: 'linear-gradient(90deg, #FF7A00 0%, #FF2E93 50%, #9B51E0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            paddingRight: '0.05em' // prevent gradient clipping on some browsers
          }}>movement</span> needs.
        </h2>
        <p style={{
          margin: '2vh auto 0',
          fontSize: 'clamp(14px, 2vh, 17px)',
          color: '#777',
          fontWeight: 400,
          maxWidth: '500px'
        }}>
          Four focused pillars one team, end to end.
        </p>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div style={{
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        paddingBottom: '4vh'
      }}>
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            gap: '3rem', // Increased gap to accommodate scale(1.05) without overlap
            padding: '0 10vw', // Added more side padding so scaled cards have breathing room
            height: '45vh', // Reduced slightly to guarantee fit within 100vh
            perspective: '1000px' // Ensure 3D rotations render with proper depth perspective
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className="card-element"
              style={{
                flexShrink: 0,
                width: '24vw',
                minWidth: '300px',
                height: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                transformStyle: 'preserve-3d', // Help with nested elements inside 3D transforms
              }}
            >
              <img
                src={card}
                alt={`Work ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
          {/* Spacer at the end to allow scrolling past the last card */}
          <div style={{ flexShrink: 0, width: '5vw' }}></div>
        </div>
      </div>
    </div>
  );
}
