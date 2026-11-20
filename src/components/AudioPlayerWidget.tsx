import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX, Play, Pause, Upload, Sparkles, Cake } from 'lucide-react';
import { romanticAudio } from '../utils/soundEffects.js';

export const AudioPlayerWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [isOpen, setIsOpen] = useState(false);

  const [bgName, setBgName] = useState(romanticAudio.getBgTrackName());
  const [bdayName, setBdayName] = useState(romanticAudio.getBirthdayTrackName());

  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const bdayInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state on mount and intervals
  useEffect(() => {
    const checkState = () => {
      setIsPlaying(romanticAudio.getIsBgmPlaying() || romanticAudio.getIsBirthdayPlaying());
      setIsMuted(romanticAudio.getIsMuted());
      setVolume(romanticAudio.getMasterVolume());
      setBgName(romanticAudio.getBgTrackName());
      setBdayName(romanticAudio.getBirthdayTrackName());
    };
    const timer = setInterval(checkState, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTogglePlay = () => {
    const active = romanticAudio.toggleBgm();
    setIsPlaying(active);
  };

  const handleToggleMute = () => {
    const muted = romanticAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    romanticAudio.setMasterVolume(v);
  };

  const handleBgMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await romanticAudio.loadCustomBgAudio(file);
      setBgName(file.name.replace(/\.[^/.]+$/, ''));
      setIsPlaying(true);
    }
  };

  const handleBdayMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await romanticAudio.loadCustomBirthdayAudio(file);
      setBdayName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      {/* Main floating pill */}
      <div className="relative">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/90 backdrop-blur-md border border-rose-200/90 shadow-md">
          {/* Play / Pause BGM */}
          <button
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer"
            aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          {/* Quick Mute/Unmute */}
          <button
            onClick={handleToggleMute}
            className="w-7 h-7 rounded-full text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Expand Settings Dock */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-800 hover:text-rose-950 transition cursor-pointer"
            aria-label="Add music & audio settings"
          >
            <Music className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Add Music</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-rose-300'
              }`}
            />
          </button>
        </div>

        {/* Expanded Audio Uploads & Volume Dock */}
        {isOpen && (
          <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-white/95 backdrop-blur-xl border border-rose-200 p-4 shadow-xl shadow-rose-200/40 text-slate-800 animate-in fade-in zoom-in-95 duration-200 z-50">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                  Audio Soundtrack
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Volume Slider */}
            <div className="py-3 border-b border-rose-100 flex items-center gap-2.5">
              <button
                onClick={handleToggleMute}
                className="text-rose-600 hover:text-rose-800"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume slider"
                className="w-full h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="text-[11px] font-semibold text-rose-800 w-8 text-right">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            {/* Slot 1: Background Music */}
            <div className="py-3 border-b border-rose-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-900 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-rose-500" />
                  Background Music
                </span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  {isPlaying ? 'Playing softly' : 'Paused'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate" title={bgName}>
                🎵 {bgName}
              </p>

              <input
                type="file"
                ref={bgInputRef}
                accept="audio/mp3, audio/mpeg, audio/wav, audio/m4a, audio/*"
                className="hidden"
                onChange={handleBgMusicUpload}
              />
              <button
                onClick={() => bgInputRef.current?.click()}
                className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                Upload Background Music (MP3)
              </button>
            </div>

            {/* Slot 2: Happy Birthday Song */}
            <div className="pt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-900 flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5 text-rose-500" />
                  Happy Birthday Song
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                  Plays on cake blow
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate" title={bdayName}>
                🎂 {bdayName}
              </p>

              <input
                type="file"
                ref={bdayInputRef}
                accept="audio/mp3, audio/mpeg, audio/wav, audio/m4a, audio/*"
                className="hidden"
                onChange={handleBdayMusicUpload}
              />
              <button
                onClick={() => bdayInputRef.current?.click()}
                className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                Upload Happy Birthday Song (MP3)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
