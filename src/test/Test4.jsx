import { useId } from "react";

const W = 1445;
const H = 813;
const WATERLINE = 550;

// a "doorway" outline: straight sides rising into a semicircular top
function archOutline(cx, baseY, halfW, topY) {
  const curveStartY = topY + halfW;
  return `M ${cx - halfW} ${baseY} L ${cx - halfW} ${curveStartY} A ${halfW} ${halfW} 0 0 1 ${cx + halfW} ${curveStartY} L ${cx + halfW} ${baseY} Z`;
}

// a full arch frame = outer doorway minus inner doorway, drawn with evenodd
function archPath(cx, baseY, outerHalfW, outerTopY, innerHalfW, innerTopY) {
  return `${archOutline(cx, baseY, outerHalfW, outerTopY)} ${archOutline(cx, baseY, innerHalfW, innerTopY)}`;
}

const BLOCK_DX = 16;
const BLOCK_DY = -12;
function blockTop(b) {
  return `${b.x},${b.y} ${b.x + b.w},${b.y} ${b.x + b.w + BLOCK_DX},${b.y + BLOCK_DY} ${b.x + BLOCK_DX},${b.y + BLOCK_DY}`;
}
function blockSide(b) {
  return `${b.x + b.w},${b.y} ${b.x + b.w + BLOCK_DX},${b.y + BLOCK_DY} ${b.x + b.w + BLOCK_DX},${b.y + b.h + BLOCK_DY} ${b.x + b.w},${b.y + b.h}`;
}

const MAIN = { cx: 650, baseY: 545, outerHalfW: 180, outerTopY: 55, innerHalfW: 95, innerTopY: 140 };
const ARCH2 = { cx: 990, baseY: 515, outerHalfW: 68, outerTopY: 95, innerHalfW: 45, innerTopY: 122 };
const ARCH3 = { cx: 1155, baseY: 495, outerHalfW: 52, outerTopY: 115, innerHalfW: 34, innerTopY: 138 };
const SPHERE = { cx: 650, cy: 460, r: 125 };
const CONES = [
  { cx: 250, apexY: 290, halfW: 20 },
  { cx: 292, apexY: 335, halfW: 16 },
  { cx: 335, apexY: 305, halfW: 22 },
];
const BLOCKS = [
  { x: 30, y: 280, w: 110, h: 265 },
  { x: 90, y: 380, w: 150, h: 165 },
];
const STEPS = [
  { x: 55, y: 458, w: 130, h: 14 },
  { x: 30, y: 480, w: 165, h: 16 },
  { x: 5, y: 503, w: 195, h: 17 },
  { x: -20, y: 526, w: 225, h: 19 },
];
const SMALL_BOULDER = { cx: 405, cy: 522, rx: 38, ry: 24 };
// flat wall/pillar segments filling the gaps between archways
const PILLARS = [
  { x1: MAIN.cx + MAIN.outerHalfW, x2: ARCH2.cx - ARCH2.outerHalfW, top: 75, base: 518, grad: "wallLit", opacity: 0.92 },
  { x1: ARCH2.cx + ARCH2.outerHalfW, x2: ARCH3.cx - ARCH3.outerHalfW, top: 115, base: 498, grad: "wallFar", opacity: 0.7 },
  { x1: ARCH3.cx + ARCH3.outerHalfW, x2: ARCH3.cx + ARCH3.outerHalfW + 40, top: 135, base: 480, grad: "wallFar", opacity: 0.55 },
];

export default function Test4() {
  const uid = useId().replace(/:/g, "");

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        aspectRatio: `${W} / ${H}`,
        overflow: "hidden",
        background: "#7d6d6d",
      }}
    >
      <style>{`
        @keyframes t4-sphere-glow {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 0.9; }
        }
        @keyframes t4-sphere-float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes t4-shimmer {
          0%   { background-position: 0 0; }
          100% { background-position: 0 48px; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, display: "block" }}
      >
        <defs>
          <linearGradient id={`${uid}-sky`} x1={W * 0.05} y1={WATERLINE} x2={W * 0.95} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5f4d51" />
            <stop offset="30%" stopColor="#8c7267" />
            <stop offset="55%" stopColor="#b99c88" />
            <stop offset="78%" stopColor="#c9c2c3" />
            <stop offset="100%" stopColor="#dcd9dc" />
          </linearGradient>

          <radialGradient id={`${uid}-haze`} cx={MAIN.cx + 40} cy={MAIN.outerTopY + 120} r={W * 0.42} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff2d9" stopOpacity="0.75" />
            <stop offset="35%" stopColor="#f3bd93" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8c7267" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${uid}-hazeCool`} cx={W * 0.86} cy={H * 0.22} r={W * 0.32} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#eae6ea" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eae6ea" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`${uid}-archMain`} x1={MAIN.cx - MAIN.outerHalfW} y1="0" x2={MAIN.cx + MAIN.outerHalfW * 0.6} y2={MAIN.baseY} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d9c6b8" />
            <stop offset="45%" stopColor="#bda292" />
            <stop offset="100%" stopColor="#83685f" />
          </linearGradient>

          <linearGradient id={`${uid}-archInner`} x1={MAIN.cx - MAIN.innerHalfW} y1={MAIN.innerTopY} x2={MAIN.cx + MAIN.innerHalfW} y2={MAIN.baseY} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#efceac" />
            <stop offset="55%" stopColor="#8f6f6a" />
            <stop offset="100%" stopColor="#463639" />
          </linearGradient>

          <linearGradient id={`${uid}-archFar`} x1="0" y1="1" x2="0.4" y2="0">
            <stop offset="0%" stopColor="#b3948c" />
            <stop offset="100%" stopColor="#c7c1cc" />
          </linearGradient>

          <linearGradient id={`${uid}-wallLit`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d3bfb0" />
            <stop offset="100%" stopColor="#8a7166" />
          </linearGradient>

          <linearGradient id={`${uid}-wallFar`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9b3ac" />
            <stop offset="100%" stopColor="#c7c1cc" />
          </linearGradient>

          <radialGradient id={`${uid}-sphere`} cx="36%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="18%" stopColor="#ffd68f" />
            <stop offset="40%" stopColor="#ec9f6e" />
            <stop offset="62%" stopColor="#c17f96" />
            <stop offset="82%" stopColor="#7c69a8" />
            <stop offset="100%" stopColor="#392f61" />
          </radialGradient>

          <radialGradient id={`${uid}-boulder`} cx="35%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#d4c9c6" />
            <stop offset="55%" stopColor="#a6989a" />
            <stop offset="100%" stopColor="#786c72" />
          </radialGradient>

          <linearGradient id={`${uid}-blockStone`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#e3d6c4" />
            <stop offset="100%" stopColor="#a68f7c" />
          </linearGradient>

          <linearGradient id={`${uid}-cone`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6ecdf" />
            <stop offset="100%" stopColor="#b3a294" />
          </linearGradient>

          <linearGradient id={`${uid}-water`} x1="0" y1={WATERLINE} x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#221c30" />
            <stop offset="100%" stopColor="#030208" />
          </linearGradient>

          <linearGradient id={`${uid}-reflFade`} x1="0" y1={WATERLINE} x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={`${uid}-reflMask`}>
            <rect x="0" y={WATERLINE} width={W} height={H - WATERLINE} fill={`url(#${uid}-reflFade)`} />
          </mask>
          <filter id={`${uid}-reflBlur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <clipPath id={`${uid}-waterClip`}>
            <rect x="0" y={WATERLINE} width={W} height={H - WATERLINE} />
          </clipPath>
          <clipPath id={`${uid}-innerArchClip`}>
            <path d={archOutline(MAIN.cx, MAIN.baseY, MAIN.innerHalfW, MAIN.innerTopY)} />
          </clipPath>

          <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" />
          </filter>

          <filter id={`${uid}-mottle`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="9" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0" />
          </filter>
        </defs>

        {/* sky */}
        <rect x="0" y="0" width={W} height={WATERLINE} fill={`url(#${uid}-sky)`} />
        <rect x="0" y="0" width={W} height={WATERLINE} fill={`url(#${uid}-hazeCool)`} />
        <rect x="0" y="0" width={W} height={WATERLINE} fill={`url(#${uid}-haze)`} />

        {/* flat wall/pillar segments between the archways */}
        {PILLARS.map((p, i) => (
          <rect key={i} x={p.x1} y={p.top} width={Math.max(0, p.x2 - p.x1)} height={p.base - p.top} fill={`url(#${uid}-${p.grad})`} opacity={p.opacity} />
        ))}

        {/* distant arches */}
        <path d={archPath(ARCH3.cx, ARCH3.baseY, ARCH3.outerHalfW, ARCH3.outerTopY, ARCH3.innerHalfW, ARCH3.innerTopY)} fillRule="evenodd" fill={`url(#${uid}-archFar)`} opacity="0.75" />
        <path d={archPath(ARCH2.cx, ARCH2.baseY, ARCH2.outerHalfW, ARCH2.outerTopY, ARCH2.innerHalfW, ARCH2.innerTopY)} fillRule="evenodd" fill={`url(#${uid}-archFar)`} opacity="0.9" />

        {/* boulder, right */}
        <ellipse cx="1250" cy="472" rx="140" ry="70" fill="rgba(20,10,20,0.25)" />
        <ellipse cx="1250" cy="460" rx="135" ry="68" fill={`url(#${uid}-boulder)`} />


        {/* left plinth blocks, drawn as simple 3-face boxes for depth */}
        {BLOCKS.map((b, i) => (
          <g key={i}>
            <polygon points={blockSide(b)} fill="#8f7a68" />
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={`url(#${uid}-blockStone)`} />
            <polygon points={blockTop(b)} fill="#f0e4d3" />
          </g>
        ))}

        {/* cone spikes */}
        {CONES.map((c, i) => (
          <polygon key={i} points={`${c.cx - c.halfW},${MAIN.baseY} ${c.cx + c.halfW},${MAIN.baseY} ${c.cx},${c.apexY}`} fill={`url(#${uid}-cone)`} />
        ))}

        {/* steps into the water: each a lit tread + shadowed riser */}
        {STEPS.map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y + 5} width={s.w} height={s.h - 5} fill="#8f7a68" />
            <rect x={s.x} y={s.y} width={s.w} height={6} fill="#e6d9c6" />
          </g>
        ))}

        {/* small boulder near the steps */}
        <ellipse cx={SMALL_BOULDER.cx} cy={SMALL_BOULDER.cy} rx={SMALL_BOULDER.rx} ry={SMALL_BOULDER.ry} fill={`url(#${uid}-boulder)`} />

        {/* main arch */}
        <path d={archPath(MAIN.cx, MAIN.baseY, MAIN.outerHalfW, MAIN.outerTopY, MAIN.innerHalfW, MAIN.innerTopY)} fillRule="evenodd" fill={`url(#${uid}-archMain)`} />

        {/* lit back wall inside the arch opening, with a diagonal light beam */}
        <g clipPath={`url(#${uid}-innerArchClip)`}>
          <rect x={MAIN.cx - MAIN.innerHalfW} y={MAIN.innerTopY - MAIN.innerHalfW} width={MAIN.innerHalfW * 2} height={MAIN.baseY - MAIN.innerTopY + MAIN.innerHalfW} fill={`url(#${uid}-archInner)`} />
          <rect
            x={MAIN.cx - MAIN.innerHalfW * 1.6}
            y={MAIN.innerTopY - 80}
            width={MAIN.innerHalfW * 0.7}
            height={MAIN.baseY - MAIN.innerTopY + 180}
            fill="rgba(255,235,195,0.5)"
            transform={`rotate(22 ${MAIN.cx} ${MAIN.innerTopY})`}
          />
        </g>

        {/* glowing sphere, with a mottled pearl-like surface texture */}
        <g style={{ animation: "t4-sphere-float 6s ease-in-out infinite" }}>
          <circle cx={SPHERE.cx} cy={SPHERE.cy} r={SPHERE.r} fill={`url(#${uid}-sphere)`} />
          <circle cx={SPHERE.cx} cy={SPHERE.cy} r={SPHERE.r} fill="#fff" opacity="0.5" filter={`url(#${uid}-mottle)`} style={{ mixBlendMode: "soft-light" }} />
        </g>

        {/* water */}
        <rect x="0" y={WATERLINE} width={W} height={H - WATERLINE} fill={`url(#${uid}-water)`} />

        {/* reflection */}
        <g clipPath={`url(#${uid}-waterClip)`}>
          <g mask={`url(#${uid}-reflMask)`} filter={`url(#${uid}-reflBlur)`} opacity="0.6">
            <g transform={`translate(0 ${2 * WATERLINE}) scale(1 -1)`}>
              <path d={archPath(MAIN.cx, MAIN.baseY, MAIN.outerHalfW, MAIN.outerTopY, MAIN.innerHalfW, MAIN.innerTopY)} fillRule="evenodd" fill={`url(#${uid}-archMain)`} />
              <circle cx={SPHERE.cx} cy={SPHERE.cy} r={SPHERE.r} fill={`url(#${uid}-sphere)`} />
              {BLOCKS.map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={`url(#${uid}-blockStone)`} />
              ))}
              <ellipse cx="1250" cy="460" rx="135" ry="68" fill={`url(#${uid}-boulder)`} />
              {CONES.map((c, i) => (
                <polygon key={i} points={`${c.cx - c.halfW},${MAIN.baseY} ${c.cx + c.halfW},${MAIN.baseY} ${c.cx},${c.apexY}`} fill={`url(#${uid}-cone)`} opacity="0.9" />
              ))}
            </g>
          </g>
        </g>

        {/* whole-scene stucco/film grain */}
        <rect x="0" y="0" width={W} height={H} filter={`url(#${uid}-grain)`} style={{ mixBlendMode: "overlay" }} />
      </svg>

      {/* soft warm glow bleeding out of the arch, screen-blended over everything */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${(SPHERE.cx / W) * 100}%`,
          top: `${(SPHERE.cy / H) * 100}%`,
          width: `${((SPHERE.r * 2.6) / W) * 100}%`,
          aspectRatio: "1 / 1",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(255,220,170,0.55) 0%, rgba(230,140,180,0.28) 40%, rgba(230,140,180,0) 72%)",
          mixBlendMode: "screen",
          filter: "blur(6px)",
          animation: "t4-sphere-glow 5s ease-in-out infinite",
        }}
      />

      {/* tight glossy specular highlight on the sphere */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${((SPHERE.cx - SPHERE.r * 0.42) / W) * 100}%`,
          top: `${((SPHERE.cy - SPHERE.r * 0.5) / H) * 100}%`,
          width: `${((SPHERE.r * 0.5) / W) * 100}%`,
          aspectRatio: "1 / 1",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          pointerEvents: "none",
          background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 75%)",
          filter: "blur(3px)",
        }}
      />

      {/* ground mist around the base of the blocks and boulder */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${(90 / W) * 100}%`,
          top: `${(430 / H) * 100}%`,
          width: `${(420 / W) * 100}%`,
          height: `${(160 / H) * 100}%`,
          pointerEvents: "none",
          background: "radial-gradient(ellipse, rgba(255,245,230,0.4) 0%, rgba(255,245,230,0) 72%)",
          filter: "blur(10px)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${(950 / W) * 100}%`,
          top: `${(420 / H) * 100}%`,
          width: `${(340 / W) * 100}%`,
          height: `${(150 / H) * 100}%`,
          pointerEvents: "none",
          background: "radial-gradient(ellipse, rgba(255,245,230,0.32) 0%, rgba(255,245,230,0) 72%)",
          filter: "blur(10px)",
        }}
      />

      {/* animated water shimmer */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${(WATERLINE / H) * 100}%`,
          bottom: 0,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, rgba(255,255,255,0) 3px, rgba(255,255,255,0) 8px)",
          mixBlendMode: "overlay",
          animation: "t4-shimmer 6s linear infinite",
        }}
      />

      {/* vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
