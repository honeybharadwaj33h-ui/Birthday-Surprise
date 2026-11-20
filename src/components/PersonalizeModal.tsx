import React, { useState } from 'react';
import { SurpriseConfig } from '../types/romantic.js';
import { X, Save, RotateCcw, PenTool, Check } from 'lucide-react';
import { DEFAULT_SURPRISE_DATA, saveSurpriseData } from '../data/defaultSurpriseData.js';

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SurpriseConfig;
  onSave: (newConfig: SurpriseConfig) => void;
}

export const PersonalizeModal: React.FC<PersonalizeModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<SurpriseConfig>(config);
  const [activeTab, setActiveTab] = useState<'basics' | 'gifts' | 'polaroids' | 'letter' | 'wish'>('basics');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSurpriseData(formData);
    onSave(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    if (window.confirm("Reset all messages & photos back to romantic defaults?")) {
      setFormData(DEFAULT_SURPRISE_DATA);
      saveSurpriseData(DEFAULT_SURPRISE_DATA);
      onSave(DEFAULT_SURPRISE_DATA);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-rose-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-rose-950 text-base">
                Personalize Your Girlfriend&apos;s Surprise
              </h3>
              <p className="text-xs text-rose-700">
                Put your exact heartfelt words, photos, and secrets here
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-xs cursor-pointer"
            aria-label="Close customizer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-slate-200/80 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('basics')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
              activeTab === 'basics' ? 'bg-white shadow-xs text-rose-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Welcome & Question
          </button>
          <button
            onClick={() => setActiveTab('gifts')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
              activeTab === 'gifts' ? 'bg-white shadow-xs text-rose-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            6 Gift Boxes
          </button>
          <button
            onClick={() => setActiveTab('polaroids')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
              activeTab === 'polaroids' ? 'bg-white shadow-xs text-rose-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5 Polaroids
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
              activeTab === 'letter' ? 'bg-white shadow-xs text-rose-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Love Letter
          </button>
          <button
            onClick={() => setActiveTab('wish')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
              activeTab === 'wish' ? 'bg-white shadow-xs text-rose-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Final Birthday Wish
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-left text-sm">
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Girlfriend&apos;s Name / Nickname
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="e.g. My Princess, Emma, Honey"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Welcome Screen Message
                </label>
                <textarea
                  rows={3}
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Secret Magic Door Question
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  3 Answer Options (Select the Radio for Correct Answer)
                </label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctOptionIndex === idx}
                      onChange={() => setFormData({ ...formData, correctOptionIndex: idx })}
                      className="accent-rose-500 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const nextOptions = [...formData.options] as [string, string, string];
                        nextOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: nextOptions });
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gifts' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Customize titles, photo URLs, and messages for each of the 6 nested boxes.
              </p>
              {formData.giftBoxes.map((box, idx) => (
                <div key={box.id} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-2">
                  <span className="font-semibold text-xs text-rose-800">
                    Box {idx + 1} of 6 {idx === 5 ? '(Final Surprise)' : ''}
                  </span>
                  <input
                    type="text"
                    value={box.title}
                    onChange={(e) => {
                      const next = [...formData.giftBoxes];
                      next[idx].title = e.target.value;
                      setFormData({ ...formData, giftBoxes: next });
                    }}
                    placeholder="Box Title"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={box.photoUrl}
                    onChange={(e) => {
                      const next = [...formData.giftBoxes];
                      next[idx].photoUrl = e.target.value;
                      setFormData({ ...formData, giftBoxes: next });
                    }}
                    placeholder="Photo Image URL"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <textarea
                    rows={2}
                    value={box.message}
                    onChange={(e) => {
                      const next = [...formData.giftBoxes];
                      next[idx].message = e.target.value;
                      setFormData({ ...formData, giftBoxes: next });
                    }}
                    placeholder="Personal Love Message"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'polaroids' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Customize your 5 Polaroid photos, captions, and locations.
              </p>
              {formData.polaroids.map((pol, idx) => (
                <div key={pol.id} className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 space-y-2">
                  <span className="font-semibold text-xs text-amber-900">
                    Polaroid {idx + 1} of 5
                  </span>
                  <input
                    type="text"
                    value={pol.caption}
                    onChange={(e) => {
                      const next = [...formData.polaroids];
                      next[idx].caption = e.target.value;
                      setFormData({ ...formData, polaroids: next });
                    }}
                    placeholder="Caption"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={pol.dateOrLocation}
                    onChange={(e) => {
                      const next = [...formData.polaroids];
                      next[idx].dateOrLocation = e.target.value;
                      setFormData({ ...formData, polaroids: next });
                    }}
                    placeholder="Date / Location"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={pol.photoUrl}
                    onChange={(e) => {
                      const next = [...formData.polaroids];
                      next[idx].photoUrl = e.target.value;
                      setFormData({ ...formData, polaroids: next });
                    }}
                    placeholder="Photo URL"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'letter' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Envelope & Letter Title
                </label>
                <input
                  type="text"
                  value={formData.loveLetter.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loveLetter: { ...formData.loveLetter, title: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Salutation
                </label>
                <input
                  type="text"
                  value={formData.loveLetter.salutation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loveLetter: { ...formData.loveLetter, salutation: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Letter Body (Each line will become a romantic paragraph)
                </label>
                <textarea
                  rows={6}
                  value={formData.loveLetter.paragraphs.join('\n\n')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loveLetter: {
                        ...formData.loveLetter,
                        paragraphs: e.target.value.split('\n\n').filter(Boolean)
                      }
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Signature
                </label>
                <input
                  type="text"
                  value={formData.loveLetter.signature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loveLetter: { ...formData.loveLetter, signature: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'wish' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Celebration Title
                </label>
                <input
                  type="text"
                  value={formData.finalWish.celebrationTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalWish: { ...formData.finalWish, celebrationTitle: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Final Birthday Wish Message
                </label>
                <textarea
                  rows={4}
                  value={formData.finalWish.wishMessage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalWish: { ...formData.finalWish, wishMessage: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Footer Subtext
                </label>
                <input
                  type="text"
                  value={formData.finalWish.subtext}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalWish: { ...formData.finalWish, subtext: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-rose-100 bg-rose-50/50">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedNotice ? 'Saved!' : 'Save & Preview'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
