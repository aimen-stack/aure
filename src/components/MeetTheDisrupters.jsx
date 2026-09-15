import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

export default function MeetTheDisrupters() {
  const sectionRef = useRef(null);
  const mainTextRef = useRef(null);
  const subTextRef = useRef(null);
  const persistentTextRef = useRef(null);
  const cardsRef = useRef([]);
  const orbRef = useRef(null);

  const team = [
    { src: '/team/faisal.png', name: 'Faisal Munir', role: 'Strategist', top: '35%', left: '35%', rot: -6 },
    { src: '/team/aimen.png', name: 'Aimen', role: 'Engineer', top: '65%', left: '45%', rot: -2 },
    { src: '/team/Eiraj.png', name: 'Eiraj Munis', role: 'Animator', top: '45%', left: '80%', rot: 4 }
  ];

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=600%", // Increased duration to make the overall scroll much slower
          pin: true,
          scrub: 1,
          refreshPriority: -2,
        }
      });

      // Initialize positions and states with GSAP
      gsap.set(mainTextRef.current, { opacity: 0, scale: 0.8, xPercent: -50, yPercent: -50, y: '100vh', filter: 'blur(20px)' });
      gsap.set(subTextRef.current, { opacity: 0, scale: 0.8, xPercent: -50, yPercent: -50, y: '100vh', filter: 'blur(20px)' });
      gsap.set(persistentTextRef.current, { opacity: 0, y: '100vh', filter: 'blur(10px)' });

      cardsRef.current.forEach((card, i) => {
        gsap.set(card, {
          opacity: 0,
          scale: 0.6,
          y: '100vh', // Starts completely off-screen at the bottom
          filter: 'blur(15px)',
          xPercent: -50,
          yPercent: -50,
          rotation: team[i].rot,
          zIndex: 10
        });
      });

      // Animate background orb slowly throughout the entire pinned section
      tl.to(orbRef.current, {
        y: '-40vh',
        x: '-10vw',
        rotation: 30,
        scale: 1.2,
        duration: 25,
        ease: 'none'
      }, 0);

      // 1. mainText animates from bottom to center
      tl.to(mainTextRef.current, { y: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 2, ease: 'power2.out' }, 0); 
      // hold in center, then exit to left
      tl.to(mainTextRef.current, { x: '-60vw', opacity: 0, filter: 'blur(10px)', duration: 4, ease: 'power2.inOut' }, 2); 

      // 2. subText enters from bottom to center while mainText moves left
      tl.to(subTextRef.current, { y: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 2, ease: 'power2.out' }, 2.5);
      // hold in center, then exit to left
      tl.to(subTextRef.current, { x: '-60vw', opacity: 0, filter: 'blur(10px)', duration: 3, ease: 'power2.inOut' }, 4.5);

      // 3. Persistent text enters as cards enter
      tl.to(persistentTextRef.current, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 2, ease: 'power2.out' }, 7);

      // 4. Cards continuously move up from 100vh to -100vh
      cardsRef.current.forEach((card, i) => {
        const startTime = 8 + (i * 4); // staggered by 4
        
        const driftX = (Math.random() - 0.5) * 20;
        const driftY = (Math.random() - 0.5) * 20;

        // Continuous upward motion spanning 8 duration units
        tl.to(card, {
          y: '-100vh',
          xPercent: -50 + driftX,
          yPercent: -50 + driftY,
          duration: 8,
          ease: 'none'
        }, startTime);

        // Fade in and scale to normal
        tl.to(card, {
          filter: 'blur(0px)',
          opacity: 1,
          scale: 1,
          rotation: team[i].rot * 1.5,
          zIndex: 20,
          duration: 2.5,
          ease: 'power2.out'
        }, startTime);

        // Start blurring exactly as it crosses the center (startTime + 4.0)
        tl.to(card, {
          filter: 'blur(15px)', // slightly stronger blur for visibility
          duration: 2,
          ease: 'none' // linear so it starts blurring immediately
        }, startTime + 4.0);

        // Fade out completely as it exits
        tl.to(card, {
          opacity: 0,
          scale: 0.8,
          rotation: team[i].rot,
          duration: 2.5,
          ease: 'power2.in'
        }, startTime + 5.5);
      });

    }, sectionRef);

    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        backgroundColor: '#030305', // Very dark, almost black
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
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
        zIndex: 50,
        pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto' }}>

        </div>
      </div>

      {/* Background Orb - subtle and dark */}
      <img
        ref={orbRef}
        src="/orb.png"
        alt="Dark Orb"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          minWidth: '800px',
          opacity: 0.4,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          zIndex: 1
        }}
      />

      {/* Main Intro Text */}
      <div
        ref={mainTextRef}
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          textAlign: 'center',
          color: '#fff',
          width: '100%',
          zIndex: 5
        }}
      >
        <div style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          marginBottom: '-0.5rem'
        }}>
          Meet the
        </div>
        <div style={{
          fontSize: 'clamp(4rem, 8vw, 8rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(90deg, #FF8A00 0%, #FF2E93 50%, #9B51E0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          lineHeight: 1.1
        }}>
          DISRUPTERS.
        </div>
      </div>

      {/* Subtext */}
      <div
        ref={subTextRef}
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          textAlign: 'center',
          color: '#fff',
          width: '100%',
          zIndex: 5
        }}
      >
        <p style={{
          fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
          color: 'rgba(255,255,255,0.9)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.5,
          fontWeight: 500
        }}>
          Strategists, animators, engineers and troublemakers under one roof.
        </p>
      </div>

      {/* Persistent Text for Cards Section */}
      <div
        ref={persistentTextRef}
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '30%',
          minWidth: '300px',
          color: '#fff',
          zIndex: 5,
          textAlign: 'left'
        }}
      >
        <p style={{
          fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)',
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.4,
          fontWeight: 400,
          margin: 0
        }}>
          Strategists, animators,<br />
          engineers and troublemakers<br />
          under one roof.
        </p>
      </div>

      {/* Team Cards */}
      {team.map((person, i) => (
        <div
          key={i}
          ref={el => cardsRef.current[i] = el}
          style={{
            position: 'absolute',
            top: person.top,
            left: person.left,
            width: '22vw',
            minWidth: '260px',
            aspectRatio: '4/5',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: '#111',
            zIndex: 10
          }}
        >
          <img
            src={person.src}
            alt={person.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Gradient Overlay for bottom text legibility */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '60%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            zIndex: 1,
            pointerEvents: 'none'
          }} />

          {/* Label */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            color: '#fff',
            zIndex: 2
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{person.name}</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{person.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
