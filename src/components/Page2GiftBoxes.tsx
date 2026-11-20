import React, { useState } from 'react';
import { GiftBoxItem } from '../types/romantic.js';
import { Gift, Sparkles, Heart, ChevronRight, Check } from 'lucide-react';
import { romanticAudio } from '../utils/soundEffects.js';
import { PhotoUploadButton } from './PhotoUploadButton.js';
import confetti from 'canvas-confetti';

interface Page2GiftBoxesProps {
  giftBoxes: GiftBoxItem[];
  openedBoxes: number[];
  onOpenBox: (boxNumber: number) => void;
  onUpdatePhoto?: (boxNumber: number, photoUrl: string) => void;
}

export const Page2GiftBoxes: React.FC<Page2GiftBoxesProps> = ({
  giftBoxes,
  openedBoxes,
  onOpenBox,
  onUpdatePhoto,
}) => {
  const [currentBoxIndex, setCurrentBoxIndex] = useState(() => {
    if (openedBoxes.length === 0) return 1;
    return Math.min(openedBoxes.length + 1, 6);
  });

  const [isLidOpen, setIsLidOpen] = useState(() => openedBoxes.includes(currentBoxIndex));
  const activeBox = giftBoxes[currentBoxIndex - 1] || giftBoxes[0];
  const isCurrentlyOpened = openedBoxes.includes(currentBoxIndex);

  const handleOpenCurrentBox = () => {
    if (!isCurrentlyOpened) {
      onOpenBox(currentBoxIndex);
      setIsLidOpen(true);
      romanticAudio.playBoxOpenSound();

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#F43F5E', '#FB7185', '#FBCFE8', '#F59E0B']
      });
    } else {
      setIsLidOpen(!isLidOpen);
      romanticAudio.playHeartPopSound();
    }
  };

  const handleNextNested = () => {
    if (currentBoxIndex < 6) {
      const nextIdx = currentBoxIndex + 1;
      setCurrentBoxIndex(nextIdx);
      setIsLidOpen(openedBoxes.includes(nextIdx));
      romanticAudio.playHeartPopSound();
    }
  };

  const handleSelectBox = (boxNum: number) => {
    if (boxNum === 1 || openedBoxes.includes(boxNum - 1) || openedBoxes.includes(boxNum)) {
      setCurrentBoxIndex(boxNum);
      setIsLidOpen(openedBoxes.includes(boxNum));
      romanticAudio.playHeartPopSound();
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto text-center z-10">
      {/* Header */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-xs font-medium mb-3 backdrop-blur-sm shadow-sm animate-float-slow">
        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
        <span>Six Nested Layers of My Love</span>
      </div>

      <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-rose-950 mb-1">
        The Nested Gift Boxes
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 mb-6">
        Tap the box to open each layer, one by one, until you reach the final surprise inside ❤️
      </p>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {giftBoxes.map((box) => {
          const isOpened = openedBoxes.includes(box.boxNumber);
          const isCurrent = currentBoxIndex === box.boxNumber;
          return (
            <button
              key={box.boxNumber}
              onClick={() => handleSelectBox(box.boxNumber)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                isCurrent
                  ? 'bg-rose-500 text-white shadow-md scale-105'
                  : isOpened
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
              }`}
            >
              {isOpened ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : null}
              <span>Box {box.boxNumber}</span>
            </button>
          );
        })}
      </div>

      {/* Center 3D Interactive Nested Gift Box */}
      <div className="w-full bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xl shadow-rose-200/40 mb-6 flex flex-col items-center">
        <div
          onClick={handleOpenCurrentBox}
          className="relative group cursor-pointer w-48 h-48 sm:w-56 sm:h-56 mb-6 flex items-center justify-center perspective-[800px]"
          title="Tap to unwrap this box"
        >
          <div className="absolute inset-0 rounded-3xl bg-rose-300/30 blur-xl group-hover:bg-rose-400/40 transition-all duration-300" />

          {/* Box Body */}
          <div
            className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-500"
            style={{
              backgroundColor: activeBox.boxColor,
              border: `2px solid ${activeBox.ribbonColor}40`,
              transform: isLidOpen ? 'translateY(12px) scale(0.96)' : 'scale(1)'
            }}
          >
            <div
              className="absolute top-0 bottom-0 w-8 shadow-sm"
              style={{ backgroundColor: activeBox.ribbonColor }}
            />
            <div
              className="absolute left-0 right-0 h-8 shadow-sm"
              style={{ backgroundColor: activeBox.ribbonColor }}
            />

            {/* Box Lid */}
            <div
              className="absolute -top-3 left-0 right-0 h-10 rounded-xl shadow-md transition-all duration-700 ease-out flex items-center justify-center"
              style={{
                backgroundColor: activeBox.boxColor,
                border: `2px solid ${activeBox.ribbonColor}`,
                transformOrigin: 'top center',
                transform: isLidOpen
                  ? 'translateY(-45px) rotate(-18deg) scale(1.05)'
                  : 'translateY(0) rotate(0deg) scale(1)'
              }}
            >
              <div className="absolute -top-4 w-9 h-9 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-rose-600 drop-shadow-sm animate-bounce" />
              </div>
            </div>

            {/* Label inside */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="font-serif-title font-bold text-lg text-rose-950">
                Layer {currentBoxIndex}
              </span>
              <span className="text-[11px] font-medium text-rose-700 uppercase tracking-wider">
                {isCurrentlyOpened ? 'Unwrapped ❤️' : 'Tap to Open'}
              </span>
            </div>
          </div>
        </div>

        {/* Revealed Content: Photo + Message */}
        {isCurrentlyOpened ? (
          <div className="w-full bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-200/60">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <h3 className="font-serif-title font-bold text-rose-900 text-base sm:text-lg">
                  {activeBox.title}
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-800">
                Box {currentBoxIndex} of 6
              </span>
            </div>

            {/* Photo with Add Photo Button & Face Distortion Prevention */}
            <div className="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden mb-4 shadow-md border-2 border-white bg-rose-100 group/img">
              <img
                src={activeBox.photoUrl}
                alt={activeBox.title}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover/img:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-2.5 left-3 text-white text-xs font-medium drop-shadow">
                {currentBoxIndex === 6 ? '✨ Special Surprise Reveal ✨' : 'Memory & Promise'}
              </div>

              {/* Add / Change Photo Button */}
              <div className="absolute top-2.5 right-2.5 z-20">
                <PhotoUploadButton
                  storageKey={`photo_gift_box_${currentBoxIndex}`}
                  label="Add Photo"
                  onPhotoUploaded={(newUrl) => onUpdatePhoto?.(currentBoxIndex, newUrl)}
                />
              </div>
            </div>

            {/* Message */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic mb-4 font-normal">
              &ldquo;{activeBox.message}&rdquo;
            </p>

            {/* Next Nested Box Button */}
            {currentBoxIndex < 6 && (
              <div className="flex justify-end">
                <button
                  onClick={handleNextNested}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Open Next Nested Box</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentBoxIndex === 6 && (
              <div className="p-3 bg-rose-100/80 rounded-xl text-center border border-rose-300 text-xs sm:text-sm text-rose-900 font-medium">
                🎁 All six nested gift boxes opened! Tap &ldquo;Continue ❤️&rdquo; below to step into Our Little Universe ❤️
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-rose-600 italic">
            Tap the gift box above to unwrap this layer!
          </div>
        )}
      </div>
    </div>
  );
};
