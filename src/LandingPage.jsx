import React from 'react';
import HeroWater from './components/HeroWater';
import OrbSequence from './components/OrbSequence';
import OrbToLogoSequence from './components/OrbToLogoSequence';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#C9A38C' }}>
      {/* 
        The first section: the water reflection text.
        It has a relative height of 100vh, meaning you can scroll past it.
      */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <HeroWater />
      </div>

      {/* 
        The second section: the pinned orb animation.
        This handles its own GSAP pinning logic when it scrolls into view.
        We pull it up by 200vh so it overlaps with the end of HeroWater's 500vh pin,
        creating a 100vh crossfade window where both are pinned.
      */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: '-200vh' }}>
        <OrbSequence />
      </div>

      {/* 
        The third section: The Orb to Logo sequence.
        This handles its own GSAP pinning logic and also includes TheFriction content.
      */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <OrbToLogoSequence />
      </div>
    </div>
  );
}
