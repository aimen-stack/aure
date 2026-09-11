import { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// -----------------------------------------------------------------
// Helper: smoothstep for organic, liquid easing (3t^2 - 2t^3)
// -----------------------------------------------------------------
function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

// -----------------------------------------------------------------
// <HeroWater /> — Exact Figma Layout & Artwork Integration
//
// 1. Typography & Geometry:
//    - Text: "We don't\nmake ads."
//    - Font: 'Bricolage Grotesque', sans-serif
//    - Weight: 800 (ExtraBold)
//    - Size: 160px (at 1440px desktop base, responsive scaling)
//    - Line Height: 174px (1.0875 ratio)
//    - Letter Spacing: -3% (-0.03em)
//    - Text Align: center
//
// 2. Exact Scroll Choreography:
//    - Initially: both lines "We don't" and "make ads." show crisp
//      and centered in the sky above the glowing water oval.
//    - On scroll: "make ads." smoothly blurs (0 -> 16px) and dissolves
//      to opacity 0, disappearing completely without hard cuts.
//    - After "make ads." is hidden: "We don't" glides down to the surface
//      of the water at horizonY.
//    - On the water surface: "We don't" becomes blurred with an ethereal
//      peach/white glow (Reference Image 2).
//    - "We don't" does NOT hide — it stays at opacity 1, radiantly
//      blurred on the water surface with liquid reflection beneath it!
//    - Finally (0.80 -> 1.00): the entire hero scene smoothly crossfades
//      into the daylight OrbSequence.
// -----------------------------------------------------------------

export default function HeroWater({
  rippleDetail = 18,
  rippleSpeed = 2,
  distortion = 6,
  bloom = 16,
  warmBleed = 0.75,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const [dims, setDims] = useState({ W: 0, H: 0, horizonY: 0 });
  const [filterId] = useState(
    () => `water-distort-${Math.random().toString(36).slice(2, 9)}`
  );

  const [progress, setProgress] = useState(0);
  const [ripples, setRipples] = useState([]);
  const rippleIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const spawnRipple = useCallback((customX, customY) => {
    const id = rippleIdRef.current++;
    setRipples((prev) => [
      ...prev.slice(-8),
      { id, x: customX, y: customY },
    ]);
    setTimeout(() => {
      if (mountedRef.current) {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }
    }, 1400);
  }, []);

  // GSAP ScrollTrigger for pinned scroll choreography
  useLayoutEffect(() => {
    let lastProgress = 0;
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: "+=400%",
        pin: true,
        scrub: true,
        refreshPriority: 4,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);

          lastProgress = p;
        },
      });
    }, wrapRef);

    return () => ctx.revert();
  }, [spawnRipple]);

  // Responsive dimension tracking & exact waterline alignment
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      const W = Math.max(1, Math.floor(rect.width || window.innerWidth || 1440));
      const H = Math.max(1, Math.floor(rect.height || window.innerHeight || 900));

      // Calculate the exact waterline Y coordinate where the glowing water oval starts in hero-water-bg.png
      // Image aspect ratio: 1024 / 577 = 1.7747
      const imgRatio = 1024 / 577;
      const imgH = Math.max(H, W / imgRatio);
      const ovalTopDistFromBottom = imgH * (1 - 482 / 577);
      const calculatedHorizonY = Math.round(H - ovalTopDistFromBottom);

      setDims({ W, H, horizonY: Math.max(Math.round(H * 0.72), calculatedHorizonY) });
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    window.addEventListener("resize", resize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  const { W, H, horizonY } = dims;

  // Responsive typography calculations based on Figma specs
  // Figma desktop base: 1440px width -> 160px font size, 174px line height
  const maxFontByWidth = W > 0 ? (W / 1440) * 160 : 160;
  const maxFontByHeight = horizonY > 0 ? (horizonY * 0.42) / (174 / 160 * 2) : 160;
  const fontSize = Math.min(160, Math.max(42, Math.round(Math.min(maxFontByWidth, maxFontByHeight))));
  const lineHeight = Math.round(fontSize * (174 / 160));
  const textBlockHeight = lineHeight * 2;
  const textWidth = Math.min(1020.89 * (fontSize / 160), W * 0.92);

  // Resting position at top of page (progress = 0)
  // Shifted comfortably away from top for both laptops and large screens
  const figmaTargetTop = 275;
  const skyCenterTop = Math.max(90, Math.round((horizonY - textBlockHeight) * 0.58));
  const baseTop = (W >= 1400 && horizonY >= 720 ? figmaTargetTop : skyCenterTop) + 35;

  // -----------------------------------------------------------------
  // Smooth Scroll Choreography:
  //
  // 1. Line 2 ("make ads.") blur & hide:
  //    - Starts dissolving at progress 0.05, completely hidden by 0.28.
  //    - Blurs from 0px to 16px, fades from opacity 1 to 0, drifts down 22px.
  //
  // 2. Line 1 ("We don't") descend:
  //    - Begins glide at progress 0.18, arrives at water surface at 0.50.
  //    - Sits right above the glowing peach/magenta water oval.
  //
  // 3. Line 1 ("We don't") blur on the water surface:
  //    - Starts blurring as it nears the surface (progress 0.28 to 0.52).
  //    - Smoothly blurs from 0px to 13px, brightness increases to 1.35.
  //    - OPACITY STAYS 1 — DOES NOT HIDE!
  //
  // 4. Crossfade into OrbSequence (progress 0.80 to 1.00):
  //    - Entire hero scene fades out smoothly.
  // -----------------------------------------------------------------

  // Line 2 ("make ads.") transitions
  const makeAdsProgress = smoothstep(0.05, 0.26, progress);
  const line1Opacity = Math.max(0, 1 - makeAdsProgress);
  const line1Blur = makeAdsProgress * 16;
  const line1DriftY = makeAdsProgress * 22;

  // Line 1 ("We don't") movement to water surface (hovering right above the glowing pool)
  const targetWeDontY = horizonY > 0 ? horizonY - lineHeight - 8 : 340;
  const weDontGlideProgress = smoothstep(0.18, 0.48, progress);
  const currentWeDontY = baseTop + weDontGlideProgress * (targetWeDontY - baseTop);

  // Line 1 ("We don't") blur on the water surface (matching reference image)
  const weDontBlurProgress = smoothstep(0.28, 0.52, progress);
  const line0Blur = weDontBlurProgress * 12 * (fontSize / 160);
  const line0Opacity = 1;
  const line0Brightness = 1 + weDontBlurProgress * 0.15;

  // -----------------------------------------------------------------
  // The Switching Transition to OrbSequence (progress 0.45 to 0.85):
  // 1. As user scrolls, the water ripple and "We don't" shift UP to Y ~ 38% & Y ~ 21%.
  // 2. The temple arches with the golden orb (Frame 0 of OrbSequence) rise into the
  //    lower half of the viewport.
  // 3. The bottom gradient mask of the water layer blends the cosmic clouds softly
  //    across the top of the stone arches, matching the reference image 100%!
  // 4. As progress reaches 0.85 -> 1.00, the water layer fades out smoothly,
  //    leaving the temple at full screen with ZERO black screen between switching!
  // -----------------------------------------------------------------
  const shiftProgress = smoothstep(0.48, 0.78, progress);
  const waterTranslateY = -shiftProgress * (H * 0.40);

  // Temple rises smoothly into the lower half
  const templeOpacity = smoothstep(0.46, 0.72, progress);
  const templeTranslateY = (1 - smoothstep(0.48, 0.78, progress)) * (H * 0.14);

  // Ethereal gradient mask that softly blends the water ripple over the temple
  const maskMid = 42 + (1 - shiftProgress) * 30;
  const maskEnd = 64 + (1 - shiftProgress) * 28;
  const maskGradient = shiftProgress > 0.02
    ? `linear-gradient(to bottom, black 0%, black 36%, rgba(0,0,0,0.9) ${maskMid}%, rgba(0,0,0,0.35) ${(maskMid + maskEnd) / 2}%, transparent ${maskEnd}%)`
    : "none";

  // Smooth fade out of the water layer at the end of the transition
  const waterFadeOut = smoothstep(0.82, 0.96, progress);
  const waterOpacity = 1 - waterFadeOut;

  // Dynamic stars & shooting stars animation loop
  useEffect(() => {
    if (W < 1 || H < 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * (horizonY || H * 0.8) * 0.9,
        r: Math.random() * 1.1 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 1.8 + 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
    shootingStarsRef.current = [];

    let lastTime = performance.now();
    let nextShootingStar = lastTime + 2000 + Math.random() * 3000;
    let animId;

    function render(now) {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const t = now / 1000;

      ctx.clearRect(0, 0, W, H);

      // Twinkling stars
      for (const s of starsRef.current) {
        const twinkle = 0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.phase);
        ctx.globalAlpha = s.baseAlpha * twinkle;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting stars along artwork angle
      if (now > nextShootingStar) {
        shootingStarsRef.current.push({
          x: W * (0.35 + Math.random() * 0.6),
          y: Math.random() * (horizonY || H * 0.8) * 0.4,
          len: 120 + Math.random() * 140,
          speed: 850 + Math.random() * 450,
          angle: (145 + Math.random() * 8) * (Math.PI / 180),
          life: 0,
          maxLife: 0.6 + Math.random() * 0.25,
        });
        nextShootingStar = now + 4000 + Math.random() * 4500;
      }

      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const ss = shootingStarsRef.current[i];
        ss.life += dt;
        if (ss.life >= ss.maxLife) {
          shootingStarsRef.current.splice(i, 1);
          continue;
        }

        const dist = ss.speed * dt;
        ss.x += Math.cos(ss.angle) * dist;
        ss.y += Math.sin(ss.angle) * dist;

        const lifeFrac = ss.life / ss.maxLife;
        const alpha = Math.sin(lifeFrac * Math.PI) * 0.7;

        const tailX = ss.x - Math.cos(ss.angle) * ss.len;
        const tailY = ss.y - Math.sin(ss.angle) * ss.len;

        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.3, `rgba(210, 230, 255, ${alpha * 0.7})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [W, H, horizonY]);

  // Water ripple filter frequencies
  const baseFreqX = rippleDetail / 2400;
  const baseFreqY = baseFreqX * 5.5;
  const dispScale = distortion * 5;
  const rippleDuration = Math.max(1.5, 10 / Math.max(0.1, rippleSpeed));

  // Interactive click on water creates ripple
  const handleWaterClick = (e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    if (clickY >= horizonY - 40) {
      spawnRipple(clickX, clickY - horizonY);
    }
  };

  return (
    <div
      ref={wrapRef}
      onClick={handleWaterClick}
      style={{
        position: "relative",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#C9A38C",
        overflow: "hidden",
        userSelect: "none",
        opacity: 1 - smoothstep(0.9, 1.0, progress),
      }}
    >
      {/* 
        Layer 1: The Temple Arches & Golden Orb Layer (Frame 0 of OrbSequence)
        Rises up during the switching transition into the exact composite state.
      */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          transform: `translateY(${templeTranslateY}px)`,
          opacity: templeOpacity,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <img
          src="/frames/ezgif-frame-001.png"
          alt="Temple orb backdrop"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      </div>

      {/* SVG filter for liquid water surface displacement physics */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${baseFreqX} ${baseFreqY}`}
              numOctaves="2"
              seed="7"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur={`${rippleDuration}s`}
                values={`${baseFreqX} ${baseFreqY};${baseFreqX * 1.3} ${baseFreqY * 0.85};${baseFreqX} ${baseFreqY}`}
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={dispScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 
        Layer 2: The Cosmic Water, Stars & "We don't" Layer
        Shifts upward during the transition, with an ethereal bottom gradient mask
        that reveals the temple arches and golden orb beneath!
      */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          transform: `translateY(${waterTranslateY}px)`,
          opacity: waterOpacity,
          maskImage: maskGradient,
          WebkitMaskImage: maskGradient,
          zIndex: 2,
          willChange: "transform, opacity",
        }}
      >
        {/* Deep space base background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "#02040a",
            pointerEvents: "none",
          }}
        />

        {/* 
          Background Artwork:
          Official high-res plate featuring the cosmos, shooting stars, cosmic smoke,
          shadow depth, and the glowing peach/magenta water ripple portal.
        */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
        <img
          src="/hero-water-bg.png"
          alt="Ethereal space water hero backdrop"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center bottom",
            display: "block",
          }}
        />
      </div>

      {/* Live Canvas for twinkling micro-stars and shooting stars */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
      />

      {/* 
        The Headline Text Elements:
        Individually choreographed for the exact scroll behavior:
        - Line 1: "We don't" — glides to the water surface, blurs on the water, NEVER hides.
        - Line 2: "make ads." — smoothly blurs and dissolves to opacity 0 as scroll begins.
      */}
      {W > 0 && horizonY > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 6,
          }}
        >
          {/* Line 1: "We don't" */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: currentWeDontY,
              transform: "translateX(-50%)",
              width: textWidth,
              maxWidth: "1020.89px",
              textAlign: "center",
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              whiteSpace: "nowrap",
              opacity: line0Opacity,
              filter: `blur(${line0Blur}px) brightness(${line0Brightness})`,
              textShadow:
                weDontBlurProgress > 0.1
                  ? "0 0 25px rgba(255,255,255,0.85), 0 0 50px rgba(255,255,255,0.45)"
                  : "0 4px 30px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.2)",
              transition: "filter 0.15s ease-out, opacity 0.15s ease-out",
              pointerEvents: "none",
            }}
          >
            We don't
          </div>

          {/* Line 2: "make ads." — smoothly blurs and dissolves to 0 */}
          {line1Opacity > 0 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: baseTop + lineHeight + line1DriftY,
                transform: "translateX(-50%)",
                width: textWidth,
                maxWidth: "1020.89px",
                textAlign: "center",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: `${fontSize}px`,
                lineHeight: `${lineHeight}px`,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                whiteSpace: "nowrap",
                opacity: line1Opacity,
                filter: `blur(${line1Blur}px)`,
                textShadow: "0 4px 30px rgba(0,0,0,0.5)",
                pointerEvents: "none",
                willChange: "opacity, filter, transform",
              }}
            >
              make ads.
            </div>
          )}
        </div>
      )}

      {/* 
        Water Surface Dynamics & Liquid Reflections:
        Underneath horizonY:
        - Liquid reflection of the blurred "We don't" shimmering in the glowing peach/magenta pool.
        - Liquid ripple shimmer streaks.
        - Interactive perspective ripple rings centered on the glowing water portal.
      */}
      {W > 0 && horizonY > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: horizonY,
            width: W,
            height: Math.max(1, H - horizonY),
            overflow: "hidden",
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: 7,
          }}
        >
          {/* Liquid peach/magenta reflection of "We don't" in the glowing pool */}
          {weDontGlideProgress > 0.3 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                transform: "translateX(-50%) translateY(4px) scaleY(-0.7) scaleX(1.05)",
                width: textWidth,
                maxWidth: "1020.89px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: `${fontSize}px`,
                lineHeight: `${lineHeight}px`,
                letterSpacing: "-0.03em",
                color: "#ffc282",
                filter: `blur(${Math.max(5, bloom * 0.45)}px) url(#${filterId})`,
                opacity: Math.min(0.85, weDontGlideProgress * warmBleed),
                mixBlendMode: "screen",
                pointerEvents: "none",
                maskImage: "linear-gradient(to bottom, black 15%, transparent 85%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 15%, transparent 85%)",
              }}
            >
              <div style={{ whiteSpace: "nowrap" }}>We don't</div>
            </div>
          )}

          {/* Photorealistic Water Surface Ripples (displaces the actual background image) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: -horizonY,
              width: W,
              height: H,
              backgroundImage: 'url(/hero-water-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              filter: `url(#${filterId}) brightness(1.05)`,
              maskImage: `linear-gradient(to bottom, transparent ${horizonY}px, black ${horizonY + 30}px)`,
              WebkitMaskImage: `linear-gradient(to bottom, transparent ${horizonY}px, black ${horizonY + 30}px)`,
              pointerEvents: "none",
            }}
          />


        </div>
      )}

      </div>

      {/* Micro-animations CSS */}
      <style>{`
        @keyframes wrt-shimmer {
          0%   { background-position: 0 0; }
          100% { background-position: 0 56px; }
        }
        @keyframes wrt-ripple {
          0% {
            width: 25px;
            height: 8px;
            opacity: 0.95;
            border-width: 2.2px;
          }
          40% {
            opacity: 0.75;
          }
          100% {
            width: 580px;
            height: 150px;
            opacity: 0;
            border-width: 0.5px;
          }
        }
      `}</style>
    </div>
  );
}