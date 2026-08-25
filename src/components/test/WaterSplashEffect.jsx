import React, { useEffect, useRef, useId } from "react";
import gsap from "gsap";

/**
 * WaterSplashEffect
 * -------------------------------------------------------------------------
 * Code-driven (no video/Lottie) cinematic splash reaction, built to be
 * scrubbed forward AND backward by a parent GSAP scroll timeline.
 *
 * Usage (inside a parent's useEffect, once `tl` exists):
 *
 *   <svg style={{position:"absolute", inset:0, overflow:"visible", zIndex:8, pointerEvents:"none"}}>
 *     <WaterSplashEffect
 *       timeline={tl}
 *       impactLabel={90}
 *       impactX={SPHERE.cx}
 *       impactY={DROP_TARGET_PCT}
 *       waterFilterFineId="waterRippleFine"
 *       waterFilterBroadId="waterRippleBroad"
 *     />
 *   </svg>
 *
 * All coordinates are in the SAME % units your other elements already use
 * (left/top as % of the outer wrapper). Internally converted to an SVG
 * viewBox of 0..100 x 0..100 so `impactX`/`impactY` map 1:1 to your existing
 * SPHERE.cx / DROP_TARGET_PCT values — no extra math needed at the call site.
 */
export default function WaterSplashEffect({
  timeline,                       // required: parent's GSAP timeline instance
  impactLabel = 0,                // required: timeline position (matches your numeric label system, e.g. 90)

  impactX = 58,                   // % — defaults match your SPHERE.cx
  impactY = 90,                   // % — defaults match your DROP_TARGET_PCT

  splashScale = 1,                // global size multiplier for the whole effect
  ringCount = 3,                  // capillary ripple rings
  dropletCount = 12,              // spray particles
  color = "255,255,255",          // RGB triplet used for all splash whites/highlights
  turbulenceIntensity = 1,        // multiplier on how hard the water filters spike

  waterFilterFineId = "waterRippleFine",   // id of your existing <feDisplacementMap>
  waterFilterBroadId = "waterRippleBroad", // id of your existing <feDisplacementMap>
  waterFilterFineRestScale = 14,  // resting scale values to spike from/return to
  waterFilterBroadRestScale = 22,

  // Timeline units — these match your parent's 0..100 unit system, NOT seconds.
  // Tune these to taste; comments show what each stage represents.
  compressionDuration = 0.6,
  crownDuration = 1.2,
  dropletDuration = 3.5,
  jetDuration = 1.8,
  turbulenceDuration = 3,
  rippleDuration = 5,
  settleDelay = 3.5,              // when persistent rings start fading in, relative to impactLabel
}) {
  const uid = useId().replace(/:/g, "");
  const gooId = `goo-${uid}`;

  const crownRefs = useRef([]);
  crownRefs.current = [];
  const dropletRefs = useRef([]);
  dropletRefs.current = [];
  const jetRef = useRef(null);
  const cavityRef = useRef(null);
  const ringRefs = useRef([]);
  ringRefs.current = [];
  const settledRingRefs = useRef([]);
  settledRingRefs.current = [];

  // Deterministic per-droplet ballistic parameters, generated once.
  const dropletParams = useRef(
    Array.from({ length: dropletCount }, (_, i) => {
      const angle = (i / dropletCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 14 + Math.random() * 12;      // launch speed, arbitrary units
      const vx = Math.cos(angle) * speed;
      const vy = -Math.abs(Math.sin(angle) * speed) - 6; // always launches upward
      return {
        vx,
        vy,
        gravity: 34 + Math.random() * 10,
        size: 2.5 + Math.random() * 2.5,
        delay: Math.random() * 0.15, // slight stagger so they don't fire in perfect unison
      };
    })
  ).current;

  useEffect(() => {
    if (!timeline) return;
    const tl = timeline;
    const t = impactLabel;
    const S = splashScale;

    // =====================================================================
    // STAGE 1 — Impact compression is handled by the PARENT on the orb
    // itself (squash/stretch on orbContainerRef). This component only
    // handles the water's reaction, so nothing here — see integration
    // notes for the orb-side squash tween.
    // =====================================================================

    // =====================================================================
    // STAGE 2 — Crown splash: 5 irregular blobs merged via the gooey filter
    // so they read as one continuous jagged liquid crown, not separate dots.
    // Each blob gets a randomized angle offset + stagger for organic asymmetry.
    // =====================================================================
    crownRefs.current.forEach((el, i) => {
      if (!el) return;
      const angle = (i / crownRefs.current.length) * Math.PI * 2;
      const dist = 3.5 * S;
      const ox = Math.cos(angle) * dist;
      const oy = Math.sin(angle) * dist * 0.4; // flattened for water-surface perspective

      tl.fromTo(
        el,
        { attr: { cx: impactX, cy: impactY, r: 0 }, opacity: 0 },
        {
          attr: { cx: impactX + ox, cy: impactY + oy, r: (5 + Math.random() * 2.5) * S },
          opacity: 0.9,
          duration: crownDuration * 0.4,
          ease: "power2.out",
        },
        t + i * 0.03
      ).to(
        el,
        {
          attr: { r: 0 },
          opacity: 0,
          duration: crownDuration * 0.6,
          ease: "power1.in",
        },
        t + crownDuration * 0.4 + i * 0.03
      );
    });

    // =====================================================================
    // STAGE 3 — Droplet spray/breakup: true projectile motion parameterized
    // by progress `p` (0..1), so it's scrub-safe in both directions.
    // x(p) = vx * p ; y(p) = vy * p + 0.5 * g * p^2  (SVG y-down = gravity positive)
    // =====================================================================
    dropletRefs.current.forEach((el, i) => {
      if (!el) return;
      const { vx, vy, gravity, delay } = dropletParams[i];
      const proxy = { p: 0 };

      tl.to(
        proxy,
        {
          p: 1,
          duration: dropletDuration,
          ease: "none",
          onUpdate: () => {
            const p = proxy.p;
            const x = impactX + vx * p * S * 0.4;
            const y = impactY + (vy * p + 0.5 * gravity * p * p) * S * 0.4;
            // fade in fast, hold, fade out on "landing" (p approaching 1)
            const opacity =
              p < 0.08 ? p / 0.08 : p > 0.8 ? Math.max(0, 1 - (p - 0.8) / 0.2) : 1;
            el.setAttribute("cx", x);
            el.setAttribute("cy", y);
            el.setAttribute("opacity", opacity);
          },
        },
        t + delay
      );
    });

    // =====================================================================
    // STAGE 4 — Cavity + Rayleigh jet: surface dips inward at impact, then
    // a thin tapered spike shoots straight up from center and collapses.
    // =====================================================================
    if (cavityRef.current) {
      tl.fromTo(
        cavityRef.current,
        { attr: { rx: 0, ry: 0 }, opacity: 0 },
        { attr: { rx: 9 * S, ry: 3 * S }, opacity: 0.5, duration: 0.35, ease: "power2.out" },
        t
      ).to(
        cavityRef.current,
        { attr: { rx: 0, ry: 0 }, opacity: 0, duration: 0.5, ease: "power1.in" },
        t + 0.35
      );
    }

    if (jetRef.current) {
      tl.fromTo(
        jetRef.current,
        { scaleY: 0, opacity: 0, transformOrigin: "50% 100%" },
        { scaleY: 1, opacity: 0.85, duration: jetDuration * 0.4, ease: "power3.out" },
        t + 0.15 // jet follows shortly after the cavity forms
      ).to(
        jetRef.current,
        { scaleY: 0, opacity: 0, duration: jetDuration * 0.6, ease: "power2.in" },
        t + 0.15 + jetDuration * 0.4
      );
    }

    // =====================================================================
    // STAGE 5 — Turbulence spike on the EXISTING water feDisplacementMap
    // filters (referenced by id, since they live in the parent's <svg defs>).
    // =====================================================================
    const fineEl = document.getElementById(waterFilterFineId);
    const broadEl = document.getElementById(waterFilterBroadId);

    if (fineEl) {
      tl.to(fineEl, { attr: { scale: 14 + 26 * turbulenceIntensity }, duration: 0.25, ease: "power2.out" }, t)
        .to(fineEl, { attr: { scale: waterFilterFineRestScale }, duration: turbulenceDuration, ease: "power1.out" }, ">");
    }
    if (broadEl) {
      tl.to(broadEl, { attr: { scale: 22 + 34 * turbulenceIntensity }, duration: 0.3, ease: "power2.out" }, t)
        .to(broadEl, { attr: { scale: waterFilterBroadRestScale }, duration: turbulenceDuration, ease: "power1.out" }, ">");
    }

    // =====================================================================
    // STAGE 6 — Capillary ripple rings: staggered concentric expansion,
    // distorted by the fine turbulence filter so they aren't perfect circles.
    // =====================================================================
    ringRefs.current.forEach((el, i) => {
      if (!el) return;
      const delay = i * 0.25;
      tl.fromTo(
        el,
        { attr: { rx: 2, ry: 0.6 }, opacity: 0.85 },
        {
          attr: { rx: (14 + i * 6) * S, ry: (3.5 + i * 1.4) * S },
          opacity: 0,
          duration: rippleDuration,
          ease: "power2.out",
        },
        t + delay
      );
    });

    // =====================================================================
    // STAGE 7 — Settled/lingering rings: fade in after the splash energy
    // dissipates and STAY, with a slow CSS-driven breathing loop (handled
    // via className + keyframes, not GSAP, since it needs to loop forever
    // independent of scrub position once visible).
    // =====================================================================
    settledRingRefs.current.forEach((el, i) => {
      if (!el) return;
      tl.to(
        el,
        { opacity: 0.35 - i * 0.09, duration: 1, ease: "power1.out" },
        t + settleDelay + i * 0.2
      );
    });
  }, [
    timeline,
    impactLabel,
    impactX,
    impactY,
    splashScale,
    turbulenceIntensity,
    waterFilterFineId,
    waterFilterBroadId,
  ]);

  return (
    <>
      <defs>
        {/* Gooey filter: blurs blobs together then sharpens alpha back up,
            causing separate shapes to visually MERGE into one liquid form. */}
        <filter id={gooId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>

      {/* Crown splash blobs — merged via gooey filter */}
      <g filter={`url(#${gooId})`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <circle
            key={i}
            ref={(el) => (crownRefs.current[i] = el)}
            cx={impactX}
            cy={impactY}
            r="0"
            fill={`rgba(${color},0.9)`}
            opacity="0"
          />
        ))}
      </g>

      {/* Cavity dip at impact point */}
      <ellipse
        ref={cavityRef}
        cx={impactX}
        cy={impactY}
        rx="0"
        ry="0"
        fill="rgba(10,16,30,0.5)"
        opacity="0"
      />

      {/* Rayleigh jet — thin tapered vertical spike */}
      <polygon
        ref={jetRef}
        points={`${impactX - 1.1},${impactY} ${impactX + 1.1},${impactY} ${impactX + 0.25},${impactY - 14 * splashScale} ${impactX - 0.25},${impactY - 14 * splashScale}`}
        fill={`rgba(${color},0.9)`}
        opacity="0"
      />

      {/* Droplet spray */}
      {Array.from({ length: dropletCount }).map((_, i) => (
        <circle
          key={i}
          ref={(el) => (dropletRefs.current[i] = el)}
          cx={impactX}
          cy={impactY}
          r={dropletParams[i].size}
          fill={`rgba(${color},0.95)`}
          opacity="0"
        />
      ))}

      {/* Capillary ripple rings (transient) */}
      {Array.from({ length: ringCount }).map((_, i) => (
        <ellipse
          key={i}
          ref={(el) => (ringRefs.current[i] = el)}
          cx={impactX}
          cy={impactY}
          rx="0"
          ry="0"
          fill="none"
          stroke={`rgba(${color},0.7)`}
          strokeWidth={1.5 - i * 0.3}
          opacity="0"
        />
      ))}

      {/* Settled/lingering rings — persist + breathe via CSS keyframes */}
      <style>{`
        @keyframes splashRingBreathe {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.035); }
          100% { transform: scale(1); }
        }
      `}</style>
      {Array.from({ length: 3 }).map((_, i) => (
        <ellipse
          key={i}
          ref={(el) => (settledRingRefs.current[i] = el)}
          cx={impactX}
          cy={impactY}
          rx={(9 + i * 5) * splashScale}
          ry={(2.4 + i * 1.3) * splashScale}
          fill="none"
          stroke={`rgba(${color},0.6)`}
          strokeWidth="0.6"
          opacity="0"
          style={{
            transformOrigin: `${impactX}px ${impactY}px`,
            transformBox: "fill-box",
            animation: `splashRingBreathe ${5 + i * 1.5}s ease-in-out infinite`,
          }}
        />
      ))}
    </>
  );
}