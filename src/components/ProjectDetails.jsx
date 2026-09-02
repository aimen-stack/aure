import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetails({
  title = "Grounded",
  subtitle = "Four focused pillars one team, end to end.",
  heroSubtitle,
  heroImage = null,
  logoImage = null,
  services = [],
  textTop = (
    <>
      <strong>Aure</strong> shaped <strong>Grounded's</strong> visual presence across social media, packaging, and branding building a cohesive identity that feels bold, distinctive, and true to its fast-food experience.
    </>
  ),
  textBottom = (
    <>
      <strong>Aure</strong> shaped <strong>Grounded's</strong> visual presence across social media, packaging, and branding building a cohesive identity that feels bold, distinctive, and true to its fast-food experience.
    </>
  ),
  images = [
    "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=800&auto=format&fit=crop", // Left bottom image
    "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop", // Right top image
    "https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=800&auto=format&fit=crop", // Right bottom image
    "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop"
  ],
  theme = {
    bg: '#D9CFC1',
    cardBg: '#7A3236',
    titleColor: '#fff',
    subtitleColor: '#4A4238',
    textColor: '#fff'
  },
  onClose,
  nextProject,
  onNextProject
}) {
  const rootRef = useRef(null);
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);
  const imagesRef = useRef([]);
  const textItemsRef = useRef([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselItems = [
    { title: "Branding", desc: "" },
    { title: "Logo", desc: "Refined wordmark designed to capture Lavender’s soft, elegant character while creating a distinctive and memorable brand signature." },
    { title: "Kiosk", desc: "" }
  ];

  const navigate = useCallback((direction, targetIndex = null) => {
    let nextIndex = targetIndex !== null ? targetIndex : currentIndex + direction;
    if (nextIndex >= carouselItems.length) nextIndex = carouselItems.length - 1;
    if (nextIndex < 0) nextIndex = 0;

    // Find the ScrollTrigger instance for this section
    const st = ScrollTrigger.getAll().find(s => s.trigger === wrapperRef.current);
    if (st) {
      // Calculate target scroll position based on index
      const targetScroll = st.start + (st.end - st.start) * (nextIndex / (carouselItems.length - 1));

      // Use native smooth scrolling on the scroller element
      const scrollerEl = st.scroller === window ? window : st.scroller;
      scrollerEl.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else {
      setCurrentIndex(nextIndex); // Fallback
    }
  }, [currentIndex, carouselItems.length]);

  useLayoutEffect(() => {
    if (!sectionRef.current || imagesRef.current.length === 0) return;

    let ctx = gsap.context(() => {
      const scrollerEl = document.querySelector("#details-scroll-container");

      const stConfig = {
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom bottom", // Scroll over the full height of the sticky wrapper
        scrub: 0.5, // Reduced from 1 to 0.5 for tighter, more responsive movement
        snap: {
          snapTo: 1 / (carouselItems.length - 1),
          duration: { min: 0.1, max: 0.3 },
          delay: 0.05,
          ease: "power2.out"
        },
        onUpdate: (self) => {
          const progress = self.progress;
          const activeIndexFloat = progress * (carouselItems.length - 1);
          const newCurrentIndex = Math.round(activeIndexFloat);

          if (newCurrentIndex !== currentIndex) {
            setCurrentIndex(newCurrentIndex);
          }

          carouselItems.forEach((_, i) => {
            const diff = i - activeIndexFloat;
            const absDiff = Math.abs(diff);

            // Image Animation
            const imgEl = imagesRef.current[i];
            if (imgEl) {
              const y = diff * 150; // pixels
              const scale = 1 - Math.min(absDiff * 0.18, 0.4);
              const rotateX = diff < 0 ? 8 * absDiff : -8 * absDiff;
              const opacity = 1 - Math.min(absDiff * 0.4, 0.8);
              const zIndex = 10 - Math.floor(absDiff * 10);

              // Push inactive cards backwards in 3D space so they don't clip through the active card
              const z = -100 * absDiff;

              const isCentered = absDiff < 0.5;
              const glow = isCentered ? 'linear-gradient(135deg, #FF8A00, #FF2E93, #9B51E0)' : 'transparent';
              const padding = isCentered ? '4px' : '0px';

              // Apply blur to inactive cards
              const imgInner = imgEl.querySelector('.img-inner');
              if (imgInner) {
                gsap.to(imgInner, { filter: isCentered ? 'blur(0px)' : 'blur(4px)', duration: 0.2 });
              }

              gsap.to(imgEl, {
                y,
                z,
                scale,
                opacity,
                zIndex,
                background: glow,
                padding,
                rotationX: rotateX,
                duration: 0.1,
                ease: "none"
              });
            }

            // Text Animation
            const textEl = textItemsRef.current[i];
            if (textEl) {
              const y = diff * 100;
              const isCentered = absDiff < 0.5;

              const titleEl = textEl.querySelector('.title');
              const descEl = textEl.querySelector('.desc');

              gsap.to(textEl, {
                y,
                opacity: 1 - Math.min(absDiff * 0.6, 0.8),
                duration: 0.1,
                ease: "none"
              });

              gsap.to(titleEl, {
                color: isCentered ? theme.cardBg : '#ffffff',
                fontSize: isCentered ? '4rem' : '2.5rem',
                fontWeight: isCentered ? 900 : 700,
                duration: 0.1,
                ease: "none"
              });

              if (descEl) {
                gsap.to(descEl, {
                  height: isCentered ? 'auto' : 0,
                  opacity: isCentered ? 1 : 0,
                  marginTop: isCentered ? '16px' : '0px',
                  duration: 0.1,
                  ease: "none"
                });
              }
            }
          });
        }
      };

      if (scrollerEl) {
        stConfig.scroller = scrollerEl;
      }
      ScrollTrigger.create(stConfig);

      // Marquee animation is now handled via CSS keyframes

      // Character Floating Animation
      const character = document.querySelector('.floating-character');
      if (character) {
        gsap.to(character, {
          y: "-=30",
          rotationZ: 10,
          yoyo: true,
          repeat: -1,
          duration: 2.5,
          ease: "sine.inOut"
        });
      }

    }, rootRef);

    return () => ctx.revert();
  }, [theme.cardBg, carouselItems.length]);

  return (
    <div ref={rootRef} style={{
      backgroundColor: theme.bg,
      width: '100%',
      minHeight: '100vh',
      position: 'relative',
      padding: '12vh 5vw 8vh 5vw',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>
        {`
          @keyframes infinite-marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .next-marquee {
            animation: infinite-marquee 20s linear infinite;
            will-change: transform;
          }
        `}
      </style>

      {/* Header / Hero */}
      <div style={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '8vh',
        zIndex: 2,
        minHeight: '80vh',
        justifyContent: 'center'
      }}>

        {/* Top Logo if provided */}
        {logoImage && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '4vh' }}>
            <img src={logoImage} alt={title} style={{ maxWidth: '400px', height: 'auto', objectFit: 'contain' }} />
          </div>
        )}

        {/* Top content 2 columns */}
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 3
        }}>
          {/* Left Column (Text) */}
          <div style={{
            flex: '0 0 50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            textAlign: 'left',
            paddingRight: '2vw',
            position: 'relative',
            paddingBottom: '10vh'
          }}>
            {/* Back Button */}
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: '#0f1115',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.3s',
                  marginBottom: '40px',
                  zIndex: 100
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#000'}
                onMouseOut={(e) => e.currentTarget.style.background = '#0f1115'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                  <path d="M11 18l-6-6 6-6" />
                </svg>
                Back
              </button>
            )}

            {/* Title / Logo text */}
            {!logoImage && (
              <h1 style={{
                 fontSize: 'clamp(3rem, 5vw, 5rem)',
                 fontWeight: 900, 
                 color: theme.titleColor || theme.cardBg, 
                 margin: '0 0 24px 0',
                 fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                 lineHeight: 1,
                 textTransform: 'uppercase',
                 letterSpacing: '-0.02em'
              }}>
                 {title}
              </h1>
            )}

            {/* Services List */}
            {services && services.length > 0 && (
              <ul style={{
                listStyleType: 'none',
                padding: 0,
                margin: 0,
                color: theme.listColor || theme.cardBg, 
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                lineHeight: 2
              }}>
                {services.map(s => <li key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{fontSize: '1.2rem'}}>•</span> {s}</li>)}
              </ul>
            )}
          </div>

          {/* Right Column (Image) */}
          <div style={{
            flex: '0 0 50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {heroImage && (
              <img src={heroImage} alt="Hero" style={{ 
                 maxWidth: '90%', 
                 height: 'auto',
                 maxHeight: '75vh', 
                 objectFit: 'contain',
                 filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.2))'
              }} draggable="false" />
            )}
          </div>
        </div>

        {/* Huge Title Below - spans across both columns at the bottom */}
        {title !== 'Market Square' && (
          <div style={{ 
            position: 'relative',
            marginTop: '8vh',
            width: '100%',
            textAlign: 'center', 
            zIndex: 1, 
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <h2 style={{
              fontSize: 'clamp(6rem, 15vw, 20rem)',
              fontWeight: 900,
              color: (title === 'Elevaid' || title === 'nobs') ? '#ffffff' : theme.cardBg,
              margin: 0,
              lineHeight: 0.75,
              letterSpacing: '-0.04em',
              opacity: 0.9,
              filter: 'blur(3px)', 
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              marginBottom: '4vh'
            }}>
              {title}
            </h2>
          </div>
        )}
      </div>

      {/* Grid Container */}
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        zIndex: 2
      }}>

        {/* Top 2 Columns */}
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'stretch',
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>

          {/* Left Column */}
          <div style={{
            flex: '1 1 300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Text Card Top */}
            <div style={{
              backgroundColor: theme.cardBg,
              color: theme.textColor,
              padding: '36px',
              borderRadius: '24px',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              {textTop}
            </div>

            {/* Image 1 (Left Bottom) */}
            <div style={{
              flex: 1,
              borderRadius: '24px',
              overflow: 'hidden',
              minHeight: '350px',
              ...(title === 'Elevaid' ? { backgroundColor: '#fff', padding: '24px', boxSizing: 'border-box' } : {}),
              ...(title === 'Tax Nerd' ? { backgroundColor: '#1B452A', padding: '24px', boxSizing: 'border-box' } : {})
            }}>
              <img src={images[0]} alt="Project visual" style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: title === 'Tax Nerd' ? 'contain' : 'cover', 
                borderRadius: title === 'Elevaid' ? '12px' : '0' 
              }} draggable="false" />
            </div>
          </div>

          {/* Right Column */}
          <div style={{
            flex: '1 1 300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Image 2 (Top Right) */}
            <div style={{
              flex: 1.6, // Makes this image taller than the one below it
              borderRadius: '24px',
              overflow: 'hidden',
              minHeight: '400px'
            }}>
              <img src={images[1]} alt="Project visual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
            </div>

            {/* Image 3 (Bottom Right) */}
            <div style={{
              flex: 1,
              borderRadius: '24px',
              overflow: 'hidden',
              minHeight: '220px',
              ...(title === 'Tax Nerd' ? { background: 'radial-gradient(circle, #00FFC3 0%, #09A782 100%)', padding: '24px', boxSizing: 'border-box' } : {})
            }}>
              <img src={images[2]} alt="Project visual" style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: title === 'Tax Nerd' ? 'contain' : 'cover' 
              }} draggable="false" />
            </div>
          </div>

        </div>

        {/* Bottom Full-Width Text Card */}
        <div style={{
          backgroundColor: theme.cardBg,
          color: theme.textColor,
          padding: '36px 40px',
          borderRadius: '24px',
          fontSize: '1.1rem',
          lineHeight: 1.6,
          fontWeight: 400,
          textAlign: 'center' // Centered text based on the screenshot
        }}>
          {textBottom}
        </div>

        {/* Vertical Scroll Carousel Section Wrapper */}
        {images.length >= 7 && (
          <div
            ref={wrapperRef}
            style={{
              width: '100vw',
              position: 'relative',
              left: '50%',
              right: '50%',
              marginLeft: '-50vw',
              marginRight: '-50vw',
              marginTop: '10vh',
              height: `${carouselItems.length * 100}vh`, // Create physical scroll height for native sticky
              backgroundColor: theme.bg
            }}>
            <div
              ref={sectionRef}
              style={{
                width: '100%', // Take full width of the wrapper
                height: '100vh',
                position: 'sticky', // NATIVE BROWSER STICKY! Eliminates ALL scroll jitter!
                top: 0,
                display: 'flex',
                overflow: 'hidden',
                backgroundColor: theme.bg
              }}
            >
              {/* Background Glow */}
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '-10%',
                transform: 'translateY(-50%)',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 230, 240, 0.8) 0%, rgba(255, 200, 220, 0.2) 50%, transparent 70%)',
                filter: 'blur(40px)',
                pointerEvents: 'none',
                zIndex: 0
              }} />

              {/* Left Column - Images */}
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                perspective: '1200px'
              }}>
                {carouselItems.map((_, i) => (
                  <div
                    key={`img-${i}`}
                    ref={el => imagesRef.current[i] = el}
                    style={{
                      position: 'absolute',
                      width: '380px',
                      aspectRatio: '1',
                      borderRadius: '24px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      transition: 'padding 0.3s, background 0.3s',
                      cursor: 'grab'
                    }}
                    onClick={() => navigate(null, i)}
                  >
                    <div className="img-inner" style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      backgroundColor: '#000',
                      // Prevent backface or sub-pixel 3D rendering glitches
                      WebkitTransform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
                    }}>
                      <img
                        src={images[3 + i]}
                        alt={`Visual ${i}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        draggable="false"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column - Text */}
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '100vh' }}>
                  {carouselItems.map((item, i) => (
                    <div
                      key={`text-${i}`}
                      ref={el => textItemsRef.current[i] = el}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translateY(-50%)',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                    >
                      <div className="title" style={{
                        margin: 0,
                        fontFamily: 'system-ui, sans-serif',
                        letterSpacing: '-0.02em',
                        transition: 'color 0.3s'
                      }}>
                        {item.title}
                      </div>
                      <div className="desc" style={{
                        color: theme.subtitleColor,
                        fontSize: '1rem',
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        height: 0, // start collapsed
                        opacity: 0,
                        fontWeight: 500
                      }}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Navigation Controls */}
              <div style={{
                position: 'absolute',
                right: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                zIndex: 10
              }}>
                <button
                  onClick={() => navigate(-1)}
                  disabled={currentIndex === 0}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentIndex === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                    cursor: currentIndex === 0 ? 'default' : 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => { if (currentIndex !== 0) e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>

                <button
                  onClick={() => navigate(1)}
                  disabled={currentIndex === carouselItems.length - 1}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentIndex === carouselItems.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                    cursor: currentIndex === carouselItems.length - 1 ? 'default' : 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => { if (currentIndex !== carouselItems.length - 1) e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extra Full-Width Image Sections */}
        {images.length >= 8 && (
          <div style={{
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0', // Flush together
            marginTop: '15vh' // Space after the carousel
          }}>
            <>
              {images[6] && (
                <div style={{ width: '100%' }}>
                  <img src={images[6]} alt="Extra Section 1" style={{ width: '100%', height: 'auto', display: 'block' }} draggable="false" />
                </div>
              )}
              {images[7] && (
                <div style={{ width: '100%' }}>
                  <img src={images[7]} alt="Extra Section 2" style={{ width: '100%', height: 'auto', display: 'block' }} draggable="false" />
                </div>
              )}
            </>
          </div>
        )}

        {/* Next Project Transition Section */}
        {nextProject && (
          <div style={{
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            marginTop: '0vh', // Flush with previous image
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* CTA Section */}
            <div style={{
              width: '100%',
              boxSizing: 'border-box',
              backgroundColor: theme.bg,
              padding: '12vh 5vw 4vh 5vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: theme.textColor
            }}>
              <p style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '24px'
              }}>
                THE INVITATION
              </p>
              <h2 style={{
                fontSize: 'clamp(3rem, 6vw, 5rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '24px',
                maxWidth: '800px',
                color: theme.titleColor || theme.textColor
              }}>
                Ready to make some noise?
              </h2>
              <p style={{
                fontSize: '1.1rem',
                opacity: 0.8,
                maxWidth: '600px',
                lineHeight: 1.6,
                marginBottom: '48px',
                color: theme.textColor
              }}>
                Whether you're a scrappy start-up or a global brand<br/>let's turn 'meh' into 'whoa.'
              </p>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: '24px',
                width: '100%',
                maxWidth: '600px'
              }}>
                <input 
                  type="email" 
                  placeholder="Your email" 
                  style={{
                    flex: '1 1 250px',
                    padding: '16px 24px',
                    borderRadius: '999px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
                <button style={{
                  flex: '0 0 auto',
                  padding: '16px 32px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#fff',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'inherit'
                }}>
                  Start your movement ↗
                </button>
              </div>
              
              <p style={{
                fontSize: '0.7rem',
                opacity: 0.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: theme.textColor
              }}>
                NO SPAM. JUST POSITIVE AURA POINTS IN YOUR INBOX.
              </p>
            </div>

            {/* The Beige Marquee Area */}
            <div style={{
              width: '100%',
              backgroundColor: theme.bg,
              padding: '12vh 0',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center'
            }}>
              {/* Marquee Text */}
              <div
                className="next-marquee"
                style={{
                  display: 'flex',
                  width: 'max-content'
                }}
              >
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      whiteSpace: 'nowrap',
                      fontFamily: '"Bricolage Grotesque", sans-serif',
                      fontSize: '140px',
                      fontWeight: 800,
                      color: (title === 'nobs' || title === 'Market Square') ? '#ffffff' : '#000',
                      opacity: 0.2,
                      textTransform: 'uppercase',
                      letterSpacing: '-0.03em',
                      lineHeight: '100%',
                      paddingRight: '50px'
                    }}
                  >
                    TURNING 'MEH' INTO 'WOW' TURNING 'MEH' INTO 'WOW' TURNING 'MEH' INTO 'WOW'
                  </div>
                ))}
              </div>

              {/* Floating Character */}
              <div
                className="floating-character"
                style={{
                  position: 'absolute',
                  right: '10%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '180px',
                  height: '180px',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
              >
                <img src="/aure-character.png" alt="Aure Character" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>

            {/* The Next Project Banner */}
            <div
              onClick={onNextProject}
              onMouseEnter={(e) => {
                const bg = e.currentTarget.querySelector('.next-project-bg');
                const title = e.currentTarget.querySelector('.next-project-title');
                if (bg) bg.style.transform = 'scale(1.05)';
                if (bg) bg.style.filter = 'blur(5px) brightness(0.5)';
                if (title) title.style.transform = 'scale(1.05)';
                if (title) title.style.color = '#FF2E93';
              }}
              onMouseLeave={(e) => {
                const bg = e.currentTarget.querySelector('.next-project-bg');
                const title = e.currentTarget.querySelector('.next-project-title');
                if (bg) bg.style.transform = 'scale(1.1)';
                if (bg) bg.style.filter = 'blur(10px) brightness(0.6)';
                if (title) title.style.transform = 'scale(1)';
                if (title) title.style.color = '#fff';
              }}
              style={{
                width: '100%',
                height: '60vh',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              {/* Background Image */}
              <div className="next-project-bg" style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${nextProject.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(10px) brightness(0.6)',
                transform: 'scale(1.1)', // prevent blurred edges
                transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                zIndex: 0
              }} />

              {/* Content */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#fff'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '20px',
                  opacity: 0.8
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Project</span>
                </div>
                <h2 className="next-project-title" style={{
                  fontSize: 'clamp(3rem, 8vw, 8rem)',
                  fontWeight: 900,
                  margin: 0,
                  letterSpacing: '-0.02em',
                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                }}>
                  {nextProject.title}
                </h2>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
