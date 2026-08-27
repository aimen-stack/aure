import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ExplorationSequence() {
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
          refreshPriority: -1,
        }
      });

      tl.to(container, {
        x: () => -(container.scrollWidth - window.innerWidth),
        ease: "none",
      });

    }, sectionRef);

    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  const cards = [
    '/exploration-card/card1.png',
    '/exploration-card/card2.png'
  ];

  return (
    <div 
      ref={sectionRef} 
      style={{
        background: 'linear-gradient(135deg, #F3695F 0%, #F53A7B 30%, #462479 70%, #15112E 100%)', // Vibrant warm to dark purple gradient
        overflow: 'hidden',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Fixed Intro Text Block with Background Orb */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '45vw',
        minWidth: '500px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: '#fff',
        paddingLeft: '5vw',
        paddingRight: '5vw',
        zIndex: 10,
        pointerEvents: 'none' // Allows clicking through to cards if they overlap
      }}>
        {/* Background Orb image fixed behind the text */}
        <img 
          src="/orbimages/ezgif-frame-001.png"
          alt="Orb Background"
          style={{
            position: 'absolute',
            top: '50%',
            left: '60%', // Position it towards the right of the text block
            transform: 'translate(-50%, -50%)',
            width: '180%',
            minWidth: '900px',
            opacity: 0.8,
            zIndex: -1,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            filter: 'saturate(1.2)' // Keep colors mostly natural to blend with the vibrant background
          }}
        />

        <div style={{ 
          fontSize: '11px', 
          fontWeight: 700, 
          letterSpacing: '0.15em', 
          textTransform: 'uppercase', 
          marginBottom: '1rem',
          color: 'rgba(255,255,255,0.9)'
        }}>
          PROOF
        </div>
        <h2 style={{
          fontSize: 'clamp(3.5rem, 6vw, 5rem)',
          fontWeight: 800,
          lineHeight: 1,
          margin: '0 0 1.5rem 0',
          letterSpacing: '-0.04em',
        }}>
          Selected work<br/>& explorations
        </h2>
        <p style={{
          fontSize: '15px',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '3rem',
          letterSpacing: '0.01em',
          fontWeight: 400
        }}>
          Four focused pillars one team, end to end.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '3rem' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>120+</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>BRANDS MOVED</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>200+</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>CAMPAIGNS SHIPPED</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>15+</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>AWARDS</div>
          </div>
        </div>
      </div>

      {/* The Scrolling Cards */}
      <div 
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          paddingLeft: '45vw', // Start cards exactly after the fixed text block
          width: 'max-content'
        }}
      >
        <div style={{ 
          display: 'flex', 
          gap: '4rem', 
          height: '65vh', 
          alignItems: 'center',
          paddingRight: '5vw'
        }}>
          {cards.map((card, index) => (
            <div 
              key={index}
              style={{
                flexShrink: 0,
                width: '50vw',
                minWidth: '600px',
                height: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#120F20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px', // Creates the inset border effect from the screenshot
                transform: 'translateZ(0)' // Hardware acceleration
              }}
            >
              <img 
                src={card} 
                alt={`Exploration ${index + 1}`} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
