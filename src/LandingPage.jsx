import React from 'react';
import HeroWater from './components/HeroWater';
import OrbSequence from './components/OrbSequence';
import OrbToLogoSequence from './components/OrbToLogoSequence';
import CardsSequence from './components/CardsSequence';
import DesignInMotion from './components/DesignInMotion';
import ExplorationSequence from './components/ExplorationSequence';
import MeetTheDisrupters from './components/MeetTheDisrupters';

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

      {/* 
        The fourth section: The Horizontal Cards Sequence.
        This handles its own GSAP horizontal scroll pinning logic.
      */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <CardsSequence />
      </div>

      {/* 
        The fifth section: Design In Motion
        This handles animating texts moving in from left and right towards a central orb sequence.
      */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <DesignInMotion />
      </div>

      {/* 
        The sixth section: Exploration Sequence
        This is a horizontal scrolling section with a glowing orb background and cards.
      */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <ExplorationSequence />
      </div>

      {/* 
        The seventh section: Meet the Disrupters
        This section scatters team cards on screen and highlights them one by one.
      */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <MeetTheDisrupters />
      </div>
    </div>
  );
}
