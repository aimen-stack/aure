import React, { useEffect, useRef } from "react";

export default function OrbImageSequence({
  frameCount = 50,
  pathPrefix = "/orbimages/ezgif-frame-",
  pathSuffix = ".png",
  momentum = 0.03, // lower = slower/smoother catch-up to scroll
}) {
  const imgRef = useRef(null);
  const targetFrameRef = useRef(1);
  const currentFrameFloatRef = useRef(1);

  useEffect(() => {
    const getScrollPercentage = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return 0;
      return Math.min(1, Math.max(0, scrollTop / docHeight));
    };

    const handleScroll = () => {
      const percentage = getScrollPercentage();
      // Make the sequence finish by 75% of the scroll
      let effectivePercentage = Math.min(1, percentage / 0.75);
      let targetFrame = Math.floor(effectivePercentage * frameCount) + 1;

      targetFrameRef.current = Math.max(1, Math.min(frameCount, targetFrame));
    };

    // Set initial frame based on current scroll position (e.g. on refresh mid-page)
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    let animationFrameId;
    const animate = () => {
      currentFrameFloatRef.current +=
        (targetFrameRef.current - currentFrameFloatRef.current) * momentum;

      const roundedFrame = Math.round(currentFrameFloatRef.current);

      if (imgRef.current) {
        const frameNumberStr = String(roundedFrame).padStart(3, "0");
        imgRef.current.src = `${pathPrefix}${frameNumberStr}${pathSuffix}`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [frameCount, pathPrefix, pathSuffix, momentum]);

  return (
    <img
      ref={imgRef}
      src={`${pathPrefix}001${pathSuffix}`}
      alt="Orb animation sequence"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}