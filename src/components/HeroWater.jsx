import { useEffect, useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// -----------------------------------------------------------------
// <WaterReflectionText /> — starfield sky + glowing text sinking
// into a waterline, with a displaced specular glow reflection.
//
// Unlike a literal mirror, the water does NOT reproduce the sharp
// letterforms. Instead:
//   1. The text is clipped hard at the horizon line, so the bottom
//      portion is simply gone — it reads as "sinking" into the water.
//   2. The "reflection" is just the glow: a soft, warm blob of color
//      (orange -> pink -> purple) sitting under the waterline.
//   3. That glow is run through an SVG feTurbulence + feDisplacementMap
//      filter, which is what actually does the "water physics" —
//      it warps the color into the horizontal, liquid-looking bands
//      you'd see from real ripples, instead of a clean gradient.
//   4. A subtle animated horizontal streak layer (also warped by the
//      same filter) adds the specular "cutting through the light"
//      lines on top of the glow.
// -----------------------------------------------------------------

export default function HeroWater({
  text = "we don't\nmake ads.",
  rippleDetail = 18,
  rippleSpeed = 2,
  distortion = 6,
  bloom = 16,
  warmBleed = 0.65,
  popScrollRange = 700,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const starsRef = useRef([]);
  const [dims, setDims] = useState({ W: 0, H: 0, horizonY: 0 });
  const [filterId] = useState(
    () => `water-distort-${Math.random().toString(36).slice(2, 9)}`
  );

  const [progress, setProgress] = useState(0);
  const [ripples, setRipples] = useState([]);
  const rippleIdRef = useRef(0);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  useLayoutEffect(() => {
    function spawnRipple() {
      const id = rippleIdRef.current++;
      setRipples((prev) => [...prev, { id }]);
      setTimeout(() => {
        if (mountedRef.current) setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 900);
    }

    let lastProgress = 0;
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: "+=500%", // Pin for 5 viewport heights to add a long pause before unpinning
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          setProgress(self.progress);
          
          // Splash triggers
          if (lastProgress < 0.5 && self.progress >= 0.5) spawnRipple();
          if (lastProgress > 0 && self.progress <= 0) spawnRipple();
          
          lastProgress = self.progress;
        }
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  // 0 to 0.2: Text rises out of water
  const pop = Math.min(1, progress / 0.2); 
  
  // 0.2 to 0.4: Bottom text sinks, top text blurs/fades
  const phase2 = Math.min(1, Math.max(0, (progress - 0.2) / 0.2)); 
  
  // 0.4 to 1.0 is a "pause" before it unpins and naturally scrolls up to reveal OrbSequence

  // measure the container and redraw the static starfield/water base
  // whenever it resizes
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      const W = Math.max(1, Math.floor(rect.width || 1280));
      const H = Math.max(1, Math.floor(rect.height || 720));
      setDims({ W, H, horizonY: Math.round(H * 0.72) });
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // draw the (static) nebula + meteors + water base into an offscreen
  // canvas — this layer never needs the water-physics filter, it's just
  // the backdrop. Stars are generated here too but drawn every frame
  // (see the animation loop below) so they can twinkle and drift.
  useEffect(() => {
    const { W, H, horizonY } = dims;
    if (W < 1 || H < 1) return;
    if (!bgCanvasRef.current) bgCanvasRef.current = document.createElement("canvas");
    const canvas = bgCanvasRef.current;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, W, H);

    const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, "#03040a");
    sky.addColorStop(1, "#070a16");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizonY);

    const water = ctx.createLinearGradient(0, horizonY, 0, H);
    water.addColorStop(0, "#04060d");
    water.addColorStop(1, "#000102");
    ctx.fillStyle = water;
    ctx.fillRect(0, horizonY, W, H - horizonY);

    // nebula haze
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) {
      const bx = W * (0.3 + Math.random() * 0.5);
      const by = horizonY * (0.4 + Math.random() * 0.5);
      const br = W * (0.12 + Math.random() * 0.1);
      const hue = Math.random() > 0.5 ? "80,110,200" : "120,90,190";
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, `rgba(${hue},0.14)`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, horizonY);
    }
    ctx.globalCompositeOperation = "source-over";

    // generate star data (positions, twinkle phase, slow drift) — drawn
    // per-frame in the animation loop, not baked into this static canvas
    const stars = [];
    for (let i = 0; i < 380; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * horizonY,
        r: Math.random() * 1.2 + 0.2,
        baseAlpha: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.4 + Math.random() * 1.4,
        driftX: (Math.random() - 0.5) * 18, // px/sec
        driftY: (Math.random() - 0.5) * 6,
      });
    }
    starsRef.current = stars;

    // meteor streaks
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * W * 0.7;
      const y = Math.random() * horizonY * 0.6;
      const len = 120 + Math.random() * 160;
      const ang = 2.5 + Math.random() * 0.3;
      const dx = Math.cos(ang) * len;
      const dy = Math.sin(ang) * len;
      const a = 0.15 + Math.random() * 0.25;
      const grad = ctx.createLinearGradient(x, y, x + dx, y + dy);
      grad.addColorStop(0, `rgba(255,255,255,${a})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();
    }

    // soft fade right above the horizon
    const fade = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY);
    fade.addColorStop(0, "rgba(3,4,10,0)");
    fade.addColorStop(1, "rgba(3,4,10,0.6)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, horizonY - 40, W, 40);
  }, [dims]);

  // animation loop: composite the static bg canvas + animated (twinkling,
  // drifting) stars onto the visible canvas every frame
  useEffect(() => {
    const { W, H, horizonY } = dims;
    const canvas = canvasRef.current;
    const bg = bgCanvasRef.current;
    if (!canvas || !bg || W < 1 || H < 1) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    let raf;
    let last = performance.now();

    function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(bg, 0, 0);

      for (const s of starsRef.current) {
        s.x += s.driftX * dt;
        s.y += s.driftY * dt;
        if (s.x < 0) s.x += W;
        else if (s.x > W) s.x -= W;
        if (s.y < 0) s.y += horizonY;
        else if (s.y > horizonY) s.y -= horizonY;

        const twinkle = 0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.phase);
        ctx.globalAlpha = s.baseAlpha * twinkle;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [dims]);

  const { W, H, horizonY } = dims;
  const fontSize = W > 0 ? Math.min(Math.max(W * 0.075, 64), 100) : 80;
  const reflH = Math.max(1, H - horizonY);
  const textLines = text.split("\n");
  const longestLine = Math.max(...textLines.map((l) => l.length));
  const lineHeightRatio = 1.08;
  // anchor by half a single line's height (not half the whole multi-line
  // block) so the waterline always cuts through the middle of the first
  // line, same "sinking" look regardless of how many lines there are
  const halfLineHeight = (fontSize * lineHeightRatio) / 2;

  // pop-out-of-the-water animation, driven by wheel scroll (`pop`, 0..1)
  const baseClipBottomPct = H > 0 ? Math.max(0, 100 - (horizonY / H) * 100) : 0;
  const clipBottomPct = baseClipBottomPct * (1 - pop);
  const activePop = pop - phase2;
  const popRise = pop * (horizonY * 0.55) - phase2 * (horizonY * 0.55 - halfLineHeight);
  const popScale = 1 + activePop * 0.5;

  // map the friendly props onto filter/animation parameters
  const baseFreqX = rippleDetail / 2400; // horizontal noise frequency
  const baseFreqY = baseFreqX * 5.5; // stretched vertically -> horizontal-looking bands
  const dispScale = distortion * 5; // feDisplacementMap "scale"
  const rippleDuration = Math.max(1.5, 10 / Math.max(0.1, rippleSpeed));
  const glowOpacity = Math.max(0, Math.min(1, warmBleed));

  // Fade out the solid backgrounds in the last 20% of the pin (progress 0.8 to 1.0)
  // This allows the next section (OrbSequence) to show through and crossfade.
  const bgOpacity = 1 - Math.max(0, Math.min(1, (progress - 0.8) / 0.2));

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      {/* the SVG filter is our "water physics" — feTurbulence generates the
          noise, feDisplacementMap uses it to warp whatever the filter is
          applied to into liquid-looking bands */}
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

      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: bgOpacity }}
      />

      {W > 0 && (
        <>
          {/* the glowing text, hard-clipped at the horizon line so its
              lower portion simply disappears — the "sinking" effect.
              Scrolling reduces the clip and lifts/scales the text so it
              pops up out of the water toward the viewer. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(0 0 ${clipBottomPct}% 0)`,
              WebkitClipPath: `inset(0 0 ${clipBottomPct}% 0)`,
              pointerEvents: "none",
              transition: "clip-path 0.35s cubic-bezier(.16,1,.3,1)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: horizonY,
                transformOrigin: "50% 100%",
                transform: `translate(-50%, calc(-${halfLineHeight}px - ${popRise}px)) scale(${popScale}) perspective(700px) rotateX(${(1 - activePop) * 9}deg)`,
                transition:
                  "transform 0.65s cubic-bezier(.34,1.56,.64,1), filter 0.5s ease-out, letter-spacing 0.5s ease-out",
                filter: `brightness(${1 + pop * 0.15}) saturate(${1 + pop * 0.2}) blur(${(1 - pop) * 0.6}px)`,
                letterSpacing: `${pop * 1.5}px`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 800,
                fontSize,
                lineHeight: lineHeightRatio,
                color: "#fff",
                whiteSpace: "nowrap",
                textShadow: 'none',
              }}
            >
              {textLines.map((line, i) => (
                <div 
                  key={i}
                  style={{
                    transform: 'none',
                    filter: i === 0 ? `blur(${phase2 * 12}px)` : 'none',
                    opacity: i === 0 ? 1 - (phase2 * 0.4) : (i === 1 ? 1 - phase2 : 1),
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* splash rings: a quick ripple burst fired when a scroll gesture
              sends the text fully out of, or fully back into, the water */}
          {ripples.map((r) => (
            <div
              key={r.id}
              style={{
                position: "absolute",
                left: "50%",
                top: horizonY,
                width: 10,
                height: 10,
                marginLeft: -5,
                marginTop: -5,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.65)",
                boxShadow: "0 0 24px rgba(200,220,255,0.5)",
                pointerEvents: "none",
                animation: "wrt-ripple 0.9s cubic-bezier(.16,1,.3,1) forwards",
              }}
            />
          ))}

          {/* reflection: NOT a mirrored copy of the letters — just the
              warm light the water is picking up, distorted by the
              turbulence filter above */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: horizonY,
              width: W,
              height: reflH,
              overflow: "hidden",
              pointerEvents: "none",
              WebkitMaskImage: "linear-gradient(to bottom, black, black 55%, transparent 95%)",
              maskImage: "linear-gradient(to bottom, black, black 55%, transparent 95%)",
            }}
          >
            {/* warm glow blob */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                width: Math.min(W * 0.62, fontSize * longestLine * 0.62),
                height: reflH * 0.85,
                transform: "translateX(-50%)",
                background:
                  "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(255,190,90,0.95), rgba(255,90,150,0.55) 45%, rgba(140,60,190,0.35) 72%, rgba(0,0,0,0) 100%)",
                filter: `blur(${Math.max(2, bloom * 0.35)}px) url(#${filterId})`,
                opacity: glowOpacity,
                mixBlendMode: "screen",
              }}
            />

            {/* second, tighter/brighter core so the waterline itself reads bright */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -6,
                width: Math.min(W * 0.4, fontSize * longestLine * 0.42),
                height: 60,
                transform: "translateX(-50%)",
                background:
                  "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,225,180,0.95), rgba(255,255,255,0) 80%)",
                filter: `blur(${Math.max(2, bloom * 0.2)}px) url(#${filterId})`,
                opacity: Math.min(1, glowOpacity + 0.25),
                mixBlendMode: "screen",
              }}
            />

            {/* animated horizontal specular streaks, warped by the same filter */}
            <div
              className="wrt-streaks"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, rgba(255,255,255,0) 3px, rgba(255,255,255,0) 7px)",
                backgroundSize: "100% 26px",
                filter: `url(#${filterId})`,
                opacity: 0.35 * glowOpacity,
                mixBlendMode: "overlay",
                animation: `wrt-shimmer ${rippleDuration * 1.4}s linear infinite`,
              }}
            />
          </div>

          {/* depth darkening toward the bottom of the water */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: horizonY,
              width: W,
              height: reflH,
              background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.65))",
              pointerEvents: "none",
              opacity: bgOpacity,
            }}
          />

          {/* bright glint right at the waterline */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: horizonY - 6,
              width: W,
              height: 12,
              background:
                "linear-gradient(to right, rgba(255,255,255,0) 10%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 90%)",
              filter: `blur(${bloom * 0.4}px)`,
              opacity: 0.6 * bgOpacity,
              pointerEvents: "none",
            }}
          />
        </>
      )}

      <style>{`
        @keyframes wrt-shimmer {
          0%   { background-position: 0 0; }
          100% { background-position: 0 52px; }
        }
        @keyframes wrt-ripple {
          0%   { width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; opacity: 0.8; border-width: 3px; }
          100% { width: 460px; height: 100px; margin-left: -230px; margin-top: -50px; opacity: 0; border-width: 0.5px; }
        }
      `}</style>
    </div>
  );
}