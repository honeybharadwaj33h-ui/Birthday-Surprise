import React, { useState } from 'react';
import { UniverseMomentItem, UniverseAnimationStyle } from '../types/romantic.js';
import { Heart, Maximize2, X } from 'lucide-react';
import { romanticAudio } from '../utils/soundEffects.js';
import { PhotoUploadButton } from './PhotoUploadButton.js';
import confetti from 'canvas-confetti';

interface Page3OurLittleUniverseProps {
  moments: UniverseMomentItem[];
  lovedIds: number[];
  onLoveMoment: (id: number) => void;
  onUpdateIllustration?: (id: number, newUrl: string) => void;
}

const BURST_PARTICLES = [
  { x: '-28px', y: '-34px', delay: '0ms', glyph: '❤️' },
  { x: '26px', y: '-38px', delay: '40ms', glyph: '✨' },
  { x: '-14px', y: '-48px', delay: '80ms', glyph: '💖' },
  { x: '16px', y: '-44px', delay: '110ms', glyph: '❤️' },
  { x: '0px', y: '-54px', delay: '50ms', glyph: '✨' },
  { x: '-32px', y: '-18px', delay: '90ms', glyph: '💕' },
];

const AnimatedSceneOverlay: React.FC<{ style: UniverseAnimationStyle }> = ({ style }) => {
  if (style === 'petals') {
    const petals = [
      { left: '12%', delay: '0s', dur: '7.2s', size: 'w-2.5 h-3.5' },
      { left: '34%', delay: '1.8s', dur: '8.1s', size: 'w-2 h-3' },
      { left: '58%', delay: '0.9s', dur: '6.8s', size: 'w-3 h-4' },
      { left: '78%', delay: '2.7s', dur: '7.6s', size: 'w-2 h-3' },
      { left: '90%', delay: '4.1s', dur: '8.4s', size: 'w-2.5 h-3.5' },
    ];
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {petals.map((p, idx) => (
          <span
            key={idx}
            className={`absolute -top-4 ${p.size} rounded-tl-full rounded-br-full bg-gradient-to-br from-pink-200/90 to-rose-300/80 shadow-xs animate-petal-fall`}
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>
    );
  }

  if (style === 'stars') {
    const stars = [
      { left: '16%', top: '18%', delay: '0s' },
      { left: '42%', top: '14%', delay: '0.8s' },
      { left: '68%', top: '22%', delay: '1.5s' },
      { left: '84%', top: '34%', delay: '0.4s' },
      { left: '26%', top: '44%', delay: '2.1s' },
      { left: '56%', top: '38%', delay: '1.2s' },
    ];
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {stars.map((s, idx) => (
          <span
            key={idx}
            className="absolute text-amber-100 drop-shadow-[0_0_6px_rgba(255,244,214,0.95)] text-xs animate-star-twinkle"
            style={{ left: s.left, top: s.top, animationDelay: s.delay }}
          >
            ✦
          </span>
        ))}
      </div>
    );
  }

  if (style === 'hearts') {
    const hearts = [
      { left: '18%', delay: '0s', dur: '5.8s' },
      { left: '48%', delay: '1.6s', dur: '6.4s' },
      { left: '76%', delay: '3.1s', dur: '5.5s' },
      { left: '32%', delay: '2.4s', dur: '6.9s' },
    ];
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {hearts.map((h, idx) => (
          <span
            key={idx}
            className="absolute bottom-2 text-rose-200/90 text-xs drop-shadow-[0_0_6px_rgba(251,113,133,0.75)] animate-mini-heart-rise"
            style={{
              left: h.left,
              animationDelay: h.delay,
              animationDuration: h.dur,
            }}
          >
            ♥
          </span>
        ))}
      </div>
    );
  }

  // fireflies
  const fireflies = [
    { left: '20%', top: '30%', delay: '0s' },
    { left: '52%', top: '24%', delay: '1.1s' },
    { left: '75%', top: '42%', delay: '2.2s' },
    { left: '36%', top: '62%', delay: '0.7s' },
    { left: '84%', top: '20%', delay: '1.7s' },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {fireflies.map((f, idx) => (
        <span
          key={idx}
          className="absolute w-2 h-2 rounded-full bg-amber-100/90 shadow-[0_0_10px_3px_rgba(254,240,138,0.85)] animate-firefly"
          style={{ left: f.left, top: f.top, animationDelay: f.delay }}
        />
      ))}
    </div>
  );
};

export const Page3OurLittleUniverse: React.FC<Page3OurLittleUniverseProps> = ({
  moments,
  lovedIds,
  onLoveMoment,
  onUpdateIllustration,
}) => {
  const [burstingId, setBurstingId] = useState<number | null>(null);
  const [modalMoment, setModalMoment] = useState<UniverseMomentItem | null>(null);

  const handleHeartTap = (moment: UniverseMomentItem, e: React.MouseEvent<HTMLButtonElement>) => {
    const alreadyLoved = lovedIds.includes(moment.id);
    onLoveMoment(moment.id);
    romanticAudio.playHeartPopSound();

    // Trigger floating-heart & sparkle burst right from this button
    setBurstingId(null);
    requestAnimationFrame(() => {
      setBurstingId(moment.id);
    });

    if (!alreadyLoved) {
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 18,
        spread: 50,
        startVelocity: 22,
        scalar: 0.75,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#E11D48', '#FB7185', '#FDA4AF', '#FDE68A'],
      });
    }
  };

  const allLoved = lovedIds.length >= moments.length;

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center px-3 sm:px-6 py-8 max-w-5xl mx-auto z-10">
      {/* Dreamy Ethereal Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <p className="text-xs sm:text-sm font-medium text-rose-500 tracking-wide mb-2">
          Just the two of us · Always and forever
        </p>
        <h2 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-bold text-rose-950 tracking-tight mb-3 text-balance">
          OUR LITTLE UNIVERSE ❤️
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
          Every quiet laugh, late-night talk, and gentle moment we share means the world to me. Tap the white heart next to each note to light it up in red.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-rose-700 font-medium tabular-nums">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>{lovedIds.length} of {moments.length} hearts lit</span>
          <span aria-hidden="true">·</span>
          <span>{allLoved ? 'Every moment cherished' : 'Tap each heart to continue'}</span>
        </div>
      </div>

      {/* 2-Column Responsive Dreamy Romantic Story Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 w-full mb-10">
        {moments.map((moment, idx) => {
          const isLoved = lovedIds.includes(moment.id);
          const isBursting = burstingId === moment.id;

          return (
            <article
              key={moment.id}
              className="group relative flex flex-col rounded-3xl overflow-hidden bg-gradient-to-b from-white/95 to-[#FFF8FA]/95 border border-rose-200/80 shadow-lg shadow-rose-200/30 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Animated Anime Couple Illustration Stage */}
              <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-rose-100">
                <img
                  src={moment.illustrationUrl}
                  alt={moment.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className={`w-full h-full object-cover object-center ${
                    idx % 2 === 0 ? 'animate-ken-burns-a' : 'animate-ken-burns-b'
                  }`}
                />

                {/* Soft Cinematic Light Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/60 via-rose-900/10 to-white/10 pointer-events-none" />

                {/* Subtle Animated Petals / Stars / Hearts / Fireflies Layer */}
                <AnimatedSceneOverlay style={moment.animationStyle} />

                {/* Quiet Top Actions: Enlarge & Optional Photo Upload */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalMoment(moment)}
                    aria-label={`View larger illustration for ${moment.title}`}
                    className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full bg-white/85 hover:bg-white text-rose-700 shadow-sm backdrop-blur-sm transition hover:scale-105 cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <PhotoUploadButton
                    storageKey={`photo_universe_${moment.id}`}
                    label="Change Photo"
                    compact={true}
                    onPhotoUploaded={(newUrl) => onUpdateIllustration?.(moment.id, newUrl)}
                  />
                </div>

                {/* Unboxed Caption Overlay along Bottom Scrim */}
                <div className="absolute bottom-3 left-4 right-4 text-left pointer-events-none">
                  <p className="text-[11px] sm:text-xs font-medium text-rose-100/95 tracking-wide">
                    0{moment.number} · {moment.theme}
                  </p>
                </div>
              </div>

              {/* Message + Independent Circular White-to-Red Heart Button */}
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4 flex-1 text-left">
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif-title text-lg sm:text-xl font-bold text-rose-950 leading-snug mb-2">
                    {moment.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal">
                    {moment.message}
                  </p>
                </div>

                {/* Interactive Circular Heart Button (>= 52x52 mobile touch target) */}
                <div className="relative shrink-0 pt-1">
                  {/* Floating Hearts & Sparkles Burst on Tap */}
                  {isBursting && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30" aria-hidden="true">
                      {BURST_PARTICLES.map((particle, pIdx) => (
                        <span
                          key={pIdx}
                          className="absolute text-sm animate-heart-burst"
                          style={
                            {
                              '--burst-x': particle.x,
                              '--burst-y': particle.y,
                              animationDelay: particle.delay,
                            } as React.CSSProperties
                          }
                        >
                          {particle.glyph}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleHeartTap(moment, e)}
                    aria-pressed={isLoved}
                    aria-label={
                      isLoved
                        ? `Loved: ${moment.title}`
                        : `Tap white heart to love: ${moment.title}`
                    }
                    data-testid={`universe-heart-${moment.id}`}
                    data-loved={isLoved ? 'true' : 'false'}
                    className={`relative w-13 h-13 min-w-[52px] min-h-[52px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 active:scale-90 ${
                      isLoved
                        ? 'bg-rose-50 border-2 border-rose-400 shadow-lg shadow-rose-300/60'
                        : 'bg-rose-300/90 hover:bg-rose-400 border-2 border-white shadow-md shadow-rose-200/70'
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 transition-all duration-300 ${
                        isLoved
                          ? 'fill-[#E11D48] text-[#E11D48] animate-heart-fill-pop drop-shadow-[0_2px_6px_rgba(225,29,72,0.45)]'
                          : 'fill-white text-white'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Completion Confirmation */}
      {allLoved && (
        <div className="px-6 py-4 bg-white/90 rounded-2xl border border-rose-200 shadow-sm text-center max-w-xl animate-in fade-in duration-300">
          <p className="text-sm sm:text-base text-rose-900 font-medium">
            Every single heart is glowing red ❤️ You really are my entire universe. Tap &ldquo;Continue ❤️&rdquo; below to open a special letter written just for you.
          </p>
        </div>
      )}

      {/* Fullscreen Artwork Modal */}
      {modalMoment && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalMoment(null)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalMoment(null)}
              aria-label="Close artwork preview"
              className="absolute top-3 right-3 z-30 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative w-full h-72 sm:h-96 bg-rose-100 overflow-hidden">
              <img
                src={modalMoment.illustrationUrl}
                alt={modalMoment.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center animate-ken-burns-a"
              />
              <AnimatedSceneOverlay style={modalMoment.animationStyle} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-5 right-5 text-left text-white">
                <p className="text-xs text-rose-200 font-medium mb-0.5">
                  0{modalMoment.number} · {modalMoment.theme}
                </p>
                <h3 className="font-serif-title text-xl font-bold">{modalMoment.title}</h3>
              </div>
            </div>

            <div className="p-6 text-left">
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                {modalMoment.message}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-rose-100 text-xs text-rose-700">
                <span>Our Little Universe ❤️</span>
                <PhotoUploadButton
                  storageKey={`photo_universe_${modalMoment.id}`}
                  label="Upload Photo"
                  onPhotoUploaded={(newUrl) => {
                    onUpdateIllustration?.(modalMoment.id, newUrl);
                    setModalMoment({ ...modalMoment, illustrationUrl: newUrl });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
