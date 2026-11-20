/**
 * Romantic Audio Engine with 2-track system:
 * 1. Background Music (continuous, soft loop across all pages)
 * 2. Happy Birthday Song (plays on Page 7 when candles are blown, with seamless fadeout of BGM and zero overlap)
 * Supports custom uploaded MP3 files + built-in fallback Web Audio synthesizers.
 */

import { getMediaItem, saveMediaItem } from './mediaStorage.js';

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isBgmPlaying = false;
  private isBirthdayPlaying = false;
  private masterVolume = 0.45;
  private isMuted = false;

  private bgAudioEl: HTMLAudioElement | null = null;
  private birthdayAudioEl: HTMLAudioElement | null = null;

  private bgSynthInterval: any = null;
  private birthdaySynthInterval: any = null;

  private bgTrackName: string = 'Romantic Music Box Melody';
  private birthdayTrackName: string = 'Celebration Birthday Waltz';

  constructor() {
    this.initAudioElements();
    this.restoreStoredAudio();
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private initAudioElements() {
    if (typeof window === 'undefined') return;
    if (!this.bgAudioEl) {
      this.bgAudioEl = new Audio();
      this.bgAudioEl.loop = true;
      this.bgAudioEl.volume = this.masterVolume;
    }
    if (!this.birthdayAudioEl) {
      this.birthdayAudioEl = new Audio();
      this.birthdayAudioEl.loop = false;
      this.birthdayAudioEl.volume = this.masterVolume;
    }
  }

  private async restoreStoredAudio() {
    try {
      const savedBg = await getMediaItem('audio_bg_music');
      if (savedBg && this.bgAudioEl) {
        const url = savedBg instanceof Blob ? URL.createObjectURL(savedBg) : savedBg;
        this.bgAudioEl.src = url;
        const name = await getMediaItem('audio_bg_name');
        if (typeof name === 'string') this.bgTrackName = name;
      }

      const savedBday = await getMediaItem('audio_birthday_music');
      if (savedBday && this.birthdayAudioEl) {
        const url = savedBday instanceof Blob ? URL.createObjectURL(savedBday) : savedBday;
        this.birthdayAudioEl.src = url;
        const name = await getMediaItem('audio_birthday_name');
        if (typeof name === 'string') this.birthdayTrackName = name;
      }
    } catch (e) {
      console.warn('Audio restore error', e);
    }
  }

  // --- Synth Note Generator ---
  playNote(frequency: number, duration: number = 0.8, delay: number = 0, type: OscillatorType = 'sine', gainMultiplier: number = 1) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startTime);

      const targetGain = this.masterVolume * 0.25 * gainMultiplier;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(targetGain, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    } catch {}
  }

  // --- Background Music Control ---
  startBackgroundMusic() {
    this.initCtx();
    this.initAudioElements();

    if (this.isBgmPlaying) return;

    if (this.bgAudioEl && this.bgAudioEl.src && this.bgAudioEl.src !== window.location.href) {
      this.bgAudioEl.volume = this.isMuted ? 0 : this.masterVolume;
      this.bgAudioEl.play().then(() => {
        this.isBgmPlaying = true;
      }).catch(() => {
        this.startBgSynth();
      });
    } else {
      this.startBgSynth();
    }
  }

  private startBgSynth() {
    if (this.bgSynthInterval) return;
    this.isBgmPlaying = true;

    const notes: Record<string, number> = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
    };

    // Soft dreamy romantic arpeggios
    const sequence = [
      { note: 'C4', dur: 0.8, gap: 0.6 },
      { note: 'E4', dur: 0.8, gap: 0.6 },
      { note: 'G4', dur: 0.8, gap: 0.6 },
      { note: 'C5', dur: 1.2, gap: 0.9 },
      { note: 'B4', dur: 0.8, gap: 0.6 },
      { note: 'G4', dur: 0.8, gap: 0.6 },
      { note: 'A4', dur: 1.2, gap: 0.9 },
      { note: 'F4', dur: 0.8, gap: 0.6 },
      { note: 'D4', dur: 0.8, gap: 0.6 },
      { note: 'E4', dur: 1.4, gap: 1.1 }
    ];

    let step = 0;
    const play = () => {
      if (!this.isBgmPlaying) return;
      const item = sequence[step];
      if (notes[item.note]) {
        this.playNote(notes[item.note], item.dur, 0, 'sine', 0.8);
      }
      step = (step + 1) % sequence.length;
      this.bgSynthInterval = setTimeout(play, item.gap * 900);
    };
    play();
  }

  stopBackgroundMusic() {
    this.isBgmPlaying = false;
    if (this.bgSynthInterval) {
      clearTimeout(this.bgSynthInterval);
      this.bgSynthInterval = null;
    }
    if (this.bgAudioEl) {
      this.bgAudioEl.pause();
    }
  }

  // --- Fade Out Background Music (Smooth Transition) ---
  fadeOutBackgroundMusic(durationMs: number = 800): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isBgmPlaying) {
        resolve();
        return;
      }

      if (this.bgAudioEl && !this.bgAudioEl.paused && this.bgAudioEl.volume > 0) {
        const startVol = this.bgAudioEl.volume;
        const steps = 16;
        const stepTime = durationMs / steps;
        let currentStep = 0;

        const fadeTimer = setInterval(() => {
          currentStep++;
          if (this.bgAudioEl) {
            this.bgAudioEl.volume = Math.max(0, startVol * (1 - currentStep / steps));
          }
          if (currentStep >= steps) {
            clearInterval(fadeTimer);
            this.stopBackgroundMusic();
            if (this.bgAudioEl) {
              this.bgAudioEl.volume = this.masterVolume;
            }
            resolve();
          }
        }, stepTime);
      } else {
        // Synth stop
        this.stopBackgroundMusic();
        setTimeout(resolve, 200);
      }
    });
  }

  // --- Happy Birthday Song Control ---
  startBirthdayMusic() {
    this.initCtx();
    this.initAudioElements();

    if (this.birthdayAudioEl && this.birthdayAudioEl.src && this.birthdayAudioEl.src !== window.location.href) {
      this.birthdayAudioEl.currentTime = 0;
      this.birthdayAudioEl.volume = this.isMuted ? 0 : this.masterVolume;
      this.birthdayAudioEl.play().then(() => {
        this.isBirthdayPlaying = true;
      }).catch(() => {
        this.startBirthdaySynth();
      });
    } else {
      this.startBirthdaySynth();
    }
  }

  private startBirthdaySynth() {
    if (this.birthdaySynthInterval) return;
    this.isBirthdayPlaying = true;

    const notes: Record<string, number> = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
    };

    const bdaySequence = [
      { note: 'C4', dur: 0.35, gap: 0.4 }, { note: 'C4', dur: 0.25, gap: 0.3 },
      { note: 'D4', dur: 0.6, gap: 0.6 },  { note: 'C4', dur: 0.6, gap: 0.6 },
      { note: 'F4', dur: 0.6, gap: 0.6 },  { note: 'E4', dur: 1.2, gap: 1.1 },
      { note: 'C4', dur: 0.35, gap: 0.4 }, { note: 'C4', dur: 0.25, gap: 0.3 },
      { note: 'D4', dur: 0.6, gap: 0.6 },  { note: 'C4', dur: 0.6, gap: 0.6 },
      { note: 'G4', dur: 0.6, gap: 0.6 },  { note: 'F4', dur: 1.2, gap: 1.1 },
      { note: 'C4', dur: 0.35, gap: 0.4 }, { note: 'C4', dur: 0.25, gap: 0.3 },
      { note: 'C5', dur: 0.6, gap: 0.6 },  { note: 'A4', dur: 0.6, gap: 0.6 },
      { note: 'F4', dur: 0.6, gap: 0.6 },  { note: 'E4', dur: 0.6, gap: 0.6 },
      { note: 'D4', dur: 1.0, gap: 0.9 },  { note: 'B4', dur: 0.35, gap: 0.4 },
      { note: 'B4', dur: 0.25, gap: 0.3 }, { note: 'A4', dur: 0.6, gap: 0.6 },
      { note: 'F4', dur: 0.6, gap: 0.6 },  { note: 'G4', dur: 0.6, gap: 0.6 },
      { note: 'F4', dur: 1.8, gap: 1.8 }
    ];

    let step = 0;
    const play = () => {
      if (!this.isBirthdayPlaying) return;
      const item = bdaySequence[step];
      if (notes[item.note]) {
        this.playNote(notes[item.note], item.dur, 0, 'sine', 1.2);
        this.playNote(notes[item.note] * 2, item.dur * 0.4, 0.04, 'triangle', 0.6);
      }
      step = (step + 1) % bdaySequence.length;
      this.birthdaySynthInterval = setTimeout(play, item.gap * 850);
    };
    play();
  }

  stopBirthdayMusic() {
    this.isBirthdayPlaying = false;
    if (this.birthdaySynthInterval) {
      clearTimeout(this.birthdaySynthInterval);
      this.birthdaySynthInterval = null;
    }
    if (this.birthdayAudioEl) {
      this.birthdayAudioEl.pause();
    }
  }

  // --- The Crucial Candle Blow Transition ---
  async handleCandleBlowAudioTransition() {
    await this.fadeOutBackgroundMusic(800);
    this.startBirthdayMusic();
  }

  // --- User Upload Methods ---
  async loadCustomBgAudio(file: File) {
    this.stopBackgroundMusic();
    const url = URL.createObjectURL(file);
    if (!this.bgAudioEl) this.bgAudioEl = new Audio();
    this.bgAudioEl.src = url;
    this.bgAudioEl.loop = true;
    this.bgTrackName = file.name.replace(/\.[^/.]+$/, '');

    await saveMediaItem('audio_bg_music', file);
    await saveMediaItem('audio_bg_name', this.bgTrackName);

    this.startBackgroundMusic();
  }

  async loadCustomBirthdayAudio(file: File) {
    this.stopBirthdayMusic();
    const url = URL.createObjectURL(file);
    if (!this.birthdayAudioEl) this.birthdayAudioEl = new Audio();
    this.birthdayAudioEl.src = url;
    this.birthdayAudioEl.loop = false;
    this.birthdayTrackName = file.name.replace(/\.[^/.]+$/, '');

    await saveMediaItem('audio_birthday_music', file);
    await saveMediaItem('audio_birthday_name', this.birthdayTrackName);
  }

  // --- Volume & Mute Controls ---
  setMasterVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.bgAudioEl) this.bgAudioEl.volume = this.isMuted ? 0 : this.masterVolume;
    if (this.birthdayAudioEl) this.birthdayAudioEl.volume = this.isMuted ? 0 : this.masterVolume;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgAudioEl) this.bgAudioEl.volume = this.isMuted ? 0 : this.masterVolume;
    if (this.birthdayAudioEl) this.birthdayAudioEl.volume = this.isMuted ? 0 : this.masterVolume;
    return this.isMuted;
  }

  toggleBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic();
      return true;
    }
  }

  getMasterVolume() { return this.masterVolume; }
  getIsMuted() { return this.isMuted; }
  getIsBgmPlaying() { return this.isBgmPlaying; }
  getIsBirthdayPlaying() { return this.isBirthdayPlaying; }
  getBgTrackName() { return this.bgTrackName; }
  getBirthdayTrackName() { return this.birthdayTrackName; }

  // --- Interactive Sound Effects ---
  playDoorUnlockSound() {
    try {
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((freq, idx) => this.playNote(freq, 1.2, idx * 0.12, 'sine'));
    } catch {}
  }

  playBoxOpenSound() {
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => this.playNote(freq, 0.5, idx * 0.08, 'triangle'));
    } catch {}
  }

  playHeartPopSound() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const startTime = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, startTime);
      osc.frequency.exponentialRampToValueAtTime(750, startTime + 0.15);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    } catch {}
  }

  playLampClickSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Crisp mechanical pull-chain brass "snick-clack" double impulse
      const createClickTransient = (offsetSec: number, freq: number, gainPeak: number, dur: number) => {
        const bufSize = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          const env = Math.exp((-i / bufSize) * 14);
          data[i] = (Math.random() * 2 - 1) * env;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, now + offsetSec);
        filter.Q.setValueAtTime(2.5, now + offsetSec);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(gainPeak * Math.max(0.5, this.masterVolume), now + offsetSec);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offsetSec + dur);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start(now + offsetSec);
      };

      // Pull tension snick + switch latch click
      createClickTransient(0, 2600, 0.35, 0.025);
      createClickTransient(0.032, 1650, 0.55, 0.045);

      // Subtle warm tungsten filament hum bloom
      const osc = ctx.createOscillator();
      const warmGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
      warmGain.gain.setValueAtTime(0.0001, now + 0.04);
      warmGain.gain.exponentialRampToValueAtTime(0.06 * this.masterVolume, now + 0.14);
      warmGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc.connect(warmGain);
      warmGain.connect(ctx.destination);
      osc.start(now + 0.04);
      osc.stop(now + 0.6);
    } catch {}
  }

  playCandleBlowSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const duration = 1.25;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Soft airy breath bandpass sweep
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.4, now);
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(980, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(320, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28 * Math.max(0.5, this.masterVolume), now + 0.18);
      gain.gain.setValueAtTime(0.24 * Math.max(0.5, this.masterVolume), now + 0.85);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch {}
  }

  /**
   * Realistic balloon-pop / party-popper celebration sound effect
   * lasting approximately 2.5 seconds (within 2-3s requirement).
   */
  playPartyPopCelebrationSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const vol = Math.max(0.45, this.masterVolume);

      const triggerPop = (offsetSec: number, pitchBase: number, strength: number) => {
        const t = now + offsetSec;
        // 1) Sharp air-pressure thump (balloon / popper body)
        const thump = ctx.createOscillator();
        const thumpGain = ctx.createGain();
        thump.type = 'triangle';
        thump.frequency.setValueAtTime(pitchBase, t);
        thump.frequency.exponentialRampToValueAtTime(42, t + 0.085);
        thumpGain.gain.setValueAtTime(0.65 * strength * vol, t);
        thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
        thump.connect(thumpGain);
        thumpGain.connect(ctx.destination);
        thump.start(t);
        thump.stop(t + 0.11);

        // 2) Crisp broadband pop snap
        const snapDur = 0.14;
        const bufSize = Math.floor(ctx.sampleRate * snapDur);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          const decay = Math.exp((-i / bufSize) * 16);
          data[i] = (Math.random() * 2 - 1) * decay;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;

        const bp = ctx.createBiquadFilter();
        bp.type = 'highpass';
        bp.frequency.setValueAtTime(900, t);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.7 * strength * vol, t);
        nGain.gain.exponentialRampToValueAtTime(0.0001, t + snapDur);

        noise.connect(bp);
        bp.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(t);
      };

      // Dual simultaneous party-popper bangs (left & right!)
      triggerPop(0.0, 260, 1.0);
      triggerPop(0.055, 290, 0.95);

      // Festive celebratory balloon pops cascading across ~2.5 seconds
      triggerPop(0.42, 310, 0.65);
      triggerPop(0.88, 240, 0.72);
      triggerPop(1.36, 330, 0.58);
      triggerPop(1.85, 275, 0.62);
      triggerPop(2.28, 300, 0.5);

      // Confetti streamer flutter & celebratory sparkle tail spanning 0.05s -> 2.6s
      const fizzDur = 2.55;
      const fizzSize = Math.floor(ctx.sampleRate * fizzDur);
      const fizzBuf = ctx.createBuffer(1, fizzSize, ctx.sampleRate);
      const fizzData = fizzBuf.getChannelData(0);
      for (let i = 0; i < fizzSize; i++) {
        const progress = i / fizzSize;
        const sparkleMod = Math.sin(progress * Math.PI * 18) * 0.3 + 0.7;
        const envelope = Math.sin(Math.min(1, progress * 6) * (Math.PI / 2)) * (1 - progress * 0.85);
        fizzData[i] = (Math.random() * 2 - 1) * envelope * sparkleMod;
      }
      const fizzSrc = ctx.createBufferSource();
      fizzSrc.buffer = fizzBuf;

      const fizzFilter = ctx.createBiquadFilter();
      fizzFilter.type = 'bandpass';
      fizzFilter.frequency.setValueAtTime(3600, now + 0.05);
      fizzFilter.Q.setValueAtTime(1.8, now + 0.05);

      const fizzGain = ctx.createGain();
      fizzGain.gain.setValueAtTime(0.11 * vol, now + 0.05);
      fizzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05 + fizzDur);

      fizzSrc.connect(fizzFilter);
      fizzFilter.connect(fizzGain);
      fizzGain.connect(ctx.destination);
      fizzSrc.start(now + 0.05);

      // Joyful ascending celebration chimes at 0.25s -> 2.1s
      const chimes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      chimes.forEach((f, idx) => {
        this.playNote(f, 0.65, 0.2 + idx * 0.35, 'triangle', 0.45);
      });
    } catch {}
  }

  playWaxSealSound() {
    try {
      const notes = [659.25, 783.99, 987.77, 1318.51];
      notes.forEach((f, i) => this.playNote(f, 0.8, i * 0.09, 'sine'));
    } catch {}
  }
}

export const romanticAudio = new RomanticAudioEngine();
