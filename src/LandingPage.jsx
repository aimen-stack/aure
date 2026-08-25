import React from 'react';
import HeroWater from './components/HeroWater';
import OrbSequence from './components/OrbSequence';
import TheFriction from './components/TheFriction';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#C9A38C' }}>
      {/* 
        The first section: the water reflection text.
        It has a relative height of 100vh, meaning you can scroll past it.
      */}
      <HeroWater />
      
      {/* 
        The second section: the pinned orb animation.
        This handles its own GSAP pinning logic when it scrolls into view.
      */}
      <OrbSequence />

      {/* 
        The third section: The Friction text and stats.
      */}
      <TheFriction />
    </div>
  );
}
