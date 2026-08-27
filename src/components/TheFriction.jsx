import React from 'react';
import Header from './Header';

export default function TheFriction() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#100C1F', // Dark purple/blue background from screenshot
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Background gradients for the "orbs" at top and bottom */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(197, 219, 255, 0.6) 0%, rgba(204, 150, 255, 0.4) 30%, rgba(16, 12, 31, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(255, 230, 217, 0.6) 0%, rgba(131, 192, 255, 0.4) 30%, rgba(16, 12, 31, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Header Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '2.5rem 3rem',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        <Header />
      </div>

      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        zIndex: 2,
        maxWidth: '1000px',
        padding: '0 20px',
        marginTop: '60px' // Offset for header
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.4)',
          marginBottom: '2rem'
        }}>
          THE FRICTION
        </div>

        <h2 style={{
          margin: 0,
          fontSize: 'clamp(3rem, 7vw, 6.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          <span style={{
            background: 'linear-gradient(90deg, #FF7A00 0%, #FF2E93 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            paddingRight: '0.1em'
          }}>
            The market went deaf.
          </span>
          <br />
          <span style={{ color: '#7876A1' }}>
            Most brands keep whispering.
          </span>
        </h2>

        <p style={{
          margin: '3rem auto 5rem',
          maxWidth: '520px',
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: 400
        }}>
          Attention is the only currency left, and blending in is the only real risk. <span style={{ color: '#FF2E93' }}>AURÊ</span> exists to make brands impossible to ignore.
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6rem',
          flexWrap: 'wrap',
          margin: '0 auto'
        }}>
          {/* Stat 1 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1 }}>8s</div>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)' }}>AVERAGE ATTENTION</div>
          </div>

          {/* Stat 2 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1 }}>90%</div>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)' }}>OF BRANDS BLEND IN</div>
          </div>

          {/* Stat 3 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1 }}>1</div>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)' }}>REAL RISK: SILENCE</div>
          </div>
        </div>

      </div>
    </div>
  );
}
