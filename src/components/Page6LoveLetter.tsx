import React, { useState } from 'react';
import { LoveLetterData } from '../types/romantic.js';
import { Sparkles, Heart } from 'lucide-react';
import { romanticAudio } from '../utils/soundEffects.js';
import confetti from 'canvas-confetti';

interface Page6LoveLetterProps {
  loveLetter: LoveLetterData;
  isOpened: boolean;
  onOpenLetter: () => void;
}

export const Page6LoveLetter: React.FC<Page6LoveLetterProps> = ({
  loveLetter,
  isOpened,
  onOpenLetter,
}) => {
  const [isOpen, setIsOpen] = useState(isOpened);

  const handleOpenEnvelope = () => {
    if (!isOpen) {
      setIsOpen(true);
      onOpenLetter();
      romanticAudio.playWaxSealSound();

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#E11D48', '#FB7185', '#FCD34D']
      });
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto text-center z-10">
      {/* Badge Header */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-xs font-medium mb-3 backdrop-blur-sm shadow-sm animate-float-slow">
        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
        <span>From the Depths of My Soul</span>
      </div>

      <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-rose-950 mb-2">
        {loveLetter.title}
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 mb-8">
        {isOpen
          ? 'Read every word slowly... it was written only for you ❤️'
          : 'Tap the wax seal to break the seal and unfold your love letter ❤️'}
      </p>

      {/* The Animated Envelope Container */}
      {!isOpen ? (
        <div
          onClick={handleOpenEnvelope}
          className="group relative cursor-pointer w-72 sm:w-80 h-48 sm:h-52 bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200 rounded-2xl shadow-2xl border border-rose-300 flex items-center justify-center transition-all duration-300 hover:scale-105 perspective-[1000px]"
        >
          {/* Envelope Flap Triangles */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            {/* Top Flap */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-rose-200 to-rose-300 shadow-sm clip-path-triangle origin-top transition-transform" />
            {/* Bottom Pocket */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-rose-100/90 border-t border-rose-200/60" />
          </div>

          {/* Crimson Wax Seal in Center */}
          <div className="relative z-20 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-700 via-rose-600 to-red-800 border-2 border-rose-300 shadow-xl flex items-center justify-center text-amber-200 group-hover:scale-110 transition-transform animate-pulse-glow">
              <Heart className="w-8 h-8 fill-amber-200 text-amber-200" />
            </div>
            <span className="mt-3 text-xs font-semibold text-rose-900 tracking-wider uppercase bg-white/80 px-2.5 py-0.5 rounded-full shadow-xs">
              Tap Wax Seal to Open
            </span>
          </div>
        </div>
      ) : (
        /* The Unfolded Parchment Love Letter */
        <div className="w-full bg-[#FFFDF7] rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-rose-200/80 text-left relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          {/* Decorative Corner Filigree / Watermark */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-rose-100/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-rose-100/50 rounded-full blur-2xl pointer-events-none" />

          {/* Header Row: Date & Small Heart */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-rose-200/60">
            <span className="font-handwritten text-lg text-rose-700 font-semibold">
              {loveLetter.date}
            </span>
            <Heart className="w-5 h-5 text-rose-400 fill-rose-300" />
          </div>

          {/* Salutation */}
          <h3 className="font-script-romantic text-2xl sm:text-3xl font-bold text-rose-900 mb-4">
            {loveLetter.salutation}
          </h3>

          {/* Letter Body Paragraphs */}
          <div className="space-y-4 font-serif-title text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
            {loveLetter.paragraphs.map((p, idx) => (
              <p key={idx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-rose-700">
                {p}
              </p>
            ))}
          </div>

          {/* Signoff & Signature */}
          <div className="mt-8 pt-4 border-t border-rose-200/60 text-right">
            <p className="font-script-romantic text-2xl sm:text-3xl text-rose-800 font-bold">
              {loveLetter.signature}
            </p>
          </div>

          {/* Postscript */}
          {loveLetter.postscript && (
            <div className="mt-6 p-3.5 bg-rose-50/80 rounded-xl border border-rose-200/70 text-xs sm:text-sm text-rose-900 italic font-handwritten text-base leading-snug">
              {loveLetter.postscript}
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div className="mt-6 text-xs text-rose-700 bg-rose-50/80 px-4 py-2 rounded-full border border-rose-200">
          🎂 Now for your grand birthday cake! Tap &ldquo;Continue ❤️&rdquo; below!
        </div>
      )}
    </div>
  );
};
