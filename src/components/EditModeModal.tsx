import React, { useState, useRef } from 'react';
import { SurpriseConfig } from '../types/romantic.js';
import { X, Save, Upload, Check, Gift, Heart, Mail, Cake, Sparkles } from 'lucide-react';
import { fileToDataUrl } from '../utils/mediaStorage.js';
import { formatLetterParagraphs, parseLetterParagraphs } from '../utils/editPersistence.js';

interface EditModeModalProps {
  config: SurpriseConfig;
  initialTab?: number; // 1..5 matching currentPage
  onSave: (updatedConfig: SurpriseConfig, uploadedMedia: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}

type EditTab = 'welcome' | 'gifts' | 'universe' | 'letter' | 'wish';

const PAGE_TO_TAB: Record<number, EditTab> = {
  1: 'welcome',
  2: 'gifts',
  3: 'universe',
  4: 'letter',
  5: 'wish',
};

const TABS: { id: EditTab; label: string; icon: React.ReactNode }[] = [
  { id: 'welcome', label: 'Welcome', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'gifts', label: 'Gift Boxes', icon: <Gift className="w-3.5 h-3.5" /> },
  { id: 'universe', label: 'Our Universe', icon: <Heart className="w-3.5 h-3.5" /> },
  { id: 'letter', label: 'Love Letter', icon: <Mail className="w-3.5 h-3.5" /> },
  { id: 'wish', label: 'Birthday Wish', icon: <Cake className="w-3.5 h-3.5" /> },
];

export const EditModeModal: React.FC<EditModeModalProps> = ({
  config,
  initialTab = 1,
  onSave,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<EditTab>(PAGE_TO_TAB[initialTab] || 'welcome');
  const [draft, setDraft] = useState<SurpriseConfig>(() => structuredClone(config));
  const [letterBodyText, setLetterBodyText] = useState<string>(() =>
    formatLetterParagraphs(config.loveLetter.paragraphs)
  );
  const [pendingMedia, setPendingMedia] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleImagePick = async (
    storageKey: string,
    file: File | undefined,
    applyToDraft: (dataUrl: string) => void
  ) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      applyToDraft(dataUrl);
      setPendingMedia((prev) => ({ ...prev, [storageKey]: dataUrl }));
    } catch (err) {
      console.error('Failed to read selected picture', err);
    }
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      const finalConfig: SurpriseConfig = {
        ...draft,
        loveLetter: {
          ...draft.loveLetter,
          paragraphs: parseLetterParagraphs(letterBodyText),
        },
      };
      await onSave(finalConfig, pendingMedia);
    } finally {
      setIsSaving(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    setDraft((prev) => {
      const nextOptions = [...prev.options] as [string, string, string];
      nextOptions[index] = value;
      return { ...prev, options: nextOptions };
    });
  };

  const updateGiftBox = (id: number, patch: Partial<SurpriseConfig['giftBoxes'][number]>) => {
    setDraft((prev) => ({
      ...prev,
      giftBoxes: prev.giftBoxes.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  };

  const updateUniverseMoment = (
    id: number,
    patch: Partial<SurpriseConfig['universeMoments'][number]>
  ) => {
    setDraft((prev) => ({
      ...prev,
      universeMoments: prev.universeMoments.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Website Content"
      className="fixed inset-0 z-50 bg-rose-950/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] bg-[#FFFDFB] rounded-3xl border border-rose-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-rose-100 bg-white">
          <div className="text-left">
            <h2 className="font-serif-title text-lg sm:text-xl font-bold text-rose-950">
              Edit Your Surprise Website
            </h2>
            <p className="text-xs text-slate-500">
              Change any message, wish, love letter, or picture below and tap Save.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close edit mode"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simple Page Section Tabs */}
        <div
          role="tablist"
          aria-label="Website sections"
          className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-rose-50/70 border-b border-rose-100 overflow-x-auto"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-white/80 text-rose-800 hover:bg-white border border-rose-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5 text-left">
          {/* TAB 1: WELCOME PAGE */}
          {activeTab === 'welcome' && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-recipient-name"
                  className="block text-xs font-semibold text-rose-900 mb-1.5"
                >
                  Girlfriend&apos;s Name / Pet Name
                </label>
                <input
                  id="edit-recipient-name"
                  type="text"
                  value={draft.recipientName}
                  onChange={(e) => setDraft({ ...draft, recipientName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-welcome-message"
                  className="block text-xs font-semibold text-rose-900 mb-1.5"
                >
                  Welcome Message
                </label>
                <textarea
                  id="edit-welcome-message"
                  rows={4}
                  value={draft.welcomeMessage}
                  onChange={(e) => setDraft({ ...draft, welcomeMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-magic-question"
                  className="block text-xs font-semibold text-rose-900 mb-1.5"
                >
                  Magic Door Secret Question
                </label>
                <input
                  id="edit-magic-question"
                  type="text"
                  value={draft.question}
                  onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="space-y-2.5">
                <span className="block text-xs font-semibold text-rose-900">
                  Answer Options (select which one unlocks the door)
                </span>
                {draft.options.map((opt, idx) => {
                  const isCorrect = draft.correctOptionIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-rose-100"
                    >
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, correctOptionIndex: idx })}
                        aria-label={`Set option ${String.fromCharCode(65 + idx)} as correct answer`}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {isCorrect ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{String.fromCharCode(65 + idx)}</span>
                        )}
                      </button>
                      <input
                        type="text"
                        aria-label={`Answer option ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-rose-50/40 border border-rose-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GIFT BOXES */}
          {activeTab === 'gifts' && (
            <div className="space-y-4">
              {draft.giftBoxes.map((box) => {
                const storageKey = `photo_gift_box_${box.boxNumber}`;
                return (
                  <div
                    key={box.id}
                    className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Picture Preview + Upload Button */}
                      <div className="w-full sm:w-40 shrink-0 space-y-2">
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-rose-100 border border-rose-200">
                          <img
                            src={box.photoUrl}
                            alt={box.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/webp"
                          data-testid={`edit-upload-box-${box.boxNumber}`}
                          ref={(el) => {
                            fileInputRefs.current[storageKey] = el;
                          }}
                          className="hidden"
                          onChange={(e) =>
                            handleImagePick(storageKey, e.target.files?.[0], (url) =>
                              updateGiftBox(box.id, { photoUrl: url })
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[storageKey]?.click()}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Picture</span>
                        </button>
                      </div>

                      {/* Box Title & Message */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <label
                            htmlFor={`edit-box-title-${box.boxNumber}`}
                            className="block text-xs font-semibold text-rose-900 mb-1"
                          >
                            Gift Box {box.boxNumber} Title / Caption
                          </label>
                          <input
                            id={`edit-box-title-${box.boxNumber}`}
                            type="text"
                            value={box.title}
                            onChange={(e) => updateGiftBox(box.id, { title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-rose-50/30 border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-box-msg-${box.boxNumber}`}
                            className="block text-xs font-semibold text-rose-900 mb-1"
                          >
                            Romantic Message
                          </label>
                          <textarea
                            id={`edit-box-msg-${box.boxNumber}`}
                            rows={3}
                            value={box.message}
                            onChange={(e) => updateGiftBox(box.id, { message: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-rose-50/30 border border-rose-200 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: OUR LITTLE UNIVERSE */}
          {activeTab === 'universe' && (
            <div className="space-y-4">
              {draft.universeMoments.map((moment) => {
                const storageKey = `photo_universe_${moment.id}`;
                return (
                  <div
                    key={moment.id}
                    className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Picture Preview + Upload */}
                      <div className="w-full sm:w-40 shrink-0 space-y-2">
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-rose-100 border border-rose-200">
                          <img
                            src={moment.illustrationUrl}
                            alt={moment.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/webp"
                          data-testid={`edit-upload-universe-${moment.id}`}
                          ref={(el) => {
                            fileInputRefs.current[storageKey] = el;
                          }}
                          className="hidden"
                          onChange={(e) =>
                            handleImagePick(storageKey, e.target.files?.[0], (url) =>
                              updateUniverseMoment(moment.id, { illustrationUrl: url })
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[storageKey]?.click()}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Picture</span>
                        </button>
                      </div>

                      {/* Theme Caption, Title & Message */}
                      <div className="flex-1 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label
                              htmlFor={`edit-uni-theme-${moment.id}`}
                              className="block text-xs font-semibold text-rose-900 mb-1"
                            >
                              Card {moment.number} Small Caption
                            </label>
                            <input
                              id={`edit-uni-theme-${moment.id}`}
                              type="text"
                              value={moment.theme}
                              onChange={(e) =>
                                updateUniverseMoment(moment.id, { theme: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-rose-50/30 border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`edit-uni-title-${moment.id}`}
                              className="block text-xs font-semibold text-rose-900 mb-1"
                            >
                              Heading
                            </label>
                            <input
                              id={`edit-uni-title-${moment.id}`}
                              type="text"
                              value={moment.title}
                              onChange={(e) =>
                                updateUniverseMoment(moment.id, { title: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-rose-50/30 border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-uni-msg-${moment.id}`}
                            className="block text-xs font-semibold text-rose-900 mb-1"
                          >
                            Romantic Message
                          </label>
                          <textarea
                            id={`edit-uni-msg-${moment.id}`}
                            rows={3}
                            value={moment.message}
                            onChange={(e) =>
                              updateUniverseMoment(moment.id, { message: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-rose-50/30 border border-rose-200 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: LOVE LETTER */}
          {activeTab === 'letter' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="edit-letter-title"
                    className="block text-xs font-semibold text-rose-900 mb-1.5"
                  >
                    Letter Page Heading
                  </label>
                  <input
                    id="edit-letter-title"
                    type="text"
                    value={draft.loveLetter.title}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        loveLetter: { ...draft.loveLetter, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-letter-date"
                    className="block text-xs font-semibold text-rose-900 mb-1.5"
                  >
                    Date / Top Caption
                  </label>
                  <input
                    id="edit-letter-date"
                    type="text"
                    value={draft.loveLetter.date}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        loveLetter: { ...draft.loveLetter, date: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-letter-salutation"
                  className="block text-xs font-semibold text-rose-900 mb-1.5"
                >
                  Opening Greeting
                </label>
                <input
                  id="edit-letter-salutation"
                  type="text"
                  value={draft.loveLetter.salutation}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      loveLetter: { ...draft.loveLetter, salutation: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-letter-body"
                  className="block text-xs font-semibold text-rose-900 mb-1.5"
                >
                  Your Love Letter (leave a blank line between paragraphs)
                </label>
                <textarea
                  id="edit-letter-body"
                  rows={8}
                  value={letterBodyText}
                  onChange={(e) => setLetterBodyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="edit-letter-signature"
                    className="block text-xs font-semibold text-rose-900 mb-1.5"
                  >
                    Signature
                  </label>
                  <input
                    id="edit-letter-signature"
                    type="text"
                    value={draft.loveLetter.signature}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        loveLetter: { ...draft.loveLetter, signature: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-letter-ps"
                    className="block text-xs font-semibold text-rose-900 mb-1.5"
                  >
                    Postscript (P.S.)
                  </label>
                  <input
                    id="edit-letter-ps"
                    type="text"
                    value={draft.loveLetter.postscript}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        loveLetter: { ...draft.loveLetter, postscript: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FINAL BIRTHDAY WISH */}
          {activeTab === 'wish' && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-wish-title"
                  className="block text-xs font-semibold text-rose-900 mb-1.5"
                >
                  Celebration Headline
                </label>
                <input
                  id="edit-wish-title"
                  type="text"
                  value={draft.finalWish.celebrationTitle}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      finalWish: { ...draft.finalWish, celebrationTitle: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-wish-message"
                  className="block text-xs font-semibold text-rose-900 mb-1.5"
                >
                  Final Birthday Wish
                </label>
                <textarea
                  id="edit-wish-message"
                  rows={5}
                  value={draft.finalWish.wishMessage}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      finalWish: { ...draft.finalWish, wishMessage: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-wish-subtext"
                  className="block text-xs font-semibold text-rose-900 mb-1.5"
                >
                  Closing Line
                </label>
                <input
                  id="edit-wish-subtext"
                  type="text"
                  value={draft.finalWish.subtext}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      finalWish: { ...draft.finalWish, subtext: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer: Simple Cancel & Save Buttons */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-rose-100 bg-white">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-300/60 transition cursor-pointer disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
