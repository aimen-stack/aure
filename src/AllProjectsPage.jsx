import React from 'react';
import OrbSequence from './components/OrbSequence';
import { Link } from 'react-router-dom';

export default function AllProjectsPage() {
  // We'll approximate the images from the screenshot using available cards or placeholders if needed
  const projects = [
    { id: 1, src: '/projects/lavender/lavender-card.png', alt: 'Lavender', text: 'Lavender' },
    { id: 2, src: '/projects/market-square/market-square-card.png', alt: 'Market Square' },
    { id: 3, src: '/projects/elevaid/elevaid-card.png', alt: 'Elevaid' },
    { id: 4, src: '/projects/grid/grid-card.png', alt: 'Grid' },
    { id: 5, src: '/projects/nobs/nobs-card.png', alt: 'nobs' },
    { id: 6, src: '/projects/grounded/grounded-card.png', alt: 'Grounded' },
    { id: 7, src: '/projects/rocked/rocked-card.png', alt: 'Rocked' },
    { id: 8, src: '/projects/tax-nerd/tax-nerd-card.png', alt: 'Tax Nerd' },
    { id: 9, src: '/projects/card9.png', alt: 'Project 9' },
    { id: 10, src: '/projects/card10.png', alt: 'Project 10' },
    { id: 11, src: '/projects/card3.png', alt: 'Project 11' },
    { id: 12, src: '/projects/card4.png', alt: 'Project 12' },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. Header Section - OrbSequence */}
      <div style={{ position: 'relative', width: '100%', backgroundColor: '#C9A38C' }}>
        <OrbSequence />
      </div>

      {/* 2. Portfolio Intro Section */}
      <div style={{ padding: '5vw 5vw 2vw 5vw', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          {/* Left Title Area */}
          <div style={{ flex: '1 1 500px', maxWidth: '600px', marginBottom: '2rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: '1rem' }}>
              Our Portfolio
            </div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1, margin: 0, color: '#111', letterSpacing: '-0.03em' }}>
              Ideas that become
              <br />
              <span style={{ color: '#FF2E93' }}>Identities</span>
            </h2>
          </div>

          {/* Right Description Area */}
          <div style={{ flex: '1 1 300px', maxWidth: '400px', color: '#666', fontSize: '1.1rem', lineHeight: 1.6 }}>
            From strategy and brand building to visual identities, packaging, digital experiences, and campaigns, Aure creates work designed to give brands a distinct voice and a memorable presence. Explore a selection of projects we've shaped from concept to execution.
          </div>
        </div>

      </div>

      {/* 3. Grid Section */}
      <div style={{ 
        padding: '0 5vw 8vw 5vw',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '40px'
      }}>
        <style>{`
          .masonry-item {
            border-radius: 24px;
            overflow: hidden;
            position: relative;
            background-color: #111;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            aspect-ratio: 3.2 / 4;
          }
          .masonry-item:hover {
            transform: translateY(-8px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
          }
          .masonry-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.5s ease;
          }
          .masonry-item:hover img {
            transform: scale(1.05);
          }
          .masonry-text {
            position: absolute;
            bottom: 24px;
            left: 24px;
            color: white;
            font-weight: 700;
            font-size: 1.5rem;
            z-index: 2;
            text-shadow: 0 2px 10px rgba(0,0,0,0.8);
          }
        `}</style>
        
        {/* Render Uniform Cards */}
        {projects.map((item) => (
          <div key={item.id} className="masonry-item">
            <img src={item.src} alt={item.alt} />
            {item.text && <div className="masonry-text">{item.text}</div>}
          </div>
        ))}
      </div>

      {/* 4. Footer Section */}
      <div style={{
        background: 'linear-gradient(135deg, #FF7A00 0%, #FF2E93 50%, #683db8 100%)',
        padding: '8vw 5vw',
        color: 'white',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem', opacity: 0.8 }}>
          —— Start your movement
        </div>
        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, margin: '0 0 1rem 0', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Ready to make some<br />noise?
        </h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '500px', marginBottom: '3rem', opacity: 0.9 }}>
          Let's chat! Contact us to get started with your next project.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button style={{
            backgroundColor: 'white',
            color: '#FF2E93',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '99px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Say Hi
          </button>
          
          <button style={{
            backgroundColor: 'white',
            color: '#111',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '99px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Get started here <span style={{ fontSize: '1.2rem' }}>→</span>
          </button>
        </div>
        
        <div style={{ marginTop: '5rem', fontSize: '0.8rem', opacity: 0.6, letterSpacing: '0.05em' }}>
          © 2026 AURE. ALL RIGHTS RESERVED
        </div>
      </div>

    </div>
  );
}
