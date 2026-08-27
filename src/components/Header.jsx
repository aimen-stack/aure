import React from 'react';

export default function Header() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'auto', width: '100%' }}>
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
        <button style={{ 
          width: '36px', 
          height: '36px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #FF7A00 0%, #FF2E93 50%, #9B51E0 100%)', 
          boxShadow: '0 4px 12px rgba(255, 46, 147, 0.5), 0 0 20px rgba(155, 81, 224, 0.4)',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          border: 'none', 
          cursor: 'pointer',
          padding: 0,
          transition: 'transform 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: '1px' }}>
            <path d="M13.5 15.5l-3-3.2-5.5 3.2 6.2-6.5 3 3.2 5.5-3.2-6.2 6.5z" />
          </svg>
        </button>
        
        <button style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 16px 6px 6px', 
          borderRadius: '999px', 
          backgroundColor: '#fff', 
          color: '#000', 
          border: 'none', 
          cursor: 'pointer', 
          fontWeight: 600, 
          fontSize: '13px',
          transition: 'transform 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '50%', 
            backgroundColor: '#e0e0e0', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            overflow: 'hidden' 
          }}>
            <img src="https://i.pravatar.cc/100?img=33" alt="avatar" style={{width: '100%', height: '100%'}}/>
          </div>
          Let's talk
        </button>
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
