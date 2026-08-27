import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './Header';

gsap.registerPlugin(ScrollTrigger);

export default function MeetTheDisrupters() {
  const sectionRef = useRef(null);
  const mainTextRef = useRef(null);
  const subTextRef = useRef(null);
  const cardsRef = useRef([]);

  const team = [
    { src: '/team/faisal.png', name: 'Faisal', role: 'Strategist', top: '40%', left: '20%', rot: -6 },
    { src: '/team/Eiraj.png', name: 'Eiraj Munis', role: 'Animator', top: '65%', left: '50%', rot: 3 },
    { src: '/team/aimen.png', name: 'Aimen', role: 'Engineer', top: '30%', left: '80%', rot: 8 }
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
      gsap.set(mainTextRef.current, { opacity: 0, scale: 0.8, xPercent: -50, yPercent: -50, x: '50vw', filter: 'blur(20px)' });
      gsap.set(subTextRef.current, { opacity: 0, scale: 0.8, xPercent: -50, yPercent: -50, x: '50vw', filter: 'blur(20px)' });

      cardsRef.current.forEach((card, i) => {
        gsap.set(card, {
          opacity: 0,
          scale: 0.2,
          filter: 'blur(15px)',
          xPercent: -50,
          yPercent: -50,
          rotation: team[i].rot,
          zIndex: 10
        });
      });

      // 1. mainText animates in from right (blurry to clear)
      tl.to(mainTextRef.current, { x: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 2, ease: 'power2.out' });

      // Keep text for a tiny bit
      tl.to({}, { duration: 1 });

      // 2. mainText animates out left (Duration is 4, so halfway is +2)
      tl.to(mainTextRef.current, { x: '-60vw', opacity: 0, filter: 'blur(10px)', duration: 4, ease: 'power2.inOut' }, "moveMainOut");

      // 3. subText animates in from right. It shows up IN BETWEEN mainText moving left.
      tl.to(subTextRef.current, { x: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 2, ease: 'power2.out' }, "moveMainOut+=0.5");

      // 4. When mainText is half hidden (i.e. at moveMainOut + 2), subText starts hiding towards the left.
      tl.to(subTextRef.current, { x: '-60vw', opacity: 0, filter: 'blur(10px)', duration: 3, ease: 'power2.inOut' }, "moveMainOut+=2");

      // 5. Cards pop in simultaneously, scattered, but blurred
      tl.to(cardsRef.current, { opacity: 1, scale: 0.9, duration: 1.5 }, "moveMainOut+=4");

      // 6. Highlight cards one by one
      cardsRef.current.forEach((card, i) => {

        // Bring card into focus
        tl.to(card, {
          filter: 'blur(0px)',
          scale: 1.1,
          rotation: team[i].rot * 1.5, // Emphasize rotation when highlighted
          zIndex: 20, // Bring to front
          duration: 1.5
        });

        // Hold focus
        tl.to({}, { duration: 1.5 });

        // Blur card out as the next one prepares (except the very last one, which stays clear for a bit)
        if (i < cardsRef.current.length - 1) {
          tl.to(card, {
            filter: 'blur(10px)',
            scale: 0.9,
            rotation: team[i].rot,
            zIndex: 10,
            duration: 1.5
          }, "+=0");
        }
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
          <Header />
        </div>
      </div>

      {/* Background Orb - subtle and dark */}
      <img
        src="/orbimages/ezgif-frame-001.png"
        alt="Dark Orb"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          minWidth: '800px',
          opacity: 0.3,
          filter: 'hue-rotate(280deg) saturate(2) blur(30px)',
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
