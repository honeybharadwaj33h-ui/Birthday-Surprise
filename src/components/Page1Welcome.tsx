import React, { useState } from 'react';
import { Sparkles, Heart, Key, Lock, CheckCircle2 } from 'lucide-react';
import { romanticAudio } from '../utils/soundEffects.js';
import confetti from 'canvas-confetti';

interface Page1WelcomeProps {
  recipientName: string;
  welcomeMessage: string;
  question: string;
  options: [string, string, string];
  correctOptionIndex: number;
  isUnlocked: boolean;
  onUnlock: () => void;
}

export const Page1Welcome: React.FC<Page1WelcomeProps> = ({
  recipientName,
  welcomeMessage,
  question,
  options,
  correctOptionIndex,
  isUnlocked,
  onUnlock,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(
    isUnlocked ? correctOptionIndex : null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpeningDoor, setIsOpeningDoor] = useState(isUnlocked);

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    romanticAudio.playHeartPopSound();

    if (idx === correctOptionIndex) {
      setErrorMessage(null);
      setIsOpeningDoor(true);
      romanticAudio.playDoorUnlockSound();

      // Confetti burst
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F472B6', '#FDA4AF', '#FCD34D']
      });

      setTimeout(() => {
        onUnlock();
      }, 900);
    } else {
      setErrorMessage(
        "A sweet memory, my love... but think of the one that holds my heart forever ❤️"
      );
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 max-w-2xl mx-auto text-center z-10">
      {/* Decorative Floating Sparkle Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-xs font-medium mb-4 backdrop-blur-sm shadow-sm animate-float-slow">
        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
        <span>A Magical World Created For You</span>
      </div>

      {/* Main Title */}
      <h1 className="font-script-romantic text-4xl sm:text-6xl md:text-7xl font-bold text-rose-600 mb-2 drop-shadow-sm tracking-wide">
        Happy Birthday, ❤️
      </h1>
      <h2 className="font-serif-title text-2xl sm:text-3xl text-rose-950 font-semibold mb-5">
        {recipientName}
      </h2>

      {/* Welcome Message */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 sm:p-7 border border-rose-200/80 shadow-lg shadow-rose-100/60 mb-8 text-slate-700 leading-relaxed text-sm sm:text-base font-normal">
        <p className="italic">{welcomeMessage}</p>
      </div>

      {/* The Animated Magical Door Container */}
      <div className="relative w-64 h-80 sm:w-72 sm:h-96 mx-auto mb-8 perspective-[1000px]">
        {/* Door Frame Arch */}
        <div className="absolute inset-0 rounded-t-full border-4 border-rose-300 bg-gradient-to-b from-rose-100/80 via-white/60 to-rose-50/80 shadow-2xl overflow-hidden flex items-center justify-center">
          {/* Inner Glowing Garden Portal (visible when doors open) */}
          <div className="absolute inset-0 bg-gradient-to-b from-pink-200 via-rose-100 to-amber-50 flex flex-col items-center justify-center p-4">
            <Sparkles className="w-10 h-10 text-amber-400 animate-spin mb-2" style={{ animationDuration: '8s' }} />
            <p className="font-script-romantic text-2xl text-rose-700 font-bold">
              Welcome to Your Wonderland
            </p>
            <p className="text-xs text-rose-600/80 mt-1">Tap Continue below to begin ❤️</p>
          </div>

          {/* Left Door Leaf */}
          <div
            className={`absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-br from-rose-300 via-rose-200 to-rose-300 border-r border-rose-300/60 origin-left transition-all duration-1000 ease-out shadow-lg flex items-center justify-end pr-2 ${
              isOpeningDoor ? '-rotate-y-105 opacity-25' : 'rotate-y-0 opacity-100'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-md border border-amber-200" />
          </div>

          {/* Right Door Leaf */}
          <div
            className={`absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-bl from-rose-300 via-rose-200 to-rose-300 border-l border-rose-300/60 origin-right transition-all duration-1000 ease-out shadow-lg flex items-center justify-start pl-2 ${
              isOpeningDoor ? 'rotate-y-105 opacity-25' : 'rotate-y-0 opacity-100'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-md border border-amber-200" />
          </div>

          {/* Central Heart Lock/Key Badge */}
          {!isOpeningDoor && (
            <div className="relative z-10 w-14 h-14 rounded-full bg-white/95 border-2 border-rose-300 shadow-md flex items-center justify-center text-rose-500 animate-pulse">
              <Lock className="w-6 h-6" />
            </div>
          )}

          {isOpeningDoor && (
            <div className="absolute z-20 top-4 right-4 text-emerald-600 bg-white/90 rounded-full p-1.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* Romantic Question & Answers Section */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-rose-200 shadow-md text-left">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-rose-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-900">
            The Magic Key Question
          </h3>
        </div>

        <p className="font-serif-title text-base sm:text-lg font-medium text-slate-800 mb-4">
          {question}
        </p>

        {/* 3 Answer Options */}
        <div className="space-y-2.5">
          {options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isThisCorrect = idx === correctOptionIndex;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                  isSelected && isThisCorrect
                    ? 'bg-rose-500 text-white shadow-md border-rose-500'
                    : isSelected && !isThisCorrect
                    ? 'bg-rose-50 text-rose-800 border-2 border-rose-300'
                    : 'bg-white hover:bg-rose-50/70 text-slate-700 border border-rose-100 hover:border-rose-200 shadow-xs'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected && isThisCorrect
                      ? 'bg-white text-rose-600'
                      : isSelected
                      ? 'bg-rose-200 text-rose-700'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 leading-snug">{option}</span>
                {isSelected && isThisCorrect && (
                  <Heart className="w-4 h-4 flex-shrink-0 fill-white text-white animate-bounce" />
                )}
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-600 mt-3 italic animate-shake">
            {errorMessage}
          </p>
        )}

        {isUnlocked && (
          <p className="text-xs font-medium text-emerald-700 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            The door is unlocked, my love! Tap &ldquo;Continue ❤️&rdquo; below to enter.
          </p>
        )}
      </div>
    </div>
  );
};
