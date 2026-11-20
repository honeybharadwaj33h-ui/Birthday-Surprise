/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
import { FloatingDecorations } from './components/FloatingDecorations.js';
import { AudioPlayerWidget } from './components/AudioPlayerWidget.js';
import { NavigationControls } from './components/NavigationControls.js';
import { CinematicLampIntro } from './components/CinematicLampIntro.js';
import { EditModeModal } from './components/EditModeModal.js';
import { Page1Welcome } from './components/Page1Welcome.js';
import { Page2GiftBoxes } from './components/Page2GiftBoxes.js';
import { Page3OurLittleUniverse } from './components/Page3OurLittleUniverse.js';
import { Page6LoveLetter } from './components/Page6LoveLetter.js';
import { Page7BirthdayCake } from './components/Page7BirthdayCake.js';
import {
  DEFAULT_SURPRISE_DATA,
  loadSurpriseData,
  saveSurpriseData,
} from './data/defaultSurpriseData.js';
import { PageProgressState, SurpriseConfig } from './types/romantic.js';
import { canAdvancePage, selectUniverseHeart } from './utils/romanticLogic.js';
import { romanticAudio } from './utils/soundEffects.js';
import { getAllCustomPhotos, saveMediaItem } from './utils/mediaStorage.js';
import {
  applyCustomPhotosToConfig,
  stripDataUrlsForLocalStorage,
} from './utils/editPersistence.js';

export default function App() {
  const [config, setConfig] = useState<SurpriseConfig>(() => loadSurpriseData());
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const urlParams = new URLSearchParams(window.location.search);
  const initialPage = parseInt(urlParams.get('page') || '1', 10);
  const isAutoStart = urlParams.get('autostart') === '1';

  // Cinematic lamp opening shows on normal entry before Page 1; ?autostart=1 or direct ?page>1 bypasses it
  const [showLampIntro, setShowLampIntro] = useState<boolean>(
    !isAutoStart && initialPage === 1
  );

  const [currentPage, setCurrentPage] = useState<number>(
    initialPage >= 1 && initialPage <= 5 ? initialPage : 1
  );

  const [progress, setProgress] = useState<PageProgressState>({
    page1Unlocked: isAutoStart || initialPage > 1,
    openedBoxes: isAutoStart ? [1, 2, 3, 4, 5, 6] : [],
    viewedPolaroids: [],
    lovedUniverseIds: isAutoStart && initialPage > 3 ? [1, 2, 3, 4, 5, 6] : [],
    viewedTimelineSteps: [],
    letterOpened: isAutoStart || initialPage > 4,
    candlesBlown: false,
  });

  // Restore any persistent custom photos/art from IndexedDB on startup
  useEffect(() => {
    getAllCustomPhotos().then((photos) => {
      if (Object.keys(photos).length > 0) {
        setConfig((prev) => applyCustomPhotosToConfig(prev, photos));
      }
    });
  }, []);

  // Save edited text and newly uploaded pictures persistently (IndexedDB + localStorage)
  const handleSaveEdit = async (
    updatedConfig: SurpriseConfig,
    uploadedMedia: Record<string, string>
  ) => {
    const entries = Object.entries(uploadedMedia);
    for (const [key, dataUrl] of entries) {
      await saveMediaItem(key, dataUrl);
    }

    const storageSafeConfig = stripDataUrlsForLocalStorage(
      updatedConfig,
      DEFAULT_SURPRISE_DATA
    );
    saveSurpriseData(storageSafeConfig);
    setConfig(updatedConfig);
    setIsEditOpen(false);
    romanticAudio.playHeartPopSound();
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2500);
  };

  // Softly start background music on first user touch after the lamp intro finishes
  useEffect(() => {
    if (showLampIntro) return;
    const handleFirstTouch = () => {
      romanticAudio.startBackgroundMusic();
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('touchstart', handleFirstTouch, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
  }, [showLampIntro]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Page 1 Handlers
  const handlePage1Unlock = () => {
    setProgress((prev) => ({ ...prev, page1Unlocked: true }));
  };

  // Page 2 Handlers
  const handleOpenBox = (boxNumber: number) => {
    setProgress((prev) => {
      if (prev.openedBoxes.includes(boxNumber)) return prev;
      return { ...prev, openedBoxes: [...prev.openedBoxes, boxNumber] };
    });
  };

  const handleUpdateBoxPhoto = (boxNumber: number, newPhotoUrl: string) => {
    setConfig((prev) => ({
      ...prev,
      giftBoxes: prev.giftBoxes.map((b) =>
        b.boxNumber === boxNumber ? { ...b, photoUrl: newPhotoUrl } : b
      ),
    }));
  };

  // Page 3 (Our Little Universe ❤️) Handlers
  const handleLoveUniverseMoment = (id: number) => {
    setProgress((prev) => ({
      ...prev,
      lovedUniverseIds: selectUniverseHeart(id, prev.lovedUniverseIds),
    }));
  };

  const handleUpdateUniverseIllustration = (id: number, newUrl: string) => {
    setConfig((prev) => ({
      ...prev,
      universeMoments: prev.universeMoments.map((m) =>
        m.id === id ? { ...m, illustrationUrl: newUrl } : m
      ),
    }));
  };

  // Page 4 (Love Letter) Handlers
  const handleOpenLetter = () => {
    setProgress((prev) => ({ ...prev, letterOpened: true }));
  };

  // Page 5 (Birthday Cake & Realistic Plush Teddy) Handlers
  const handleBlowCandles = () => {
    setProgress((prev) => ({ ...prev, candlesBlown: true }));
  };

  // Navigation Logic
  const canContinue = canAdvancePage(currentPage, progress);

  const handleNextPage = () => {
    if (currentPage < 5 && canContinue) {
      setCurrentPage((prev) => prev + 1);
      romanticAudio.playHeartPopSound();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      romanticAudio.playHeartPopSound();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#FFF5F7] via-[#FFF0F5] to-[#FDF2F8] text-[#4A3E3D] pb-36 sm:pb-44 overflow-x-hidden">
      {/* Cinematic Dark-Room Standing Floor Lamp Opening Experience */}
      {showLampIntro && (
        <CinematicLampIntro onRevealComplete={() => setShowLampIntro(false)} />
      )}

      {/* Background Floating Hearts, Petals, and Sparkles */}
      <FloatingDecorations />

      {/* Top Left: Small Pencil Edit Icon Button */}
      {!showLampIntro && (
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          aria-label="Edit website content"
          title="Edit website content"
          className="fixed top-4 left-4 z-40 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/85 backdrop-blur-md border border-rose-200/90 text-rose-500 hover:text-rose-600 hover:bg-white hover:scale-105 active:scale-95 shadow-md shadow-rose-200/40 flex items-center justify-center transition cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {/* Subtle Saved Confirmation Toast */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-16 z-40 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-md animate-in fade-in slide-in-from-left-2 duration-200"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Changes saved</span>
        </div>
      )}

      {/* Top Right: Music Player Widget with Dual MP3 Uploads & Soft Loop */}
      {!showLampIntro && <AudioPlayerWidget />}

      {/* Simple Edit Mode Modal */}
      {isEditOpen && (
        <EditModeModal
          config={config}
          initialTab={currentPage}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditOpen(false)}
        />
      )}

      {/* Main Pages Content Switcher */}
      <main className="relative z-10 w-full pt-8 sm:pt-12 px-3 sm:px-6">
        {currentPage === 1 && (
          <Page1Welcome
            recipientName={config.recipientName}
            welcomeMessage={config.welcomeMessage}
            question={config.question}
            options={config.options}
            correctOptionIndex={config.correctOptionIndex}
            isUnlocked={progress.page1Unlocked}
            onUnlock={handlePage1Unlock}
          />
        )}

        {currentPage === 2 && (
          <Page2GiftBoxes
            giftBoxes={config.giftBoxes}
            openedBoxes={progress.openedBoxes}
            onOpenBox={handleOpenBox}
            onUpdatePhoto={handleUpdateBoxPhoto}
          />
        )}

        {currentPage === 3 && (
          <Page3OurLittleUniverse
            moments={config.universeMoments}
            lovedIds={progress.lovedUniverseIds}
            onLoveMoment={handleLoveUniverseMoment}
            onUpdateIllustration={handleUpdateUniverseIllustration}
          />
        )}

        {currentPage === 4 && (
          <Page6LoveLetter
            loveLetter={config.loveLetter}
            isOpened={progress.letterOpened}
            onOpenLetter={handleOpenLetter}
          />
        )}

        {currentPage === 5 && (
          <Page7BirthdayCake
            recipientName={config.recipientName}
            finalWish={config.finalWish}
            candlesBlown={progress.candlesBlown}
            onBlowCandles={handleBlowCandles}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation: The Manual Continue ❤️ Button Rule */}
      {!showLampIntro && (
        <NavigationControls
          currentPage={currentPage}
          totalPages={5}
          canContinue={canContinue}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
        />
      )}
    </div>
  );
}
