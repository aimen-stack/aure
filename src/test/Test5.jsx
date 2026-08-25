import sceneImg from "../assets/test/without-circle.jpg";
import ThreeOrb from "../components/test/ThreeOrb";

const WATERLINE = 68.4;
const SPHERE = { cx: 55.0, cy: 51.4, size: 18.8 };

export default function EtherealArchPhoto({ src = sceneImg }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        aspectRatio: "1440 / 812",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <style>{`
        @keyframes floatScene {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(3px); }
          100% { transform: translateY(0px); }
        }
        @keyframes rippleShift {
          0%   { transform: translate(0px, 0px) scale(1.01); }
          50%  { transform: translate(-4px, 2px) scale(1.015); }
          100% { transform: translate(0px, 0px) scale(1.01); }
        }
      `}</style>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="waterRipple" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.05"
            numOctaves="2"
            seed="4"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.008 0.05;0.011 0.045;0.008 0.05"
              dur="7s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <img
        src={src}
        alt="Ethereal arch and sphere scene"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          animation: "floatScene 6s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${WATERLINE}%`,
          bottom: 0,
          overflow: "hidden",
          mixBlendMode: "soft-light",
          opacity: 0.8,
        }}
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: `-${WATERLINE}%`,
            width: "100%",
            height: `${100 / (1 - WATERLINE / 100)}%`,
            objectFit: "cover",
            filter: "url(#waterRipple)",
            animation: "rippleShift 5s ease-in-out infinite",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${WATERLINE}%`,
          bottom: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(100deg, rgba(255,235,215,0) 0px, rgba(255,235,215,0.05) 2px, rgba(255,235,215,0) 6px)",
          mixBlendMode: "overlay",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: `${SPHERE.cx}%`,
          top: `${SPHERE.cy}%`,
          width: `${SPHERE.size}%`,
          aspectRatio: "1 / 1",
          transform: "translate(-50%, -50%)",
        }}
      >
        <ThreeOrb />
      </div>
    </div>
  );
}