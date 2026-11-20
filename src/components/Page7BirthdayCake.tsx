import React, { useState, useRef, useEffect } from 'react';
import { FinalWishData } from '../types/romantic.js';
import { Sparkles, Heart, Wind, RotateCcw, Award } from 'lucide-react';
import { romanticAudio } from '../utils/soundEffects.js';
import { useTransparentImages } from '../utils/transparentImage.js';
import confetti from 'canvas-confetti';

interface Page7BirthdayCakeProps {
  recipientName: string;
  finalWish: FinalWishData;
  candlesBlown: boolean;
  onBlowCandles: () => void;
}

type TeddyPhase = 'idle' | 'walking' | 'preparing' | 'blowing' | 'celebrating';
type CandleFlameState = 'lit' | 'bending' | 'blown';

const TEDDY_STAND_IMG = '/src/assets/images/plush_teddy_stand_1795185853817.jpg';
const TEDDY_BLOW_IMG = '/src/assets/images/plush_teddy_blow_1795185852963.jpg';
const TEDDY_CHEER_IMG = '/src/assets/images/plush_teddy_cheer_1795185888517.jpg';
const TEDDY_SOURCES = [TEDDY_STAND_IMG, TEDDY_BLOW_IMG, TEDDY_CHEER_IMG];

const TOP_CONFETTI_PIECES = [
  { left: '6%', color: '#F43F5E', delay: '0s', dur: '4.1s', drift: '22px', shape: 'rect' },
  { left: '14%', color: '#F59E0B', delay: '0.4s', dur: '4.8s', drift: '-18px', shape: 'circle' },
  { left: '22%', color: '#EC4899', delay: '0.9s', dur: '3.9s', drift: '28px', shape: 'heart' },
  { left: '31%', color: '#A855F7', delay: '0.2s', dur: '4.5s', drift: '-24px', shape: 'rect' },
  { left: '40%', color: '#FB7185', delay: '1.1s', dur: '4.2s', drift: '15px', shape: 'heart' },
  { left: '49%', color: '#38BDF8', delay: '0.6s', dur: '4.9s', drift: '-20px', shape: 'rect' },
  { left: '58%', color: '#F472B6', delay: '1.4s', dur: '3.8s', drift: '26px', shape: 'circle' },
  { left: '67%', color: '#FBBF24', delay: '0.3s', dur: '4.6s', drift: '-15px', shape: 'rect' },
  { left: '76%', color: '#E11D48', delay: '0.8s', dur: '4.0s', drift: '20px', shape: 'heart' },
  { left: '85%', color: '#34D399', delay: '1.3s', dur: '4.7s', drift: '-26px', shape: 'rect' },
  { left: '93%', color: '#F43F5E', delay: '0.5s', dur: '4.3s', drift: '-14px', shape: 'circle' },
  { left: '19%', color: '#FDE047', delay: '1.9s', dur: '4.4s', drift: '18px', shape: 'rect' },
  { left: '63%', color: '#FB7185', delay: '2.1s', dur: '4.1s', drift: '-22px', shape: 'heart' },
  { left: '81%', color: '#C084FC', delay: '1.7s', dur: '4.5s', drift: '16px', shape: 'circle' },
];

export const Page7BirthdayCake: React.FC<Page7BirthdayCakeProps> = ({
  recipientName,
  finalWish,
  candlesBlown,
  onBlowCandles,
}) => {
  const [teddyPhase, setTeddyPhase] = useState<TeddyPhase>(
    candlesBlown ? 'celebrating' : 'idle'
  );
  const [candleStates, setCandleStates] = useState<[CandleFlameState, CandleFlameState, CandleFlameState]>(
    candlesBlown ? ['blown', 'blown', 'blown'] : ['lit', 'lit', 'lit']
  );
  const [showPoppers, setShowPoppers] = useState(candlesBlown);
  const transparentTeddies = useTransparentImages(TEDDY_SOURCES);

  const timersRef = useRef<number[]>([]);

  const clearScheduledTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearScheduledTimers();
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const fireDualPartyPopperConfetti = () => {
    // Immediate dual bursts from left & right party poppers
    const colors = ['#F43F5E', '#F472B6', '#FBBF24', '#38BDF8', '#A855F7', '#34D399', '#FDA4AF'];

    confetti({
      particleCount: 55,
      angle: 58,
      spread: 62,
      startVelocity: 48,
      origin: { x: 0.04, y: 0.58 },
      colors,
    });
    confetti({
      particleCount: 55,
      angle: 122,
      spread: 62,
      startVelocity: 48,
      origin: { x: 0.96, y: 0.58 },
      colors,
    });

    // Follow-up celebratory shower from both sides + top rainfall over 3.2 seconds
    const duration = 3200;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 58,
        startVelocity: 38,
        origin: { x: 0.02, y: 0.52 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 58,
        startVelocity: 38,
        origin: { x: 0.98, y: 0.52 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 270,
        spread: 110,
        startVelocity: 18,
        origin: { x: Math.random(), y: -0.05 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  };

  const handleBlowCandles = () => {
    if (teddyPhase !== 'idle') return;
    clearScheduledTimers();

    // 1. Teddy walks smoothly from left towards the birthday cake
    setTeddyPhase('walking');
    romanticAudio.playHeartPopSound();

    // 2. Arrives right in front of cake, leans slightly forward & prepares to blow
    schedule(() => {
      setTeddyPhase('preparing');
    }, 1250);

    // 3. Teddy blows visible translucent airflow directly from mouth towards flames
    schedule(() => {
      setTeddyPhase('blowing');
      setCandleStates(['bending', 'bending', 'bending']);
      romanticAudio.playCandleBlowSound();
    }, 1750);

    // 4. Flames gradually extinguish one by one as the airflow sweeps across them
    schedule(() => {
      setCandleStates(['blown', 'bending', 'bending']);
    }, 2450);

    schedule(() => {
      setCandleStates(['blown', 'blown', 'bending']);
    }, 2900);

    schedule(() => {
      setCandleStates(['blown', 'blown', 'blown']);
    }, 3350);

    // 5. All candles blown -> Dual Party Poppers burst + 2.5s balloon/party-pop sound + Happy Birthday music + Confetti!
    schedule(async () => {
      setTeddyPhase('celebrating');
      setShowPoppers(true);
      onBlowCandles();

      // Realistic 2.5-second balloon-pop / party-pop celebration sound synchronized with poppers
      romanticAudio.playPartyPopCelebrationSound();
      fireDualPartyPopperConfetti();

      // Smoothly fade out background music and play Happy Birthday song clearly without overlap
      await romanticAudio.handleCandleBlowAudioTransition();
    }, 3550);
  };

  const handleRelight = () => {
    clearScheduledTimers();
    setCandleStates(['lit', 'lit', 'lit']);
    setTeddyPhase('idle');
    setShowPoppers(false);
    romanticAudio.stopBirthdayMusic();
    romanticAudio.startBackgroundMusic();
    romanticAudio.playHeartPopSound();
  };

  const allBlown = candleStates.every((s) => s === 'blown');

  const rawTeddySrc =
    teddyPhase === 'blowing'
      ? TEDDY_BLOW_IMG
      : teddyPhase === 'celebrating'
      ? TEDDY_CHEER_IMG
      : TEDDY_STAND_IMG;
  const teddyImageSrc = transparentTeddies[rawTeddySrc] || rawTeddySrc;

  return (
    <div
      className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto text-center z-10"
      data-testid="birthday-cake-stage"
      data-teddy-phase={teddyPhase}
    >
      {/* Top-to-Bottom Continuous Falling Confetti & Floating Hearts During Celebration */}
      {showPoppers && (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
          {TOP_CONFETTI_PIECES.map((piece, idx) => (
            <span
              key={idx}
              className="absolute -top-6 animate-top-confetti"
              style={
                {
                  left: piece.left,
                  animationDelay: piece.delay,
                  '--fall-dur': piece.dur,
                  '--drift-x': piece.drift,
                } as React.CSSProperties
              }
            >
              {piece.shape === 'heart' ? (
                <span style={{ color: piece.color }} className="text-sm drop-shadow-xs">
                  ❤️
                </span>
              ) : piece.shape === 'circle' ? (
                <span
                  className="block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: piece.color }}
                />
              ) : (
                <span
                  className="block w-2.5 h-4 rounded-xs"
                  style={{ backgroundColor: piece.color }}
                />
              )}
            </span>
          ))}
        </div>
      )}

      {/* Left & Right Simultaneous Party Poppers */}
      {showPoppers && (
        <>
          {/* Left Party Popper */}
          <div
            data-testid="party-popper-left"
            className="fixed left-1 sm:left-5 bottom-24 sm:bottom-28 z-40 pointer-events-none animate-popper-left"
            aria-hidden="true"
          >
            <svg viewBox="0 0 120 120" className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-lg">
              {/* Burst Streamers & Sparkles */}
              <path d="M72 48 Q95 22 114 14" stroke="#F43F5E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M76 56 Q102 42 118 46" stroke="#FBBF24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M68 42 Q82 14 90 4" stroke="#38BDF8" strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="96" cy="24" r="4" fill="#F472B6" />
              <circle cx="108" cy="36" r="3.5" fill="#34D399" />
              <circle cx="84" cy="14" r="3" fill="#FBBF24" />
              {/* Festive Striped Cone */}
              <polygon points="14,104 46,42 78,74" fill="#F43F5E" />
              <polygon points="28,77 56,52 68,64 38,91" fill="#FDE047" />
              <polygon points="14,104 28,77 38,91" fill="#FB7185" />
              <ellipse cx="62" cy="58" rx="11" ry="22" transform="rotate(-45 62 58)" fill="#9F1239" />
            </svg>
          </div>

          {/* Right Party Popper */}
          <div
            data-testid="party-popper-right"
            className="fixed right-1 sm:right-5 bottom-24 sm:bottom-28 z-40 pointer-events-none animate-popper-right"
            aria-hidden="true"
          >
            <svg viewBox="0 0 120 120" className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-lg">
              {/* Burst Streamers & Sparkles */}
              <path d="M48 48 Q25 22 6 14" stroke="#EC4899" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M44 56 Q18 42 2 46" stroke="#FBBF24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M52 42 Q38 14 30 4" stroke="#A855F7" strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="24" cy="24" r="4" fill="#38BDF8" />
              <circle cx="12" cy="36" r="3.5" fill="#F43F5E" />
              <circle cx="36" cy="14" r="3" fill="#FDE047" />
              {/* Festive Striped Cone */}
              <polygon points="106,104 74,42 42,74" fill="#EC4899" />
              <polygon points="92,77 64,52 52,64 82,91" fill="#FDE047" />
              <polygon points="106,104 92,77 82,91" fill="#F472B6" />
              <ellipse cx="58" cy="58" rx="11" ry="22" transform="rotate(45 58 58)" fill="#9D174D" />
            </svg>
          </div>
        </>
      )}

      {/* Header */}
      <p className="text-xs sm:text-sm font-medium text-rose-500 tracking-wide mb-2">
        Make a Wish, My Love · Final Birthday Surprise
      </p>

      <h2 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-bold text-rose-950 mb-2 text-balance">
        Happy Birthday, {recipientName}!
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-md">
        Close your eyes, make your sweetest birthday wish, and tap the button below to watch our teddy bear blow out your candles 🎂
      </p>

      {/* Interactive Stage: Realistic 3D Plush Teddy Bear + Airflow Stream + 3-Tier Birthday Cake */}
      <div className="relative w-full max-w-2xl h-[340px] sm:h-[380px] rounded-3xl bg-[#FFF6F8] border border-rose-200/70 shadow-lg shadow-rose-200/30 flex items-end justify-center pb-8 px-4 mb-7 overflow-hidden">
        {/* Soft Warm Ambient Glow behind Cake */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 64% 48%, rgba(255, 228, 196, 0.45) 0%, rgba(255, 246, 248, 0) 60%)',
          }}
        />

        {/* Realistic 3D Plush Brown Teddy Bear with Pink Bow */}
        <div
          data-testid="plush-teddy-bear"
          className="absolute bottom-6 z-20 pointer-events-none transition-all duration-[1250ms] ease-out"
          style={{
            left:
              teddyPhase === 'idle'
                ? '-160px'
                : teddyPhase === 'walking'
                ? 'clamp(14px, 12%, 95px)'
                : teddyPhase === 'preparing'
                ? 'clamp(22px, 16%, 125px)'
                : teddyPhase === 'blowing'
                ? 'clamp(26px, 18%, 138px)'
                : 'clamp(16px, 14%, 110px)',
            opacity: teddyPhase === 'idle' ? 0 : 1,
            transform:
              teddyPhase === 'preparing'
                ? 'translateY(-2px) rotate(4deg) scale(1.03)'
                : teddyPhase === 'blowing'
                ? 'translateY(-3px) rotate(5deg) scale(1.05)'
                : 'translateY(0px) rotate(0deg) scale(1)',
          }}
        >
          {/* Soft Ground Contact Shadow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-3.5 rounded-full bg-rose-950/15 blur-sm" />

          {/* Teddy Status Whisper */}
          <div className="mb-1 flex justify-center">
            <span className="px-3 py-1 rounded-full bg-white/95 border border-rose-200 text-[11px] font-semibold text-rose-800 shadow-sm">
              {teddyPhase === 'walking'
                ? 'Walking over... 🧸'
                : teddyPhase === 'preparing'
                ? 'Deep breath... ✨'
                : teddyPhase === 'blowing'
                ? 'Fffffhhhhhuuu! 💨'
                : teddyPhase === 'celebrating'
                ? 'Happy Birthday! 🎉❤️'
                : ''}
            </span>
          </div>

          {/* High-Res True Alpha-Transparent 3D Plush Teddy Render */}
          <div
            className={`w-36 h-48 sm:w-44 sm:h-56 relative ${
              teddyPhase === 'walking'
                ? 'animate-teddy-walk'
                : teddyPhase === 'celebrating'
                ? 'animate-teddy-cheer'
                : ''
            }`}
          >
            <img
              src={teddyImageSrc}
              alt="Realistic 3D plush brown teddy bear wearing a satin pink bow"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(92,50,36,0.22)] select-none"
            />
          </div>
        </div>

        {/* Visible Translucent Airflow Stream Originating Directly From Teddy's Mouth to Candle Flames */}
        {teddyPhase === 'blowing' && (
          <div
            data-testid="teddy-airflow-stream"
            className="absolute inset-0 z-30 pointer-events-none"
            aria-hidden="true"
          >
            {/* Precision SVG Wind Curves anchored at teddy's mouth (~left 37%, y 49%) sweeping into all 3 candle flames (~left 57%–71%, y 41%–45%) */}
            <svg className="w-full h-full" viewBox="0 0 640 380" preserveAspectRatio="none">
              <defs>
                <linearGradient id="realisticAirGrad" x1="0%" y1="50%" x2="100%" y2="40%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="30%" stopColor="#E0F2FE" stopOpacity="0.82" />
                  <stop offset="72%" stopColor="#FCE7F3" stopOpacity="0.58" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <filter id="softAirBlur">
                  <feGaussianBlur stdDeviation="2.2" />
                </filter>
              </defs>

              {/* Soft misty breath plume cone originating right at teddy's pursed mouth */}
              <path
                d="M 244 196 Q 320 176 425 142 L 442 182 Q 332 198 244 204 Z"
                fill="url(#realisticAirGrad)"
                opacity="0.42"
                filter="url(#softAirBlur)"
              />

              {/* Primary Wind Stream 1 -> Left Candle */}
              <path
                d="M 244 198 C 282 190, 326 174, 372 162"
                fill="none"
                stroke="url(#realisticAirGrad)"
                strokeWidth="4.5"
                strokeLinecap="round"
                className="animate-wind-dash"
              />

              {/* Primary Wind Stream 2 -> Center Candle */}
              <path
                d="M 244 199 C 296 186, 352 168, 412 158"
                fill="none"
                stroke="url(#realisticAirGrad)"
                strokeWidth="5.5"
                strokeLinecap="round"
                className="animate-wind-dash"
                style={{ animationDelay: '0.1s' }}
              />

              {/* Primary Wind Stream 3 -> Right Candle */}
              <path
                d="M 244 201 C 304 195, 376 176, 448 164"
                fill="none"
                stroke="url(#realisticAirGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-wind-dash"
                style={{ animationDelay: '0.2s' }}
              />

              {/* Delicate Swirling Eddy Curl */}
              <path
                d="M 262 194 Q 315 170 360 154 T 420 144"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.72"
                className="animate-wind-dash"
                style={{ animationDelay: '0.14s' }}
              />
            </svg>

            {/* Translucent Floating Mist & Air Puff Particles traveling right from mouth */}
            {[
              { top: '50%', delay: '0s', puffY: '-28px', size: 'w-4 h-4' },
              { top: '51%', delay: '0.14s', puffY: '-16px', size: 'w-5 h-3.5' },
              { top: '52%', delay: '0.28s', puffY: '-34px', size: 'w-3.5 h-3.5' },
              { top: '50%', delay: '0.42s', puffY: '-20px', size: 'w-6 h-4' },
              { top: '51%', delay: '0.56s', puffY: '-10px', size: 'w-4 h-3' },
            ].map((puff, pIdx) => (
              <span
                key={pIdx}
                className={`absolute left-[38%] ${puff.size} rounded-full bg-white/75 blur-[3px] animate-air-puff`}
                style={
                  {
                    top: puff.top,
                    animationDelay: puff.delay,
                    '--puff-y': puff.puffY,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}

        {/* 3-Tier Luxury Birthday Cake Positioned Slightly Right of Center so Teddy Stands Clearly Beside It */}
        <div
          className={`relative z-10 flex flex-col items-center transition-transform duration-1000 ease-out ${
            teddyPhase === 'idle' ? 'translate-x-0' : 'translate-x-14 sm:translate-x-20'
          }`}
        >
          {/* Candles on Top */}
          <div className="flex items-end justify-center gap-5 sm:gap-7 mb-1 z-10">
            {candleStates.map((flameState, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center"
                data-testid={`cake-candle-${idx + 1}`}
                data-flame-state={flameState}
              >
                {/* Candle Flame or Rising Smoke */}
                {flameState === 'lit' ? (
                  <div className="relative flex items-center justify-center h-7">
                    <div className="absolute w-7 h-7 rounded-full bg-amber-300/35 blur-md" />
                    <div className="w-3.5 h-6 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-white animate-flame shadow-md" />
                  </div>
                ) : flameState === 'bending' ? (
                  /* Flame bending strongly away to the right from teddy's airflow */
                  <div className="relative flex items-center justify-center h-7">
                    <div className="w-4 h-6 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 animate-flame-bending shadow-lg" />
                  </div>
                ) : (
                  /* Gradually extinguished -> delicate curling smoke wisps */
                  <div className="relative flex flex-col items-center justify-end h-7">
                    <div className="w-1.5 h-4 bg-slate-400/70 rounded-full blur-[1px] animate-smoke-rise" />
                    <div
                      className="absolute -top-2 w-3.5 h-3.5 rounded-full bg-slate-300/60 blur-[2px] animate-smoke-rise"
                      style={{ animationDelay: `${0.15 + idx * 0.12}s` }}
                    />
                  </div>
                )}

                {/* Wick */}
                <div className="w-0.5 h-1.5 bg-neutral-800" />

                {/* Striped Pastel Candle Stick */}
                <div
                  className="w-3.5 h-10 rounded-t-sm shadow-inner"
                  style={{
                    background:
                      idx === 1
                        ? 'repeating-linear-gradient(135deg, #F472B6 0px, #F472B6 4px, #FFF1F2 4px, #FFF1F2 8px)'
                        : 'repeating-linear-gradient(135deg, #FB7185 0px, #FB7185 4px, #FFE4E6 4px, #FFE4E6 8px)',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Tier 1 */}
          <div className="w-28 sm:w-32 h-11 bg-gradient-to-r from-rose-100 via-pink-50 to-rose-100 rounded-t-xl border-t-2 border-x-2 border-rose-200/90 shadow-md relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-rose-200/70 rounded-b-full" />
            <span className="text-[10px] text-rose-500 font-serif-title font-semibold mt-1">
              Make A Wish
            </span>
          </div>

          {/* Tier 2 */}
          <div className="w-40 sm:w-48 h-14 bg-gradient-to-r from-pink-100 via-rose-50 to-pink-100 border-t-2 border-x-2 border-rose-200 shadow-md relative overflow-hidden flex items-center justify-around px-4">
            <div className="absolute top-0 left-0 right-0 h-3 bg-pink-200/75 rounded-b-full" />
            <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
          </div>

          {/* Tier 3 */}
          <div className="w-52 sm:w-64 h-18 bg-gradient-to-r from-rose-200 via-pink-100 to-rose-200 border-2 border-rose-300 rounded-xl shadow-xl relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-0 left-0 right-0 h-3.5 bg-rose-300/80 rounded-b-full" />
            <span className="font-script-romantic text-xl sm:text-2xl font-bold text-rose-800 drop-shadow-xs mt-1">
              Forever With You ❤️
            </span>
          </div>

          {/* Porcelain Cake Platter */}
          <div className="w-60 sm:w-76 h-3.5 bg-gradient-to-r from-stone-200 via-white to-stone-200 rounded-full shadow-md mt-0.5 border border-stone-300" />
        </div>
      </div>

      {/* Primary Action Button: 'TAP TO BLOW THE CANDLES ❤️' */}
      {!allBlown && (
        <button
          type="button"
          onClick={handleBlowCandles}
          disabled={teddyPhase !== 'idle'}
          className="group relative flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-semibold text-sm sm:text-base shadow-xl shadow-rose-300/70 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse-glow disabled:opacity-80 disabled:cursor-wait"
        >
          <Wind className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>TAP TO BLOW THE CANDLES ❤️</span>
          <Sparkles className="w-4 h-4 text-amber-200" />
        </button>
      )}

      {/* Relight & Replay Button */}
      {allBlown && (
        <button
          type="button"
          onClick={handleRelight}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-rose-700 bg-white/95 hover:bg-white border border-rose-200 shadow-sm mb-6 transition cursor-pointer hover:scale-105"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Relight candles &amp; replay celebration</span>
        </button>
      )}

      {/* Final Birthday Wish Card */}
      {allBlown && (
        <div className="w-full max-w-2xl bg-gradient-to-b from-white/95 to-rose-50/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border-2 border-rose-300/80 shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-inner">
            <Award className="w-7 h-7" />
          </div>

          <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-rose-950 mb-3">
            {finalWish.celebrationTitle}
          </h3>

          <p className="font-serif-title text-base sm:text-lg text-slate-800 leading-relaxed italic mb-4 max-w-xl mx-auto font-medium">
            &ldquo;{finalWish.wishMessage}&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-rose-700 font-semibold mb-6">
            {finalWish.subtext}
          </p>

          <div className="pt-4 border-t border-rose-200 flex flex-wrap items-center justify-center gap-3">
            <div className="text-xs text-rose-900 font-handwritten text-lg flex items-center gap-1">
              <span>Made with all my heart for you</span>
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 inline" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
