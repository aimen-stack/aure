/**
 * WaterOrb.jsx
 * -----------------------------------------------------------------------
 * A self-contained, dependency-light (just `three`) React component that
 * renders the "glass gradient orb" look (like the reference photo: a
 * crinkled translucent sphere going peach -> lavender -> blue, with a soft
 * colored glow/halo) and reacts to the cursor with a real-time water
 * ripple simulation that distorts the surface and blooms outward.
 *
 * On scroll, the orb now bursts a directional plume of curling water
 * tendrils out of one side (like the reference image), rather than a
 * diffuse radial puff of particles.
 *
 * It renders on a TRANSPARENT canvas, so you drop it directly on top of
 * your own background image / layout:
 *
 *   <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
 *     <img src="/your-bg.jpg" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
 *     <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
 *       <WaterOrb size={520} />
 *     </div>
 *   </div>
 *
 * Props
 * -----
 * image?        string   Optional texture (e.g. your circle.jpg) mapped onto
 *                         the sphere. If omitted, a procedural peach/lavender/
 *                         blue gradient (matching the reference) is used.
 * size?         number   Fixed square px size. If omitted, fills the parent
 *                         (parent must be positioned + sized).
 * colorA/B/C?   string   Gradient stops for the procedural look (top, mid,
 *                         bottom). Ignored if `image` is set.
 * glowColor?    string   Tint for the fresnel rim / bloom halo.
 * rippleStrength?  number  How strongly the cursor distorts the surface.
 * bloomStrength?   number  How strongly ripples/foam glow.
 * autoRotate?      boolean Slow idle rotation. Default true.
 * idlePulses?      boolean Occasional ambient "breathing" ripples when idle.
 * plumeAngle?      number  Radians. Direction the water plume shoots out on
 *                          scroll (0 = right, PI/2 = up). Default ~0.15 (right,
 *                          slightly up) to match the reference image.
 * plumeSpread?     number  Radians. Angular spread of the tendril fan around
 *                          plumeAngle. Default ~1.0 (about ±57°).
 * className / style
 *
 * Dependencies: three (>=0.150). No postprocessing / addons required.
 * -----------------------------------------------------------------------
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* shaders                                                             */
/* ------------------------------------------------------------------ */

// Fullscreen quad used to step the ripple simulation.
const quadVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Wave-equation update + optional "drop" splat, in one pass.
// R = height, G = velocity.
const rippleFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tState;
  uniform vec2 texel;
  uniform vec3 uDrop;      // xy = uv, z = strength (0 => no drop this step)
  uniform float uDropRadius;
  uniform float uDamping;
  uniform float uSpeed;

  void main() {
    vec2 c = texture2D(tState, vUv).rg;
    float h = c.r;
    float v = c.g;

    float hL = texture2D(tState, vUv - vec2(texel.x, 0.0)).r;
    float hR = texture2D(tState, vUv + vec2(texel.x, 0.0)).r;
    float hD = texture2D(tState, vUv - vec2(0.0, texel.y)).r;
    float hU = texture2D(tState, vUv + vec2(0.0, texel.y)).r;

    float lap = (hL + hR + hD + hU) - 4.0 * h;
    v += lap * uSpeed;
    v *= uDamping;
    h += v;

    if (uDrop.z > 0.0001) {
      float d = distance(vUv, uDrop.xy);
      float falloff = smoothstep(uDropRadius, 0.0, d);
      h += falloff * uDrop.z;
    }

    gl_FragColor = vec4(h, v, 0.0, 1.0);
  }
`;

// Sphere shader: crinkled-glass gradient (or texture) + fresnel + ripple
// driven refraction & bloom/foam. Now also takes a `burstEnergy` uniform
// so the whole surface flares brighter the instant a scroll-splash fires,
// matching the bright crescent glow in the reference image.
const orbVert = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vScreenUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  void main() {
    vUv = uv;
    vLocalPos = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    vec4 clip = projectionMatrix * viewMatrix * worldPos;
    gl_Position = clip;
    vScreenUv = (clip.xy / clip.w) * 0.5 + 0.5;
  }
`;

const orbFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vScreenUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  uniform sampler2D tState;
  uniform vec2 texel;
  uniform float time;

  uniform bool uUseMap;
  uniform sampler2D map;

  uniform vec3 colorA;
  uniform vec3 colorB;
  uniform vec3 colorC;
  uniform vec3 glowColor;

  uniform float refraction;
  uniform float bloomStrength;
  uniform float crinkle;
  uniform float burstEnergy;

  // cheap value noise for the "crinkled glass" micro-normal
  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 suv = clamp(vScreenUv, 0.001, 0.999);
    float h  = texture2D(tState, suv).r;
    float hL = texture2D(tState, suv - vec2(texel.x, 0.0)).r;
    float hR = texture2D(tState, suv + vec2(texel.x, 0.0)).r;
    float hD = texture2D(tState, suv - vec2(0.0, texel.y)).r;
    float hU = texture2D(tState, suv + vec2(0.0, texel.y)).r;
    vec2 grad = vec2(hR - hL, hU - hD);

    // base color: your image, or the procedural peach/lavender/blue gradient
    vec3 base;
    if (uUseMap) {
      vec2 distortedUv = vUv + grad * refraction;
      base = texture2D(map, distortedUv).rgb;
    } else {
      float t = clamp(vLocalPos.y * 0.5 + 0.5 + grad.y * refraction * 2.0, 0.0, 1.0);
      vec3 g = t < 0.5
        ? mix(colorC, colorB, t * 2.0)
        : mix(colorB, colorA, (t - 0.5) * 2.0);
      base = g;
    }

    // crinkled-glass micro bumps
    vec2 cUv = vUv * 9.0;
    float n1 = fbm(cUv + time * 0.02);
    float n2 = fbm(cUv * 1.7 - time * 0.015 + 4.2);
    vec2 crinkleGrad = vec2(n1 - n2, n2 - fbm(cUv + vec2(0.0, 0.6)));
    vec2 clampedGrad = clamp(grad, -0.6, 0.6);
    vec3 N = normalize(vNormalW + vec3((clampedGrad + crinkleGrad * crinkle) * 0.9, 0.0));

    vec3 lightDir = normalize(vec3(0.4, 0.7, 0.6));
    float diff = max(dot(N, lightDir), 0.0);
    vec3 Hh = normalize(lightDir + vViewDir);
    float spec = pow(max(dot(N, Hh), 0.0), 60.0);
    float spec2 = pow(max(dot(N, Hh), 0.0), 8.0);
    float fresnel = pow(1.0 - max(dot(N, vViewDir), 0.0), 2.2);

    vec3 col = base * (0.35 + 0.85 * diff);
    col += glowColor * fresnel * (0.85 + burstEnergy * 0.9);
    col += mix(glowColor, vec3(1.0), 0.4) * spec * 0.65;
    col += mix(base, vec3(1.0), 0.25) * spec2 * 0.16;

    // water bloom: brighten & tint with the orb's own palette where the
    // surface is disturbed. burstEnergy (driven by scroll splashes) pumps
    // this up so the surface visibly flares the instant a plume fires.
    float hc = clamp(abs(h), 0.0, 0.5);
    float bloomBoost = bloomStrength * (1.0 + burstEnergy * 1.6);
    float foam = smoothstep(0.03, 0.32, hc) * bloomBoost;
    vec3 foamTint = mix(glowColor, base, 0.45);
    col += foamTint * foam * 0.55;
    col = mix(col, col * 1.2 + foamTint * 0.08, smoothstep(0.08, 0.4, hc) * bloomBoost * 0.4);
    col += foamTint * burstEnergy * 0.12;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Soft additive halo behind the orb (screen-facing quad), pulses with
// how much ripple energy is currently in the sim.
const haloVert = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const haloFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 colorA;
  uniform vec3 colorB;
  uniform float energy;
  uniform float time;
  void main(){
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p);
    float a = smoothstep(1.0, 0.0, d);
    a = pow(a, 1.8);
    vec3 c = mix(colorB, colorA, 0.5 + 0.5 * sin(time * 0.2 + vUv.x * 3.14));
    gl_FragColor = vec4(c, a * (0.35 + energy * 0.9));
  }
`;

/* ------------------------------------------------------------------ */
/* ripple simulation                                                   */
/* ------------------------------------------------------------------ */

class RippleSim {
  constructor(renderer, resolution = 192) {
    this.renderer = renderer;
    this.resolution = resolution;

    const type =
      renderer.capabilities.isWebGL2 || renderer.extensions.get("OES_texture_half_float")
        ? THREE.HalfFloatType
        : THREE.UnsignedByteType;

    const opts = {
      type,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this.rtA = new THREE.WebGLRenderTarget(resolution, resolution, opts);
    this.rtB = new THREE.WebGLRenderTarget(resolution, resolution, opts);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.material = new THREE.ShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: rippleFrag,
      uniforms: {
        tState: { value: null },
        texel: { value: new THREE.Vector2(1 / resolution, 1 / resolution) },
        uDrop: { value: new THREE.Vector3(0, 0, 0) },
        uDropRadius: { value: 0.05 },
        uDamping: { value: 0.985 },
        uSpeed: { value: 0.5 },
      },
      depthTest: false,
      depthWrite: false,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene.add(this.quad);
  }

  step(dropUv, dropStrength, dropRadius = 0.05) {
    const u = this.material.uniforms;
    u.tState.value = this.rtA.texture;
    if (dropUv && dropStrength > 0) {
      u.uDrop.value.set(dropUv.x, dropUv.y, dropStrength);
      u.uDropRadius.value = dropRadius;
    } else {
      u.uDrop.value.set(0, 0, 0);
    }
    const prevTarget = this.renderer.getRenderTarget();
    const prevAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.rtB);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(prevTarget);
    this.renderer.autoClear = prevAutoClear;
    const tmp = this.rtA;
    this.rtA = this.rtB;
    this.rtB = tmp;
  }

  get texture() {
    return this.rtA.texture;
  }

  dispose() {
    this.rtA.dispose();
    this.rtB.dispose();
    this.quad.geometry.dispose();
    this.material.dispose();
  }
}

/* ------------------------------------------------------------------ */
/* React component                                                     */
/* ------------------------------------------------------------------ */

export default function WaterOrb({
  image,
  size,
  colorA = "#ffcf9e", // peach
  colorB = "#c9a6f5", // lavender
  colorC = "#8fb4ff", // blue
  glowColor = "#c9a6f5",
  refraction = 0.9,
  bloomStrength = 1.1,
  rippleResolution = 192,
  autoRotate = true,
  idlePulses = true,
  diveOnScroll = true,
  diveRange = 520,
  plumeAngle = 0.15,
  plumeSpread = 1.0,
  className,
  style,
}) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // the canvas is rendered larger than the orb's own box (an "overscan")
    // so splash particles have room to fly outward before hitting the edge;
    // the fov is widened to exactly compensate, so the orb itself still
    // looks the same size/scale as it would in a box-sized canvas
    const OVERSCAN = 2.6;
    const BASE_FOV_DEG = 35;
    const fovDeg = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(BASE_FOV_DEG) / 2) * OVERSCAN)
    );

    let width = size || host.clientWidth || 480;
    let height = size || host.clientHeight || 480;
    let renderW = Math.round(width * OVERSCAN);
    let renderH = Math.round(height * OVERSCAN);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(renderW, renderH, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    host.style.position = "relative";
    host.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.left = "50%";
    renderer.domElement.style.top = "50%";
    renderer.domElement.style.width = renderW + "px";
    renderer.domElement.style.height = renderH + "px";
    renderer.domElement.style.transform = "translate(-50%, -50%)";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.pointerEvents = "auto";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fovDeg, renderW / renderH, 0.1, 100);
    camera.position.set(0, 0, 6);

    const ripple = new RippleSim(renderer, rippleResolution);

    // halo (rendered first, behind the orb)
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: haloVert,
      fragmentShader: haloFrag,
      uniforms: {
        colorA: { value: new THREE.Color(colorA) },
        colorB: { value: new THREE.Color(glowColor) },
        energy: { value: 0 },
        time: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 6.2), haloMat);
    halo.position.z = -1.4;
    scene.add(halo);

    // the orb
    let map = null;
    const orbUniforms = {
      tState: { value: ripple.texture },
      texel: { value: new THREE.Vector2(1 / rippleResolution, 1 / rippleResolution) },
      time: { value: 0 },
      uUseMap: { value: !!image },
      map: { value: null },
      colorA: { value: new THREE.Color(colorA) },
      colorB: { value: new THREE.Color(colorB) },
      colorC: { value: new THREE.Color(colorC) },
      glowColor: { value: new THREE.Color(glowColor) },
      refraction: { value: refraction },
      bloomStrength: { value: bloomStrength },
      crinkle: { value: 0.35 },
      burstEnergy: { value: 0 },
    };
    const orbMat = new THREE.ShaderMaterial({
      vertexShader: orbVert,
      fragmentShader: orbFrag,
      uniforms: orbUniforms,
    });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(1.7, 96, 64), orbMat);
    scene.add(orb);

    if (image) {
      new THREE.TextureLoader().load(image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        map = tex;
        orbUniforms.map.value = tex;
      });
    }

    // ---- splash particles: water tendrils that burst outward from the
    // orb's surface, used for the scroll-triggered "explosion" ----
    // Now drawn as a soft-core / feathered-edge streak (rather than a
    // uniform blob) so overlapping sprites read as one flowing strand,
    // and each particle can "curl" (a perpendicular whip force) so the
    // tendrils bend instead of flying in dead-straight lines.
    function makeStreakTexture() {
      const c = document.createElement("canvas");
      c.width = 48;
      c.height = 220;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 0, 220);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.12, "rgba(255,255,255,0.55)");
      g.addColorStop(0.38, "rgba(255,255,255,1)");
      g.addColorStop(0.7, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(24, 110, 9, 108, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      // slim bright core for a wet highlight
      const core = ctx.createLinearGradient(0, 0, 0, 220);
      core.addColorStop(0, "rgba(255,255,255,0)");
      core.addColorStop(0.3, "rgba(255,255,255,0.9)");
      core.addColorStop(0.6, "rgba(255,255,255,0.6)");
      core.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.ellipse(24, 110, 3, 100, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    const streakTex = makeStreakTexture();
    const palette = [colorA, colorB, colorC, glowColor].map((c) => new THREE.Color(c));
    const PARTICLE_COUNT = 90;
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mat = new THREE.SpriteMaterial({
        map: streakTex,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        color: palette[0],
        opacity: 0,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      sprite.renderOrder = 5;
      scene.add(sprite);
      particles.push({
        sprite,
        mat,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        active: false,
        curl: 0,
        thickness: 1,
      });
    }

    // Fires a fan of curling tendrils out of the orb, biased around
    // `angle` (radians, 0 = +x/right, PI/2 = up) with `spread` covering
    // the total angular width of the fan.
    function burst(count, opts = {}) {
      const {
        angle = plumeAngle,
        spread = plumeSpread,
        speedMin = 2.4,
        speedMax = 5.0,
        originRadius = 1.9,
        life = [0.55, 1.15],
        curlMax = 2.6,
      } = opts;
      let spawned = 0;
      for (let i = 0; i < particles.length && spawned < count; i++) {
        const pt = particles[i];
        if (pt.active) continue;
        const ang = angle + (Math.random() - 0.5) * spread;
        const dir = new THREE.Vector3(Math.cos(ang), Math.sin(ang), (Math.random() - 0.5) * 0.35).normalize();
        pt.sprite.position.copy(dir).multiplyScalar(originRadius + Math.random() * 0.15);
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        pt.vel.copy(dir).multiplyScalar(speed);
        pt.life = pt.maxLife = life[0] + Math.random() * (life[1] - life[0]);
        pt.mat.color.copy(palette[(Math.random() * palette.length) | 0]);
        pt.mat.opacity = 1;
        pt.mat.rotation = Math.atan2(dir.y, dir.x) - Math.PI / 2;
        pt.thickness = 0.55 + Math.random() * 0.7;
        pt.sprite.scale.set(0.16 * pt.thickness, 0.7 * pt.thickness, 1);
        pt.curl = (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * curlMax);
        pt.active = true;
        pt.sprite.visible = true;
        spawned++;
      }
    }

    // ---- pointer interaction -> ripple drops ----
    let lastX = null,
      lastY = null,
      lastT = performance.now();
    let pendingDrop = null;

    function toUv(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      return { x, y };
    }

    function onMove(e) {
      const p = e.touches ? e.touches[0] : e;
      const uv = toUv(p.clientX, p.clientY);
      const now = performance.now();
      if (lastX !== null) {
        const dt = Math.max(now - lastT, 1);
        const dx = (uv.x - lastX) * renderer.domElement.clientWidth;
        const dy = (uv.y - lastY) * renderer.domElement.clientHeight;
        const speed = Math.min(Math.hypot(dx, dy) / dt, 3);
        if (speed > 0.02) {
          pendingDrop = { uv, strength: Math.min(0.35 + speed * 0.6, 1.6) };
        }
      }
      lastX = uv.x;
      lastY = uv.y;
      lastT = now;
    }
    function onDown(e) {
      const p = e.touches ? e.touches[0] : e;
      pendingDrop = { uv: toUv(p.clientX, p.clientY), strength: 1.4 };
    }
    function onLeave() {
      lastX = lastY = null;
    }

    // ---- scroll-to-dive: wheel over the orb blooms a directional water
    // plume, then sinks it below the water; scrolling back raises it ----
    let diveTarget = 0;
    let diveCurrent = 0;
    let lastBurstAt = 0;
    host.style.transformOrigin = "50% 100%";
    host.style.willChange = "transform, opacity";

    function onWheel(e) {
      if (!diveOnScroll) return;
      const prev = diveTarget;
      diveTarget = Math.max(0, Math.min(diveRange, diveTarget + e.deltaY));
      const uv = { x: 0.62, y: 0.55 }; // roughly where the plume exits the sphere

      if (prev <= 0 && diveTarget > 0) {
        // big initial bloom: a wide, dense fan of tendrils bursts out to
        // one side, like the reference image
        pendingDrop = { uv, strength: 1.3 };
        burst(46, {
          angle: plumeAngle,
          spread: plumeSpread,
          speedMin: 4.2,
          speedMax: 8.5,
          life: [0.7, 1.3],
          curlMax: 2.2,
        });
      } else if (diveTarget > 0 && diveTarget < diveRange) {
        // continuous spray while actively descending, still fanned in the
        // same primary direction so it reads as one ongoing plume
        pendingDrop = { uv, strength: 0.45 };
        const now = performance.now();
        if (now - lastBurstAt > 70) {
          burst(4 + Math.floor(Math.random() * 4), {
            angle: plumeAngle + (Math.random() - 0.5) * 0.3,
            spread: plumeSpread * 0.6,
            speedMin: 2.4,
            speedMax: 4.6,
            life: [0.4, 0.8],
          });
          lastBurstAt = now;
        }
      } else if (prev < diveRange && diveTarget >= diveRange) {
        // fully submerged: an impact splash as it hits the water
        pendingDrop = { uv, strength: 1.0 };
        burst(24, { angle: -Math.PI / 2, spread: Math.PI * 1.4, speedMin: 3.5, speedMax: 6.2, life: [0.35, 0.7] });
      } else if (prev > 0 && diveTarget <= 0) {
        pendingDrop = { uv, strength: 1.5 };
        burst(20, { angle: Math.PI / 2, spread: 1.6, speedMin: 2.2, speedMax: 4.0, life: [0.5, 0.9] });
      }
    }

    const el = renderer.domElement;
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onDown, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });

    // ---- resize ----
    function resize() {
      width = size || host.clientWidth || width;
      height = size || host.clientHeight || height;
      renderW = Math.round(width * OVERSCAN);
      renderH = Math.round(height * OVERSCAN);
      renderer.setSize(renderW, renderH, false);
      renderer.domElement.style.width = renderW + "px";
      renderer.domElement.style.height = renderH + "px";
      camera.aspect = renderW / renderH;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // ---- animate ----
    const clock = new THREE.Clock();
    let idleTimer = 0;
    let energySmoothed = 0;
    let raf;

    function tick() {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (autoRotate) {
        orb.rotation.y = t * 0.12;
        orb.rotation.x = Math.sin(t * 0.17) * 0.08;
      }

      if (diveOnScroll) {
        diveCurrent += (diveTarget - diveCurrent) * 0.1;
        const p = diveCurrent / diveRange;
        // falls and settles small on the water, staying clearly visible
        // (not fading away) rather than sinking out of sight
        const scale = 1 - p * 0.68;
        const translateY = p * height * 1.3;
        const opacity = 1 - p * 0.35;
        host.style.transform = `translateY(${translateY}px) scale(${scale})`;
        host.style.opacity = String(opacity);
      }

      // splash particles: ballistic motion + a perpendicular "curl" force
      // so each strand whips/curves like a real water tendril instead of
      // flying in a straight line, fading and thinning out as they die
      for (const pt of particles) {
        if (!pt.active) continue;
        pt.vel.y -= 4.4 * dt;
        const speed = pt.vel.length() || 0.0001;
        const perp = new THREE.Vector3(-pt.vel.y, pt.vel.x, 0).multiplyScalar(pt.curl * dt / speed);
        pt.vel.add(perp);
        pt.vel.multiplyScalar(1 - 0.35 * dt); // drag, so tendrils decelerate and curl visibly
        pt.sprite.position.addScaledVector(pt.vel, dt);
        pt.life -= dt;
        if (pt.life <= 0) {
          pt.active = false;
          pt.sprite.visible = false;
          continue;
        }
        const lifeT = pt.life / pt.maxLife;
        pt.mat.opacity = Math.min(1, lifeT * 1.4) * 0.95;
        const spd = pt.vel.length();
        pt.sprite.scale.set(0.14 * pt.thickness + spd * 0.01, Math.min(1.6, (0.35 + spd * 0.1) * pt.thickness), 1);
        pt.mat.rotation = Math.atan2(pt.vel.y, pt.vel.x) - Math.PI / 2;
      }

      // idle ambient ripple pulses so the orb keeps "breathing"
      if (idlePulses) {
        idleTimer -= dt;
        if (idleTimer <= 0 && !pendingDrop) {
          idleTimer = 2.2 + Math.random() * 2.2;
          pendingDrop = {
            uv: { x: 0.5 + (Math.random() - 0.5) * 0.3, y: 0.5 + (Math.random() - 0.5) * 0.3 },
            strength: 0.25 + Math.random() * 0.2,
          };
        }
      }

      const dropFired = !!pendingDrop;
      if (pendingDrop) {
        ripple.step(pendingDrop.uv, pendingDrop.strength, 0.06);
        pendingDrop = null;
      } else {
        ripple.step(null, 0);
      }
      orbUniforms.tState.value = ripple.texture;
      orbUniforms.time.value = t;

      // energy read: decays smoothly, spikes on each drop; drives both the
      // halo pulse and the orb surface's burst glow
      energySmoothed = Math.max(energySmoothed * 0.94, dropFired ? 1 : energySmoothed);
      haloMat.uniforms.energy.value = energySmoothed;
      haloMat.uniforms.time.value = t;
      orbUniforms.burstEnergy.value = energySmoothed;

      renderer.render(scene, camera);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      ripple.dispose();
      orb.geometry.dispose();
      orbMat.dispose();
      halo.geometry.dispose();
      haloMat.dispose();
      for (const pt of particles) pt.mat.dispose();
      streakTex.dispose();
      if (map) map.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      host.style.transform = "";
      host.style.opacity = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    image,
    size,
    colorA,
    colorB,
    colorC,
    glowColor,
    refraction,
    bloomStrength,
    rippleResolution,
    autoRotate,
    idlePulses,
    diveOnScroll,
    diveRange,
    plumeAngle,
    plumeSpread,
  ]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        width: size ? size : "100%",
        height: size ? size : "100%",
        ...style,
      }}
    />
  );
}