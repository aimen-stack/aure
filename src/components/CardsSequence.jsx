import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './Header';

gsap.registerPlugin(ScrollTrigger);

export default function CardsSequence() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const container = containerRef.current;

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

      tl.to(container, {
        x: () => -(container.scrollWidth - window.innerWidth),
        ease: "none",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const cards = [
    '/cards/card1.png',
    '/cards/card2.png',
    '/cards/card3.png',
    '/cards/card4.png'
  ];

  return (
    <div
      ref={sectionRef}
      style={{
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        height: '120vh', // Increased section length to prevent cropping
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
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
        <Header />
      </div>

      {/* Fixed Centered Text Content */}
      <div style={{
        textAlign: 'center',
        paddingTop: '10vh', // Reduced top padding so there is more room at the bottom
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
          fontSize: 'clamp(3.5rem, 7vw, 6.5rem)',
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
          margin: '2rem auto 0',
          fontSize: '17px',
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
            gap: '2rem',
            padding: '0 5vw',
            height: '55vh'
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                flexShrink: 0,
                width: '24vw',
                minWidth: '300px',
                height: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)', // Softer shadow for white bg
                transform: 'translateZ(0)' // Hardware acceleration
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
