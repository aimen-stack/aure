import React, { useEffect, useRef, useCallback } from "react";

/**
 * WaterSplashEffect
 * -----------------
 * A Canvas2D water-drop "coronet" splash — the classic Harold Edgerton
 * milk-drop shot: a merged, glassy crown of liquid spikes rising from
 * the surface, a few fully detached droplets flying above it with real
 * gravity, and expanding ripples on the water.
 *
 * No WebGL, no libraries. Two techniques do the heavy lifting:
 *
 * 1. GOOEY METABALLS for the crown — several blurred circles are drawn
 *    to an offscreen buffer, the alpha channel is thresholded (hard
 *    edge), then a gradient is composited in with `source-in`. That's
 *    what makes the spikes look like one continuous liquid shape
 *    instead of overlapping blobs.
 *
 * 2. REAL PHYSICS for droplets & tendrils — positions are integrated
 *    frame-to-frame with actual gravity (v += g * dt), not eyeballed
 *    easing curves, so trajectories look physically consistent.
 *
 * Usage:
 *   <div style={{ position: "relative", width: "100%", height: 480 }}>
 *     <WaterSplashEffect backgroundImage="/your-photo.jpg" autoPlay />
 *   </div>
 *
 * Click/tap anywhere on the water to trigger a splash at that point.
 */

const GRAVITY = 1400; // px/s^2
const MAX_SPLASHES = 4;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ---- one liquid crown + its droplets + its ripples --------------------

function createSplash(x, waterY, strength = 1) {
  const tendrilCount = Math.round(rand(8, 10));
  const heroSlots = [Math.floor(tendrilCount * 0.45), Math.floor(tendrilCount * 0.55)];
  const spreadWidth = 150 * strength;

  const tendrils = [];
  for (let i = 0; i < tendrilCount; i++) {
    const isHero = heroSlots.includes(i);
    const frac = tendrilCount === 1 ? 0 : i / (tendrilCount - 1) - 0.5; // -0.5..0.5
    const baseXOffset = frac * spreadWidth;
    const leanSign = frac === 0 ? 0 : Math.sign(frac);
    tendrils.push({
      startDelay: isHero ? 0 : rand(0, 110),
      duration: (isHero ? rand(680, 820) : rand(380, 600)) * (0.85 + strength * 0.3),
      maxHeight: (isHero ? rand(160, 205) : rand(45, 100)) * strength,
      baseXOffset,
      outwardLean: leanSign * rand(6, 16) + rand(-4, 4),
      baseRadius: isHero ? rand(12, 15) : rand(10, 13),
      tipRadius: isHero ? rand(3, 4.5) : rand(1.6, 3),
      dropletAt: isHero ? [0.42, 0.66] : Math.random() < 0.3 ? [rand(0.55, 0.75)] : [],
      dropletsSpawned: 0,
      isHero,
    });
  }

  return {
    x,
    waterY,
    born: performance.now(),
    tendrils,
    cavity: { maxRadius: rand(24, 32) * strength, maxHeight: rand(12, 18) * strength },
    droplets: [],
    ripples: [
      { delay: 0, speed: rand(140, 170), maxR: 260, width: 2.2, alpha: 0.5 },
      { delay: 60, speed: rand(110, 130), maxR: 320, width: 1.4, alpha: 0.32 },
      { delay: 160, speed: rand(80, 100), maxR: 380, width: 1, alpha: 0.2 },
    ],
    totalLife: 2200,
    dead: false,
  };
}

// ---- component ----------------------------------------------------------

export default function WaterSplashEffect({
  backgroundImage = null,
  autoPlay = true,
  autoInterval = 3400,
  waterLevel = 0.62, // fraction of container height where the surface sits
  crownColorInner = "#bfe9ff",
  crownColorOuter = "#0050a0",
  className = "",
  style = {},
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef(null);
  const bgImgRef = useRef(null);
  const splashesRef = useRef([]);
  const ambientRipplesRef = useRef([]);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const reducedMotionRef = useRef(false);

  const BUF_W = 300;
  const BUF_H = 380;

  const spawnSplash = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { h } = sizeRef.current;
    const waterY = h * waterLevel;
    const x = clientX != null ? clientX - rect.left : rand(rect.width * 0.3, rect.width * 0.7);

    const active = splashesRef.current.filter((s) => !s.dead);
    if (active.length >= MAX_SPLASHES) return;
    splashesRef.current.push(createSplash(x, waterY, rand(0.85, 1.15)));

    ambientRipplesRef.current.push({
      x,
      waterY,
      born: performance.now(),
      speed: rand(60, 75),
      maxR: 900,
      width: 1,
    });
  }, [waterLevel]);

  // ---- metaball crown render into the small offscreen buffer ----------
  function renderCrown(splash, elapsed) {
    const buf = bufferRef.current;
    const bctx = buf.getContext("2d");
    bctx.clearRect(0, 0, BUF_W, BUF_H);

    const anchorX = BUF_W / 2;
    const anchorY = BUF_H - 30;

    const blobs = [];

    // shallow connecting rim — NOT a dominant ball; just enough to bridge spike bases
    const cavityT = Math.min(elapsed / 260, 1);
    const cavityHeight = splash.cavity.maxHeight * Math.sin(Math.PI * Math.min(elapsed / 900, 1) * 0.55 + 0.05);
    const cavityRadius = lerp(splash.cavity.maxRadius * 0.6, splash.cavity.maxRadius, easeInOut(cavityT));
    blobs.push({ x: anchorX, y: anchorY - cavityHeight * 0.25, r: cavityRadius });
    blobs.push({ x: anchorX, y: anchorY - cavityHeight * 0.6, r: cavityRadius * 0.55 });

    let anyTendrilAlive = false;

    splash.tendrils.forEach((t) => {
      const local = elapsed - t.startDelay;
      if (local < 0) {
        anyTendrilAlive = true;
        return;
      }
      const p = Math.min(local / t.duration, 1);
      if (p < 1) anyTendrilAlive = true;

      const height = t.maxHeight * Math.sin(Math.PI * p);
      const lean = t.outwardLean * Math.sin(Math.PI * p * 0.7);

      const baseX = anchorX + t.baseXOffset;
      const baseY = anchorY - cavityHeight * 0.7;
      const tipX = baseX + lean;
      const tipY = anchorY - Math.max(height, 3);
      const ctrlX = baseX + lean * 0.4;
      const ctrlY = lerp(baseY, tipY, 0.5);

      // fat root blob: overlaps neighboring tendrils' roots so the whole
      // base fuses into one continuous rim instead of separate floating spikes
      blobs.push({ x: baseX, y: anchorY - cavityHeight * 0.4, r: t.baseRadius * 1.55 });

      const samples = 6;
      for (let s = 1; s <= samples; s++) {
        const st = s / samples;
        const it = 1 - st;
        const bx = it * it * baseX + 2 * it * st * ctrlX + st * st * tipX;
        const by = it * it * baseY + 2 * it * st * ctrlY + st * st * tipY;
        const r = lerp(t.baseRadius, t.tipRadius, Math.pow(st, 0.8));
        blobs.push({ x: bx, y: by, r });
      }

      // detach droplets at their scheduled fractions
      t.dropletAt.forEach((frac, idx) => {
        if (p >= frac && t.dropletsSpawned === idx) {
          const dx = it_dx(baseX, ctrlX, tipX, frac);
          const dy = it_dy(baseY, ctrlY, tipY, frac);
          splash.droplets.push({
            x: dx,
            y: dy,
            vy: -(t.maxHeight / t.duration) * 820 * (0.6 - frac * 0.15),
            vx: lean >= 0 ? rand(15, 38) : rand(-38, -15),
            r: lerp(t.tipRadius, t.tipRadius * 0.7, frac) + 1.4,
            born: performance.now(),
            landed: false,
          });
          t.dropletsSpawned++;
        }
      });
    });

    if (blobs.length === 0) return { alive: anyTendrilAlive, anchorX, anchorY };

    // 1) blurred silhouette
    bctx.save();
    bctx.filter = "blur(3.2px)";
    bctx.fillStyle = "#fff";
    blobs.forEach((b) => {
      bctx.beginPath();
      bctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      bctx.fill();
    });
    bctx.restore();

    // 2) threshold alpha -> hard merged edge
    const img = bctx.getImageData(0, 0, BUF_W, BUF_H);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) {
      d[i] = d[i] > 115 ? 255 : 0;
    }
    bctx.putImageData(img, 0, 0);

    // 3) composite liquid gradient into the silhouette
    bctx.globalCompositeOperation = "source-in";
    const grad = bctx.createLinearGradient(0, anchorY - 220, 0, anchorY);
    grad.addColorStop(0, crownColorInner);
    grad.addColorStop(0.45, "#4fb8e8");
    grad.addColorStop(1, crownColorOuter);
    bctx.fillStyle = grad;
    bctx.fillRect(0, 0, BUF_W, BUF_H);
    bctx.globalCompositeOperation = "source-over";

    // 4) thin specular rim — a second, smaller silhouette blended lighter
    bctx.save();
    bctx.globalCompositeOperation = "lighter";
    bctx.globalAlpha = 0.35;
    bctx.filter = "blur(2px)";
    bctx.fillStyle = "#eafcff";
    blobs.forEach((b) => {
      bctx.beginPath();
      bctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.28, b.r * 0.32, 0, Math.PI * 2);
      bctx.fill();
    });
    bctx.restore();

    return { alive: anyTendrilAlive || elapsed < splash.totalLife, anchorX, anchorY };
  }

  function it_dx(a, c, b, t) {
    const it = 1 - t;
    return it * it * a + 2 * it * t * c + t * t * b;
  }
  function it_dy(a, c, b, t) {
    const it = 1 - t;
    return it * it * a + 2 * it * t * c + t * t * b;
  }

  function drawDroplets(ctx, splash, dt) {
    splash.droplets = splash.droplets.filter((dr) => {
      if (dr.landed) return false;
      dr.vy += GRAVITY * dt;
      dr.x += dr.vx * dt;
      dr.y += dr.vy * dt;

      const worldX = splash.x - BUF_W / 2 + dr.x;
      const worldY = splash.waterY - BUF_H + dr.y;

      if (worldY >= splash.waterY) {
        dr.landed = true;
        ambientRipplesRef.current.push({
          x: worldX,
          waterY: splash.waterY,
          born: performance.now(),
          speed: rand(35, 50),
          maxR: 90,
          width: 0.8,
          faint: true,
        });
        return false;
      }

      const grad = ctx.createRadialGradient(
        worldX - dr.r * 0.3, worldY - dr.r * 0.3, 0.4,
        worldX, worldY, dr.r
      );
      grad.addColorStop(0, "#f2fdff");
      grad.addColorStop(0.4, crownColorInner);
      grad.addColorStop(1, crownColorOuter);
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(worldX, worldY, dr.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.arc(worldX - dr.r * 0.32, worldY - dr.r * 0.32, dr.r * 0.28, 0, Math.PI * 2);
      ctx.fill();

      return true;
    });
  }

  function drawRipples(ctx, w, h, now) {
    ambientRipplesRef.current = ambientRipplesRef.current.filter((r) => {
      const age = (now - r.born) / 1000;
      const radius = age * r.speed;
      if (radius > r.maxR) return false;

      const alpha = Math.max(0, 1 - radius / r.maxR) * (r.faint ? 0.22 : 0.4);
      if (alpha <= 0.003) return false;

      ctx.save();
      ctx.translate(r.x, r.waterY);
      ctx.scale(1, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(210,235,255,${alpha})`;
      ctx.lineWidth = r.width;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.985, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,196,110,${alpha * 0.5})`;
      ctx.lineWidth = r.width * 0.6;
      ctx.stroke();
      ctx.restore();
      return true;
    });
  }

  function drawWaterSurface(ctx, w, h, now) {
    const waterY = h * waterLevel;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, waterY - 1, w, h - waterY + 1);
    ctx.clip();

    if (bgImgRef.current) {
      const img = bgImgRef.current;
      const scale = Math.max(w / img.width, (h - waterY) / img.height) * 1.15;
      const iw = img.width * scale;
      const ih = img.height * scale;
      ctx.save();
      ctx.filter = "blur(3px) saturate(1.15) brightness(0.55)";
      ctx.drawImage(img, w / 2 - iw / 2, waterY - ih * 0.15, iw, ih);
      ctx.restore();
      ctx.fillStyle = "rgba(3,10,18,0.35)";
      ctx.fillRect(0, waterY, w, h - waterY);
    } else {
      const g = ctx.createLinearGradient(0, waterY, 0, h);
      g.addColorStop(0, "#0c2333");
      g.addColorStop(1, "#020608");
      ctx.fillStyle = g;
      ctx.fillRect(0, waterY, w, h - waterY);
    }

    for (let i = 0; i < 4; i++) {
      const yy = waterY + (h - waterY) * (0.15 + i * 0.22);
      const shift = Math.sin(now / 2600 + i * 1.7) * 18;
      const bandGrad = ctx.createLinearGradient(0, yy, w, yy);
      bandGrad.addColorStop(0, "rgba(255,255,255,0)");
      bandGrad.addColorStop(0.5 + shift / w, `rgba(200,225,255,${0.05 + i * 0.01})`);
      bandGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = bandGrad;
      ctx.fillRect(0, yy - 1, w, 2);
    }
    ctx.restore();
  }

  function drawSky(ctx, w, h, now) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h * waterLevel);
    ctx.clip();
    if (bgImgRef.current) {
      const img = bgImgRef.current;
      const scale = Math.max(w / img.width, (h * waterLevel) / img.height);
      const iw = img.width * scale;
      const ih = img.height * scale;
      ctx.drawImage(img, w / 2 - iw / 2, h * waterLevel - ih, iw, ih);
      ctx.fillStyle = "rgba(2,6,10,0.15)";
      ctx.fillRect(0, 0, w, h * waterLevel);
    } else {
      const g = ctx.createRadialGradient(w / 2, h * waterLevel * 0.5, 10, w / 2, h * waterLevel * 0.5, w * 0.7);
      g.addColorStop(0, "#12293c");
      g.addColorStop(1, "#040a0f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h * waterLevel);
    }
    ctx.restore();
  }

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!backgroundImage) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      bgImgRef.current = img;
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    bufferRef.current = document.createElement("canvas");
    bufferRef.current.width = BUF_W;
    bufferRef.current.height = BUF_H;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const ctx = canvas.getContext("2d");

    const tick = (ts) => {
      const { w, h, dpr } = sizeRef.current;
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      drawSky(ctx, w, h, ts);
      drawWaterSurface(ctx, w, h, ts);
      drawRipples(ctx, w, h, ts);

      splashesRef.current = splashesRef.current.filter((splash) => {
        const elapsed = ts - splash.born;
        if (elapsed > splash.totalLife) return false;

        const { alive } = renderCrown(splash, elapsed);
        const fadeStart = splash.totalLife * 0.5;
        const alpha = elapsed < fadeStart ? 1 : Math.max(0, 1 - (elapsed - fadeStart) / (splash.totalLife - fadeStart));

        if (alpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.drawImage(bufferRef.current, splash.x - BUF_W / 2, splash.waterY - BUF_H, BUF_W, BUF_H);
          ctx.restore();
        }

        drawDroplets(ctx, splash, dt);
        return alive || splash.droplets.length > 0 || elapsed < splash.totalLife;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    if (!reducedMotionRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // static frame: sky + water only, no motion
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawSky(ctx, w, h, 0);
      drawWaterSurface(ctx, w, h, 0);
    }

    let autoTimer = null;
    if (autoPlay && !reducedMotionRef.current) {
      const loop = () => {
        spawnSplash(null, null);
        autoTimer = setTimeout(loop, autoInterval + rand(-400, 400));
      };
      autoTimer = setTimeout(loop, 700);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (autoTimer) clearTimeout(autoTimer);
    };
  }, [autoPlay, autoInterval, spawnSplash, waterLevel, crownColorInner, crownColorOuter]);

  const handleClick = (e) => {
    spawnSplash(e.clientX, e.clientY);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", cursor: "pointer", ...style }}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}