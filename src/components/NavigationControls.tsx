import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface NavigationControlsProps {
  currentPage: number;
  totalPages: number;
  canContinue: boolean;
  onNext: () => void;
  onPrev: () => void;
  pageTitles?: string[];
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentPage,
  totalPages,
  canContinue,
  onNext,
  onPrev,
  pageTitles = [
    'Welcome & Magic Key',
    'Magical Anime Couple Gift Boxes',
    'Our Little Universe ❤️',
    'A Letter Just For You ❤️',
    'Birthday Cake & Teddy Wish'
  ]
}) => {
  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 px-4 pointer-events-none flex flex-col items-center justify-center">
      {/* Page Progress Indicator */}
      <div className="pointer-events-auto flex items-center gap-1.5 mb-2.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-rose-100 shadow-sm">
        {Array.from({ length: totalPages }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentPage;
          const isPassed = stepNum < currentPage;
          return (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-6 bg-rose-500'
                  : isPassed
                  ? 'w-2 bg-rose-300'
                  : 'w-1.5 bg-rose-100'
              }`}
              title={pageTitles[idx]}
            />
          );
        })}
        <span className="text-[11px] font-medium text-rose-800 ml-1.5">
          {currentPage} / {totalPages}
        </span>
      </div>

      {/* Main Buttons Container */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Previous page button (allows looking back anytime) */}
        {currentPage > 1 && (
          <button
            onClick={onPrev}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-white/90 hover:bg-white rounded-full border border-rose-200 shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}

        {/* The required "Continue ❤️" button - only unlocked when page requirements are fulfilled and not on the last page */}
        {canContinue && currentPage < totalPages && (
          <button
            onClick={onNext}
            className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white font-medium text-sm shadow-lg shadow-rose-300/60 hover:shadow-xl hover:shadow-rose-400/70 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse-glow"
            aria-label="Continue to next page"
          >
            <span>Continue</span>
            <span className="text-base group-hover:scale-125 transition-transform duration-200">❤️</span>
            <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* On the final page, offer replay from beginning */}
        {currentPage === totalPages && canContinue && (
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onPrev(); // or go back to start
            }}
            className="group relative flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-rose-700 font-medium text-xs border border-rose-200 shadow-md hover:bg-rose-50 hover:scale-105 transition-all cursor-pointer"
            aria-label="Revisit memories"
          >
            <span>Cherish Forever</span>
            <span>❤️</span>
          </button>
        )}
      </div>
    </div>
  );
};
