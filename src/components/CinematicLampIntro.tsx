import React, { useState, useRef } from 'react';
import { romanticAudio } from '../utils/soundEffects.js';
import { isLampPullComplete } from '../utils/romanticLogic.js';

interface CinematicLampIntroProps {
  onRevealComplete: () => void;
}

export const CinematicLampIntro: React.FC<CinematicLampIntroProps> = ({
  onRevealComplete,
}) => {
  const [phase, setPhase] = useState<'dark' | 'pulling' | 'lit' | 'fading'>('dark');
  const [dragOffset, setDragOffset] = useState(0);
  const pointerStartYRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);

  const triggerLampOn = () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Brief visual tug downward if triggered by tap
    setDragOffset(36);
    setPhase('pulling');

    // Realistic mechanical light-switch click sound
    romanticAudio.playLampClickSound();

    // Release string spring & ignite warm lamp glow immediately after click
    setTimeout(() => {
      setDragOffset(0);
      setPhase('lit');
      // Softly begin background music as the magical world illuminates
      setTimeout(() => {
        romanticAudio.startBackgroundMusic();
      }, 350);
    }, 110);

    // Begin smooth cinematic fade-out of black backdrop to reveal Page 1
    setTimeout(() => {
      setPhase('fading');
    }, 1050);

    // Complete reveal and unmount overlay
    setTimeout(() => {
      onRevealComplete();
    }, 2350);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (hasTriggeredRef.current) return;
    pointerStartYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerStartYRef.current === null || hasTriggeredRef.current) return;
    const deltaY = Math.max(0, Math.min(64, e.clientY - pointerStartYRef.current));
    setDragOffset(deltaY);
    if (isLampPullComplete(deltaY, 34)) {
      pointerStartYRef.current = null;
      triggerLampOn();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerStartYRef.current === null || hasTriggeredRef.current) return;
    const deltaY = Math.max(0, e.clientY - pointerStartYRef.current);
    pointerStartYRef.current = null;

    // Either a tap (< 12px movement) or a decent pull triggers the lamp
    if (deltaY < 12 || isLampPullComplete(deltaY, 22)) {
      triggerLampOn();
    } else {
      setDragOffset(0);
    }
  };

  const isLit = phase === 'lit' || phase === 'fading';
  const isFading = phase === 'fading';

  return (
    <div
      data-testid="cinematic-lamp-intro"
      data-lamp-phase={phase}
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-opacity duration-[1250ms] ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: isLit
          ? 'radial-gradient(circle at 22% 28%, rgba(255, 241, 208, 0.96) 0%, rgba(255, 214, 165, 0.72) 26%, rgba(48, 30, 26, 0.92) 64%, #09070A 100%)'
          : '#040305',
        transition: 'background 1.1s ease-out, opacity 1.25s ease-out',
      }}
    >
      {/* Expanding Warm Illumination Veil */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-[1100ms] ease-out ${
          isLit ? 'opacity-100 scale-110' : 'opacity-0 scale-75'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 95% 85% at 22% 26%, rgba(255, 248, 225, 0.92) 0%, rgba(255, 224, 178, 0.58) 32%, rgba(255, 198, 175, 0.28) 62%, transparent 100%)',
        }}
      />

      {/* Volumetric Diagonal Light Rays from the Lamp */}
      {isLit && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none animate-lamp-rays"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="warmRayGrad" x1="0%" y1="0%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.58" />
              <stop offset="45%" stopColor="#FFD79A" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#FFC2B4" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="bulbBloom" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FFE4A3" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#FFB26B" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Soft conical downwash + wide atmospheric rays */}
          <polygon points="210,205 1180,60 1200,480 230,275" fill="url(#warmRayGrad)" opacity="0.65" />
          <polygon points="180,235 880,800 320,800 130,250" fill="url(#warmRayGrad)" opacity="0.72" />
          <polygon points="220,185 1100,0 1200,210 245,235" fill="url(#warmRayGrad)" opacity="0.4" />
          <circle cx="215" cy="220" r="210" fill="url(#bulbBloom)" />
        </svg>
      )}

      {/* Subtle Ambient Floor Reflection */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none transition-opacity duration-1000 ${
          isLit ? 'opacity-80' : 'opacity-15'
        }`}
        style={{
          background: isLit
            ? 'radial-gradient(ellipse 42% 85% at 22% 90%, rgba(255, 224, 168, 0.55) 0%, transparent 75%)'
            : 'radial-gradient(ellipse 26% 65% at 22% 95%, rgba(255, 232, 200, 0.12) 0%, transparent 75%)',
        }}
      />

      {/* Realistic Standing Floor Lamp Positioned on the Left Side */}
      <div className="relative h-full w-full max-w-6xl mx-auto flex items-end">
        <div className="relative ml-4 sm:ml-14 md:ml-24 h-[78vh] max-h-[680px] min-h-[430px] w-[210px] sm:w-[250px] flex flex-col items-center justify-end pb-6 sm:pb-10">
          {/* Lamp SVG Assembly */}
          <svg
            viewBox="0 0 240 560"
            className="w-full h-full overflow-visible drop-shadow-[0_18px_40px_rgba(0,0,0,0.9)]"
            aria-hidden="true"
          >
            <defs>
              {/* Metallic Brushed Brass Pole */}
              <linearGradient id="brassPole" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isLit ? '#6E512E' : '#261E18'} />
                <stop offset="32%" stopColor={isLit ? '#E2BD7B' : '#584838'} />
                <stop offset="58%" stopColor={isLit ? '#FFF0C2' : '#7A6752'} />
                <stop offset="85%" stopColor={isLit ? '#9A723F' : '#332820'} />
                <stop offset="100%" stopColor={isLit ? '#4E371D' : '#19130F'} />
              </linearGradient>

              {/* Base Metallic Gradient */}
              <linearGradient id="brassBase" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isLit ? '#4F3920' : '#171210'} />
                <stop offset="28%" stopColor={isLit ? '#C9A15E' : '#403429'} />
                <stop offset="52%" stopColor={isLit ? '#F5DC9B' : '#5F4E3E'} />
                <stop offset="78%" stopColor={isLit ? '#8D6636' : '#2D241C'} />
                <stop offset="100%" stopColor={isLit ? '#3B2915' : '#120E0C'} />
              </linearGradient>

              {/* Lampshade Fabric Gradient (Dark Silhouette -> Warm Illuminated Linen) */}
              <linearGradient id="shadeSurface" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isLit ? '#FFF2CC' : '#231D22'} />
                <stop offset="48%" stopColor={isLit ? '#FFE2A4' : '#30282E'} />
                <stop offset="100%" stopColor={isLit ? '#FFBF73' : '#1E191E'} />
              </linearGradient>

              {/* Inner Shade Warm Bulb Glow */}
              <radialGradient id="shadeInnerGlow" cx="50%" cy="62%" r="58%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isLit ? '1' : '0'} />
                <stop offset="45%" stopColor="#FFE09C" stopOpacity={isLit ? '0.9' : '0'} />
                <stop offset="100%" stopColor="#FF9E44" stopOpacity={isLit ? '0.2' : '0'} />
              </radialGradient>

              {/* Soft Shade Outer Halo when Lit */}
              <radialGradient id="shadeAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE5A5" stopOpacity={isLit ? '0.7' : '0'} />
                <stop offset="60%" stopColor="#FFB86C" stopOpacity={isLit ? '0.28' : '0'} />
                <stop offset="100%" stopColor="#FF9E6D" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Warm Halo Around Lampshade */}
            <circle cx="115" cy="115" r="145" fill="url(#shadeAura)" className="transition-opacity duration-700" />

            {/* Under-Shade Downward Warm Cone */}
            {isLit && (
              <polygon
                points="46,162 184,162 240,540 -10,540"
                fill="url(#warmRayGrad)"
                opacity="0.45"
              />
            )}

            {/* Vertical Floor Lamp Pole */}
            <rect x="110" y="148" width="10" height="378" rx="4" fill="url(#brassPole)" />
            {/* Decorative Collar Rings along Pole */}
            <rect x="106" y="166" width="18" height="8" rx="3" fill="url(#brassBase)" />
            <rect x="107" y="340" width="16" height="6" rx="3" fill="url(#brassBase)" />

            {/* Stepped Weighted Floor Base */}
            <ellipse cx="115" cy="542" rx="64" ry="12" fill="#000000" opacity="0.65" />
            <path d="M58 536 C58 524, 172 524, 172 536 L176 544 C176 550, 54 550, 54 544 Z" fill="url(#brassBase)" />
            <ellipse cx="115" cy="527" rx="46" ry="7" fill="url(#brassPole)" />
            <path d="M98 524 L106 502 L124 502 L132 524 Z" fill="url(#brassBase)" />

            {/* Top Brass Finial */}
            <circle cx="115" cy="34" r="6" fill="url(#brassPole)" />
            <rect x="112" y="38" width="6" height="10" fill="url(#brassPole)" />

            {/* Lampshade Inner Rim & Glowing Bulb */}
            <ellipse
              cx="115"
              cy="160"
              rx="69"
              ry="13"
              fill={isLit ? '#FFF4CE' : '#181417'}
              stroke={isLit ? '#E9B872' : '#3C3238'}
              strokeWidth="1.5"
            />
            {isLit && <circle cx="115" cy="148" r="14" fill="#FFFFFF" opacity="0.95" />}

            {/* Main Drum/Empire Fabric Lampshade */}
            <path
              d="M66 48 L164 48 L184 160 C150 172, 80 172, 46 160 Z"
              fill="url(#shadeSurface)"
              stroke={isLit ? '#F4C983' : '#42373E'}
              strokeWidth="1.4"
            />

            {/* Subtle Pleat Texture Lines on Lampshade */}
            <g stroke={isLit ? '#E2A45B' : '#3B3137'} strokeWidth="0.9" opacity={isLit ? '0.35' : '0.45'}>
              <line x1="82" y1="49" x2="70" y2="164" />
              <line x1="98" y1="49" x2="92" y2="167" />
              <line x1="115" y1="49" x2="115" y2="168" />
              <line x1="132" y1="49" x2="138" y2="167" />
              <line x1="148" y1="49" x2="160" y2="164" />
            </g>

            {/* Warm Light Core Overlay on Shade */}
            <path
              d="M66 48 L164 48 L184 160 C150 172, 80 172, 46 160 Z"
              fill="url(#shadeInnerGlow)"
            />

            {/* Subtle Top Rim Highlight */}
            <ellipse
              cx="115"
              cy="48"
              rx="49"
              ry="7"
              fill={isLit ? '#FFEAC0' : '#262025'}
              stroke={isLit ? '#F5CE87' : '#4C4047'}
              strokeWidth="1.2"
            />
          </svg>

          {/* Interactive Hanging Pull String / Beaded Chain */}
          <div
            className="absolute z-30 flex flex-col items-center"
            style={{
              top: '28.5%',
              left: '64%',
              transform: 'translateX(-50%)',
            }}
          >
            <div>
              {/* Beaded Brass Pull Chain stretching smoothly with drag */}
              <div
                className="w-[3px] mx-auto rounded-full transition-[height] duration-75"
                style={{
                  height: `${86 + dragOffset}px`,
                  background: isLit
                    ? 'repeating-linear-gradient(to bottom, #FFF3C4 0px, #D9A44E 4px, #855A22 6px)'
                    : 'repeating-linear-gradient(to bottom, #E8CFA0 0px, #B89155 4px, #594324 6px)',
                  boxShadow: isLit
                    ? '0 0 10px rgba(255, 224, 150, 0.9)'
                    : '0 0 8px rgba(240, 206, 145, 0.35)',
                }}
              />

              {/* Interactive Pull Tassel / Acorn Button (>= 56x56 stationary touch hitbox) */}
              <button
                type="button"
                onClick={triggerLampOn}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerLampOn();
                  }
                }}
                aria-label="Pull or tap the lamp string to turn on the light"
                className="group relative -mt-2 flex flex-col items-center justify-center min-w-[56px] min-h-[56px] cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 rounded-full touch-none"
              >
                {/* Soft Inviting Glow Ring around Pull Handle */}
                <span
                  className={`absolute w-10 h-10 rounded-full transition-all duration-500 ${
                    isLit
                      ? 'bg-amber-200/60 blur-md scale-125'
                      : 'bg-amber-300/30 blur-md group-hover:bg-amber-200/50 group-hover:scale-125'
                  }`}
                />
                {/* Sculpted Brass Acorn Pull Weight */}
                <span
                  className="relative w-4 h-6 rounded-b-full rounded-t-md border border-amber-200/70 shadow-lg transition-transform duration-150 group-hover:scale-110"
                  style={{
                    background:
                      'linear-gradient(135deg, #FFF3C4 0%, #D4A154 52%, #7D5522 100%)',
                    boxShadow: '0 0 14px rgba(255, 223, 148, 0.65)',
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
