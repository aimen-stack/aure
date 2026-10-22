import React, { useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);
if (typeof window !== 'undefined') {
  window.ScrollTrigger = ScrollTrigger;
  window.gsap = gsap;
}

export default function MeetTheDisrupters() {
  const sectionRef = useRef(null);
  const mainTextRef = useRef(null);
  const subTextRef = useRef(null);
  const cardsRef = useRef([]);
  const orbRef = useRef(null);
  const starsCanvasRef = useRef(null);

  const team = [
    { src: '/team/faisal.png', name: 'Faisal Munir', role: 'Strategist', top: '32%', left: '24%', rot: -4 },
    { src: '/team/aimen.png', name: 'Aimen', role: 'Engineer', top: '50%', left: '50%', rot: 3 },
    { src: '/team/Eiraj.png', name: 'Eiraj Munis', role: 'Animator', top: '30%', left: '76%', rot: -3 }
  ];

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.disrupter-card', sectionRef.current);
      console.log('MeetTheDisrupters mounted! cards count:', cards.length);
      window.__MTD_CARDS = cards;
      window.ScrollTrigger = ScrollTrigger;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=640%",
          pin: true,
          scrub: 1,
          refreshPriority: -1,
        }
      });

      // Initialize positions and states with GSAP
      // 1. First text ("Meet the DISRUPTERS") starts completely offscreen to the right
      gsap.set(mainTextRef.current, {
        opacity: 0,
        scale: 0.96,
        xPercent: -50,
        yPercent: -50,
        x: '105vw',
        filter: 'blur(20px)',
        willChange: 'transform, opacity, filter'
      });

      // 2. Second text ("Strategists, animators...") starts completely offscreen to the right
      gsap.set(subTextRef.current, {
        opacity: 0,
        scale: 0.96,
        xPercent: -50,
        yPercent: -50,
        x: '105vw',
        filter: 'blur(20px)',
        willChange: 'transform, opacity, filter'
      });

      // 3. Team cards start deep down below the viewport
      cards.forEach((card, i) => {
        gsap.set(card, {
          opacity: 0,
          scale: 0.9,
          x: 0,
          y: '115vh',
          filter: 'blur(16px)',
          xPercent: -50,
          yPercent: -50,
          rotation: team[i].rot,
          zIndex: 10,
          willChange: 'transform, opacity, filter'
        });
      });

      // Animate background orb slowly throughout the entire pinned section
      tl.to(orbRef.current, {
        y: '-25vh',
        x: '-8vw',
        rotation: 25,
        scale: 1.15,
        duration: 34.5,
        ease: 'none'
      }, 0);

      // ==========================================
      // PHASE 1: FIRST TEXT ("Meet the DISRUPTERS")
      // Floats from right to left first on scroll
      // ==========================================
      tl.to(mainTextRef.current, {
        x: 0,
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        duration: 3.0,
        ease: 'power2.out'
      }, 0); 

      tl.addLabel("headlineHold", 3.0);

      tl.to(mainTextRef.current, {
        x: '-105vw',
        opacity: 0,
        filter: 'blur(20px)',
        scale: 0.96,
        duration: 3.0,
        ease: 'power2.in'
      }, "headlineHold+=1.0"); 

      // "Meet the DISRUPTERS" has completed its animation
      tl.addLabel("headlineCompleted", "headlineHold+=4.0");

      // ==========================================
      // PHASE 2: SECOND TEXT ("Strategists, animators...")
      // Starts right-to-left animation WHEN "Meet the DISRUPTERS" has completed
      // ==========================================
      tl.addLabel("subtextStart", "headlineCompleted+=0.3");

      tl.to(subTextRef.current, {
        x: 0,
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        duration: 3.0,
        ease: 'power2.out'
      }, "subtextStart");

      tl.addLabel("subtextHold", "subtextStart+=3.0");

      tl.to(subTextRef.current, {
        x: '-105vw',
        opacity: 0,
        filter: 'blur(20px)',
        scale: 0.96,
        duration: 3.0,
        ease: 'power2.in'
      }, "subtextHold+=1.0");

      // Second text has completed its animation
      tl.addLabel("subtextCompleted", "subtextHold+=4.0");

      // ==========================================
      // PHASE 3: TEAM IMAGES FLOAT UP ONE BY ONE
      // (Starts after the second text has completed its animation)
      // ==========================================

      // --- 1. FIRST IMAGE (Faisal Munir) floats from bottom ---
      tl.addLabel("card0Rise", "subtextCompleted+=0.4");
      if (cards[0]) {
        // While rising, card0 is blurred
        tl.to(cards[0], {
          y: 0,
          opacity: 0.9,
          scale: 0.96,
          filter: 'blur(14px)',
          duration: 2.4,
          ease: 'power2.out'
        }, "card0Rise");

        // On reaching its place, card0 becomes current active image (sharp, non-blur, spotlighted!)
        tl.to(cards[0], {
          filter: 'blur(0px)',
          opacity: 1,
          scale: 1.06,
          zIndex: 30,
          duration: 0.8,
          ease: 'sine.out'
        }, "card0Rise+=2.0");
      }

      // Hold active state on Card 0
      tl.addLabel("card0Active", "card0Rise+=3.6");

      // --- 2. SECOND IMAGE (Aimen) floats up + PREVIOUS IMAGE (Card 0) gets blur ---
      tl.addLabel("card1Rise", "card0Active+=0.4");
      if (cards[0]) {
        // Previous image (Card 0) gets blur and dims
        tl.to(cards[0], {
          filter: 'blur(4px)',
          opacity: 0.45,
          scale: 0.94,
          zIndex: 10,
          duration: 1.4,
          ease: 'sine.inOut'
        }, "card1Rise");
      }

      if (cards[1]) {
        // While rising, card1 is blurred
        tl.to(cards[1], {
          y: 0,
          opacity: 0.9,
          scale: 0.96,
          filter: 'blur(14px)',
          duration: 2.4,
          ease: 'power2.out'
        }, "card1Rise");

        // On reaching its place, card1 becomes current active non-blur image!
        tl.to(cards[1], {
          filter: 'blur(0px)',
          opacity: 1,
          scale: 1.06,
          zIndex: 30,
          duration: 0.8,
          ease: 'sine.out'
        }, "card1Rise+=2.0");
      }

      // Hold active state on Card 1
      tl.addLabel("card1Active", "card1Rise+=3.6");

      // --- 3. THIRD IMAGE (Eiraj Munis) floats up + PREVIOUS IMAGE (Card 1) gets blur ---
      tl.addLabel("card2Rise", "card1Active+=0.4");
      if (cards[1]) {
        // Previous image (Card 1) gets blur and dims
        tl.to(cards[1], {
          filter: 'blur(4px)',
          opacity: 0.45,
          scale: 0.94,
          zIndex: 10,
          duration: 1.4,
          ease: 'sine.inOut'
        }, "card2Rise");
      }

      if (cards[2]) {
        // While rising, card2 is blurred
        tl.to(cards[2], {
          y: 0,
          opacity: 0.9,
          scale: 0.96,
          filter: 'blur(14px)',
          duration: 2.4,
          ease: 'power2.out'
        }, "card2Rise");

        // On reaching its place, card2 becomes current active non-blur image!
        tl.to(cards[2], {
          filter: 'blur(0px)',
          opacity: 1,
          scale: 1.06,
          zIndex: 30,
          duration: 0.8,
          ease: 'sine.out'
        }, "card2Rise+=2.0");
      }

      // Hold active state on Card 2
      tl.addLabel("card2Active", "card2Rise+=3.6");

      // --- 4. ALL TEAM IMAGES RESOLVE IN HARMONY ---
      tl.addLabel("allCardsHarmony", "card2Active+=0.6");
      tl.to(cards, {
        filter: 'blur(0px)',
        opacity: 0.95,
        scale: 1.0,
        zIndex: 15,
        duration: 1.8,
        ease: 'sine.inOut'
      }, "allCardsHarmony");

      // --- 5. ON MORE SCROLL, ALL CARDS FLOAT UPWARD OFFSCREEN ---
      tl.addLabel("teamExit", "allCardsHarmony+=2.0");
      tl.to(cards, {
        y: '-110vh',
        opacity: 0,
        filter: 'blur(16px)',
        scale: 0.85,
        duration: 2.8,
        stagger: 0.15,
        ease: 'power2.in'
      }, "teamExit");

    }, sectionRef);

    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  // Dynamic Stars and Space Animation Canvas
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = 0;
    let height = 0;
    let isVisible = true;

    const handleResize = () => {
      const rect = sectionRef.current?.getBoundingClientRect();
      width = rect ? rect.width : window.innerWidth;
      height = rect ? rect.height : window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Generate stars
    const starCount = 220;
    const stars = [];
    const starColors = ['#ffffff', '#ffffff', '#e8f0fe', '#d0e2ff', '#ffe9d6'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() < 0.08 
          ? Math.random() * 1.2 + 1.4 // Brilliant beacon star
          : Math.random() < 0.25 
            ? Math.random() * 0.8 + 0.8 // Medium star
            : Math.random() * 0.5 + 0.3, // Micro distant star
        baseAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 1.5 + 0.4,
        phase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        hasSpikes: Math.random() < 0.06
      });
    }

    // Shooting stars pool
    const shootingStars = [];
    let lastTime = performance.now();
    let nextShootingStar = lastTime + 1800 + Math.random() * 2500;

    const render = (now) => {
      if (!isVisible) return;
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const t = now / 1000;

      ctx.clearRect(0, 0, width, height);

      // Render twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase);
        const alpha = s.baseAlpha * twinkle;

        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        // Soft halo & subtle cross spikes for prominent stars
        if (s.hasSpikes && alpha > 0.4) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.6;
          ctx.globalAlpha = alpha * 0.4;
          const spikeLen = s.r * 3.5;
          ctx.beginPath();
          ctx.moveTo(s.x - spikeLen, s.y);
          ctx.lineTo(s.x + spikeLen, s.y);
          ctx.moveTo(s.x, s.y - spikeLen);
          ctx.lineTo(s.x, s.y + spikeLen);
          ctx.stroke();
        }
      }

      // Spawn shooting stars
      if (now > nextShootingStar) {
        shootingStars.push({
          x: Math.random() * (width * 0.8) + width * 0.1,
          y: Math.random() * (height * 0.4),
          len: 120 + Math.random() * 140,
          speed: 800 + Math.random() * 450,
          angle: (135 + (Math.random() * 16 - 8)) * (Math.PI / 180),
          life: 0,
          maxLife: 0.65 + Math.random() * 0.25
        });
        nextShootingStar = now + 3000 + Math.random() * 4000;
      }

      // Update & render shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.life += dt;
        if (ss.life >= ss.maxLife) {
          shootingStars.splice(i, 1);
          continue;
        }

        const dist = ss.speed * dt;
        ss.x += Math.cos(ss.angle) * dist;
        ss.y += Math.sin(ss.angle) * dist;

        const lifeFrac = ss.life / ss.maxLife;
        const alpha = Math.sin(lifeFrac * Math.PI) * 0.85;

        const tailX = ss.x - Math.cos(ss.angle) * ss.len;
        const tailY = ss.y - Math.sin(ss.angle) * ss.len;

        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.25, `rgba(210, 230, 255, ${alpha * 0.75})`);
        grad.addColorStop(0.6, `rgba(180, 150, 255, ${alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(150, 100, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Pause when offscreen for high performance
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        lastTime = performance.now();
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    }, { threshold: 0.05 });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        backgroundColor: '#020205',
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
        position: 'relative',
        zIndex: 2,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Space & Cosmic Nebula Glows */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 20% 30%, rgba(120, 50, 220, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 70% 55% at 80% 70%, rgba(35, 90, 240, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255, 46, 147, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, #070614 0%, #020205 100%)
        `
      }} />

      {/* Starfield & Space Animation Canvas */}
      <canvas
        ref={starsCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
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
          opacity: 0.45,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          zIndex: 2
        }}
      />

      {/* 1. First Text: "Meet the DISRUPTERS" */}
      <div
        ref={mainTextRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          textAlign: 'center',
          color: '#fff',
          width: '100%',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      >
        <div style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontStyle: 'normal',
          fontSize: 'clamp(2.5rem, 6.5vw, 128px)',
          lineHeight: 'clamp(40px, 5.2vw, 73.84px)',
          letterSpacing: '-0.03em',
          color: '#ffffff',
          marginBottom: '0.2rem'
        }}>
          Meet the
        </div>
        <div style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontStyle: 'normal',
          fontSize: 'clamp(3.5rem, 11.5vw, 256px)',
          lineHeight: '100%',
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          background: 'linear-gradient(130.04deg, #C39267 2.85%, #712E46 51.12%, #605BA6 99.39%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          display: 'inline-block'
        }}>
          DISRUPTERS
        </div>
      </div>

      {/* 2. Second Text: "Strategists, animators, engineers and troublemakers under one roof." */}
      <div
        ref={subTextRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          textAlign: 'center',
          color: '#fff',
          width: '90%',
          maxWidth: '960px',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      >
        <div style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.75)',
          marginBottom: '0.75rem'
        }}>
          Meet the <span style={{
            background: 'linear-gradient(130.04deg, #C39267 2.85%, #712E46 51.12%, #605BA6 99.39%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent'
          }}>DISRUPTERS</span>
        </div>
        <div style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 'clamp(1.8rem, 3.2vw, 3.4rem)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          lineHeight: 1.25,
          color: '#ffffff'
        }}>
          Strategists, animators,<br />
          engineers and troublemakers<br />
          <span style={{
            background: 'linear-gradient(130.04deg, #C39267 2.85%, #712E46 51.12%, #605BA6 99.39%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            under one roof.
          </span>
        </div>
      </div>

      {/* Team Cards */}
      {team.map((person, i) => (
        <div
          key={i}
          ref={el => (cardsRef.current[i] = el)}
          className="disrupter-card"
          style={{
            position: 'absolute',
            top: person.top,
            left: person.left,
            width: '21vw',
            minWidth: '260px',
            maxWidth: '350px',
            height: 'clamp(360px, 48vh, 500px)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.85), 0 0 35px rgba(255, 46, 147, 0.18)',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'linear-gradient(180deg, #131128 0%, #080716 100%)',
            zIndex: 10,
            willChange: 'transform, opacity, filter'
          }}
        >
          {/* Subtle cosmic glow behind character */}
          <div style={{
            position: 'absolute',
            top: '32%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(140, 60, 255, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <img
            src={person.src}
            alt={person.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center top',
              padding: '16px 12px 64px 12px',
              boxSizing: 'border-box',
              display: 'block',
              position: 'relative',
              zIndex: 1
            }}
          />

          {/* Gradient Overlay for bottom text legibility */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '36%',
            background: 'linear-gradient(to top, rgba(5,5,10,0.96) 0%, rgba(5,5,10,0.55) 60%, transparent 100%)',
            zIndex: 2,
            pointerEvents: 'none'
          }} />

          {/* Label */}
          <div style={{
            position: 'absolute',
            bottom: '22px',
            left: '22px',
            right: '22px',
            color: '#fff',
            zIndex: 3
          }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(1.2rem, 1.6vw, 1.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              {person.name}
            </div>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              display: 'inline-block',
              marginTop: '6px',
              padding: '4px 14px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#C39267',
              textTransform: 'uppercase'
            }}>
              {person.role}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
