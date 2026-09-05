// High-fidelity Web Audio API sound synthesizer for enterprise ERP transitions and actions
// Operates purely via native browser AudioContext without external audio files

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Executive login sound - rich, warm, harmonious celestial chord
   * F4 (349.23Hz) -> A4 (440.00Hz) -> C5 (523.25Hz) -> F5 (698.46Hz) -> A5 (880.00Hz)
   */
  public playLoginChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [
        { freq: 349.23, delay: 0.00, dur: 1.6, gain: 0.22 }, // F4 (Base fundamental)
        { freq: 440.00, delay: 0.08, dur: 1.5, gain: 0.20 }, // A4
        { freq: 523.25, delay: 0.16, dur: 1.7, gain: 0.24 }, // C5
        { freq: 698.46, delay: 0.24, dur: 1.9, gain: 0.22 }, // F5
        { freq: 880.00, delay: 0.34, dur: 2.2, gain: 0.18 }, // A5 (Sparkling high tone)
        { freq: 1046.50, delay: 0.44, dur: 2.4, gain: 0.14 }, // C6 (Air overtone)
      ];

      // Master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, now);
      masterGain.connect(ctx.destination);

      notes.forEach(({ freq, delay, dur, gain: targetGain }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        // Add subtle harmonic richness with slight detune
        osc.detune.setValueAtTime(Math.random() * 4 - 2, now + delay);

        // Envelope: soft attack -> gentle decay
        noteGain.gain.setValueAtTime(0.0001, now + delay);
        noteGain.gain.exponentialRampToValueAtTime(targetGain, now + delay + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(targetGain * 0.7, now + delay + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.1);
      });
    } catch (e) {
      console.warn('Audio chime playback failed:', e);
    }
  }

  /**
   * Action success chime - dual pleasant beep for saved vouchers / actions
   */
  public playSuccessTone() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [587.33, 880.00].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.0001, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    } catch (e) {
      // Ignored
    }
  }

  /**
   * Subtle key/tab click feedback
   */
  public playClickTone() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Ignored
    }
  }
}

export const soundEngine = new SoundEngine();

export function playLoginSound() {
  soundEngine.playLoginChime();
}

export function playSuccessChime() {
  soundEngine.playSuccessTone();
}

export function playClickSound() {
  soundEngine.playClickTone();
}
