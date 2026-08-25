import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import sceneImg from "../assets/test/without-water.jpg";
import halfCircleImg from "../assets/test/half-circle.png";
import OrbImageSequence from "../components/test/OrbImageSequencee";

gsap.registerPlugin(ScrollTrigger);

// ---- Real dimensions of without-water.jpg (measured directly from the file) ----
const IMAGE_W = 3076;
const IMAGE_H = 1344;
const IMAGE_ASPECT = IMAGE_W / IMAGE_H;

const WATER_HEIGHT_RATIO = 0.34;
const IMAGE_FRACTION = 1 / (1 + WATER_HEIGHT_RATIO);
const IMAGE_TOP_PCT = IMAGE_FRACTION * 100;
const TOTAL_ASPECT = IMAGE_ASPECT * IMAGE_FRACTION;

const SPHERE = { cx: 58.0, cy: 90.0, size: 18.8 };

const DROP_TARGET_PCT = 95;
const DROP_TOP_PCT = (DROP_TARGET_PCT / IMAGE_TOP_PCT) * 100;

export default function EtherealArchPhoto({ src = sceneImg }) {
  const orbContainerRef = useRef(null);
  const sequenceRef = useRef(null);
  const halfCircleRef = useRef(null);
  const rippleRef = useRef(null);

  const SPHERE_START_TOP_PCT = SPHERE.cy * IMAGE_FRACTION;
  const SPHERE_PEAK_TOP_PCT = 75.0 * IMAGE_FRACTION;

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      },
    });

    // Dummy to set total timeline length to 100 units
    tl.to({}, { duration: 100 });

    // Rise from cy:90 to cy:75 during the animation sequence
    tl.fromTo(
      orbContainerRef.current,
      { top: `${SPHERE_START_TOP_PCT}%` },
      { top: `${SPHERE_PEAK_TOP_PCT}%`, duration: 75, ease: "power1.inOut" },
      0
    );

    // Drop from 75 to 95
    tl.fromTo(
      orbContainerRef.current,
      { top: `${SPHERE_PEAK_TOP_PCT}%` },
      { top: `${DROP_TARGET_PCT}%`, duration: 15, ease: "power2.in" },
      75
    );

    // Fade out sequence when it hits water
    tl.to(
      sequenceRef.current,
      { opacity: 0, duration: 1, ease: "power1.inOut" },
      90
    );

    // Fade in half-circle image when it hits water
    tl.fromTo(
      halfCircleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power1.inOut" },
      90
    );

    // Ripple (with water filter applied in CSS now)
    tl.fromTo(
      rippleRef.current,
      { opacity: 0, scale: 0.2, borderWidth: "8px" },
      { opacity: 0.8, scale: 2.0, borderWidth: "3px", duration: 5, ease: "power2.out" },
      90
    ).to(
      rippleRef.current,
      { opacity: 0, scale: 3.5, duration: 5, ease: "power1.out" },
      95
    );

    // Water swell pushing out
    tl.fromTo(
      ".water-swell",
      { scale: 0, opacity: 1 },
      { scale: 4, opacity: 0, duration: 4, ease: "power2.out" },
      90
    );

    // Dynamic Splashing Droplets
    tl.fromTo(
      ".water-droplet",
      { scaleY: 0, y: 0, opacity: 1 },
      {
        scaleY: () => 1.2 + Math.random() * 0.8,
        y: () => -40 - Math.random() * 40,
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.03
      },
      90
    ).to(
      ".water-droplet",
      { scaleY: 0, y: () => -10, opacity: 0, duration: 1.5, ease: "power1.in", stagger: 0.03 },
      91.5
    );

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        aspectRatio: TOTAL_ASPECT,
        overflow: "visible",
        background: "#0a0e18",
      }}
    >
      <style>{`
        @keyframes floatScene {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(3px); }
          100% { transform: translateY(0px); }
        }
        @keyframes rippleShiftA {
          0%   { transform: translate(0px, 0px) scale(1.02); }
          50%  { transform: translate(-6px, 3px) scale(1.03); }
          100% { transform: translate(0px, 0px) scale(1.02); }
        }
        @keyframes rippleShiftB {
          0%   { transform: translate(0px, 0px) scale(1.015); }
          50%  { transform: translate(5px, -2px) scale(1.02); }
          100% { transform: translate(0px, 0px) scale(1.015); }
        }
        @keyframes shimmer {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      `}</style>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="waterRippleFine" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="4" result="noise">
            <animate attributeName="baseFrequency" values="0.012 0.06;0.016 0.05;0.012 0.06" dur="7s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="waterRippleBroad" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.02" numOctaves="2" seed="9" result="noise2">
            <animate attributeName="baseFrequency" values="0.004 0.02;0.006 0.016;0.004 0.02" dur="11s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise2" scale="22" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* ===== IMAGE BLOCK — real aspect ratio, nothing cropped ===== */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${IMAGE_TOP_PCT}%`,
          overflow: "visible", // Revert back to visible so orb can drop below the seam
        }}
      >
        <img
          src={src}
          alt="Ethereal arch and sphere scene"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            animation: "floatScene 6s ease-in-out infinite",
          }}
        />
      </div>

      {/* ===== ORB LAYER (Clipped at the drop point to look submerged) ===== */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${DROP_TARGET_PCT}%`, // Creates the new physical water line for the orb
          overflow: "hidden",
          zIndex: 7,
          pointerEvents: "none",
        }}
      >
        <div
          ref={orbContainerRef}
          style={{
            position: "absolute",
            left: `${SPHERE.cx}%`,
            top: `${SPHERE_START_TOP_PCT}%`,
            width: `${SPHERE.size}%`,
            aspectRatio: "1 / 1",
            transform: "translate(-50%, -50%)",
            pointerEvents: "auto",
          }}
        >
          <div ref={sequenceRef} style={{ position: "absolute", inset: 0, opacity: 1 }}>
            <OrbImageSequence
              frameCount={50}
              pathPrefix="/orbimages/ezgif-frame-"
              pathSuffix=".png"
              momentum={0.03}
            />
          </div>

          <img
            ref={halfCircleRef}
            src={halfCircleImg}
            alt="Settled orb"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 0,
            }}
          />
        </div>
      </div>

      {/* Splash ripple sits exactly at the new drop location */}
      <div
        ref={rippleRef}
        style={{
          position: "absolute",
          left: `${SPHERE.cx}%`,
          top: `${DROP_TARGET_PCT}%`,
          width: "25%",
          aspectRatio: "4 / 1",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "4px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.3)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 8,
          filter: "url(#waterRippleFine)", // Distorts the perfect circle into realistic water waves!
        }}
      />

      {/* ===== WATER SPLASH EFFECTS ===== */}
      <div
        className="water-swell"
        style={{
          position: "absolute",
          left: `${SPHERE.cx}%`,
          top: `${DROP_TARGET_PCT}%`,
          width: "25%",
          aspectRatio: "3 / 1",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)",
          transform: "translate(-50%, -50%)",
          opacity: 0,
          zIndex: 8,
          pointerEvents: "none",
          filter: "url(#waterRippleFine)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: `${SPHERE.cx}%`,
          top: `${DROP_TARGET_PCT}%`,
          zIndex: 9,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 14 }).map((_, i) => {
          // fan out from -70 deg to +70 deg
          const angle = -70 + (140 / 13) * i;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                transform: `rotate(${angle}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="water-droplet"
                style={{
                  width: "4px",
                  height: "28px",
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0))",
                  borderRadius: "10px",
                  transformOrigin: "bottom center",
                  transform: "translate(-50%, -100%) scaleY(0)",
                }}
              />
            </div>
          );
        })}
      </div>



      {/* ===== WATER BLOCK — unchanged ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${IMAGE_TOP_PCT}%`,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg,
              rgba(255,196,150,0.35) 0%,
              rgba(210,150,190,0.28) 10%,
              rgba(90,90,140,0.35) 35%,
              rgba(30,40,80,0.55) 70%,
              rgba(10,16,40,0.78) 100%)`,
            mixBlendMode: "multiply",
            zIndex: 3,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "scaleY(-1)",
            filter: "url(#waterRippleBroad) blur(1px)",
            animation: "rippleShiftB 9s ease-in-out infinite",
            opacity: 0.55,
          }}
        >
          <img
            src={src}
            alt=""
            aria-hidden="true"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "bottom", display: "block" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: "url(#waterRippleFine)",
            animation: "rippleShiftA 5s ease-in-out infinite",
            mixBlendMode: "soft-light",
            opacity: 0.85,
          }}
        >
          <img
            src={src}
            alt=""
            aria-hidden="true"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "bottom", display: "block" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg,
              rgba(255,255,255,0.20) 0%,
              rgba(255,255,255,0.0) 18%,
              rgba(10,14,30,0.0) 45%,
              rgba(6,10,24,0.45) 100%)`,
            zIndex: 4,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(95deg, rgba(255,235,215,0) 0px, rgba(255,235,215,0.06) 2px, rgba(255,235,215,0) 6px)",
            backgroundSize: "200% 100%",
            mixBlendMode: "overlay",
            animation: "shimmer 14s linear infinite",
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* foam blend right at the seam */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `calc(${IMAGE_TOP_PCT}% - 1.5%)`,
          height: "3%",
          background: "linear-gradient(180deg, rgba(255,235,225,0) 0%, rgba(255,235,225,0.35) 45%, rgba(255,235,225,0) 100%)",
          filter: "blur(3px)",
          mixBlendMode: "screen",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}