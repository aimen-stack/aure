import React, { useState, useRef, useEffect } from 'react';

export default function Header() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.65;
      audioRef.current.load();
    }
  }, []);

  const toggleMusic = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = 0.65;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Audio playback interrupted or blocked:", err);
            // Fallback: try new Audio instance
            try {
              const fallback = new Audio('/demo-music.mp3');
              fallback.loop = true;
              fallback.volume = 0.65;
              fallback.play().then(() => {
                audioRef.current = fallback;
                setIsPlaying(true);
              }).catch((e2) => console.error("Fallback audio play failed:", e2));
            } catch (err2) {
              console.error("Audio constructor failed:", err2);
            }
          });
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'auto', width: '100%' }}>
      {/* Audio element with direct src and fallback sources */}
      <audio 
        ref={audioRef} 
        src="/demo-music.mp3"
        loop 
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/demo-music.mp3" type="audio/mpeg" />
        <source src="/demo-music.wav" type="audio/wav" />
      </audio>

      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <img 
          src="/logo.png" 
          alt="AURE Logo" 
          style={{
            height: '44px',
            width: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>
      
      {/* Top-Right: Interactive pill elements */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* Music Toggle Button */}
        <button 
          onClick={toggleMusic}
          title={isPlaying ? "Mute music" : "Play music"}
          aria-label={isPlaying ? "Mute music" : "Play music"}
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #FF7A00 0%, #FF2E93 50%, #9B51E0 100%)', 
            boxShadow: isPlaying 
              ? '0 0 16px rgba(255, 46, 147, 0.8), 0 0 28px rgba(155, 81, 224, 0.6)' 
              : '0 4px 12px rgba(255, 46, 147, 0.5), 0 0 20px rgba(155, 81, 224, 0.4)',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            border: 'none', 
            cursor: 'pointer',
            padding: 0,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying ? (
            /* Music Playing Icon */
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#fff" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ display: 'block' }}
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" fill="#fff" />
              <circle cx="18" cy="16" r="3" fill="#fff" />
            </svg>
          ) : (
            /* Music Muted Icon */
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#fff" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ display: 'block' }}
            >
              <g opacity="0.6">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" fill="#fff" />
                <circle cx="18" cy="16" r="3" fill="#fff" />
              </g>
              <line x1="3" y1="3" x2="21" y2="21" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          )}
        </button>
        
        {/* Menu button */}
        <button style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '10px 20px', 
          borderRadius: '999px', 
          backgroundColor: 'rgba(0, 0, 0, 0.4)', 
          backdropFilter: 'blur(8px)', 
          color: '#fff', 
          border: 'none', 
          cursor: 'pointer', 
          fontWeight: 600, 
          fontSize: '13px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          MENU
        </button>
      </div>
    </div>
  );
}
