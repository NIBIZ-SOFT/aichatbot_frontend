/**
 * Professional Web Audio API Synthesized Chime & HTML5 Desktop Push Notification Engine
 * - Zero external .mp3 dependencies (100% offline & zero-latency)
 * - Harmonic dual-frequency bell chime (587Hz -> 880Hz)
 * - Persistent local storage preference
 */

class NotificationSoundService {
  private audioCtx: AudioContext | null = null;
  private soundEnabledKey = "inbox_sound_enabled";

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public isSoundEnabled(): boolean {
    if (typeof window === "undefined") return true;
    const val = localStorage.getItem(this.soundEnabledKey);
    return val === null ? true : val === "true";
  }

  public setSoundEnabled(enabled: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.soundEnabledKey, String(enabled));
  }

  /**
   * Synthesizes a high-fidelity, crystal-clear 2-tone harmonic chime
   * Tone 1: 587.33 Hz (D5)
   * Tone 2: 880.00 Hz (A5)
   */
  public playChime(force: boolean = false): void {
    if (!force && !this.isSoundEnabled()) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1 (D5 - 587.33 Hz)
      this.createHarmonicTone(ctx, 587.33, now, 0.4, 0.25);
      // Note 2 (A5 - 880.00 Hz) - starts 110ms later
      this.createHarmonicTone(ctx, 880.00, now + 0.11, 0.55, 0.28);
    } catch (e) {
      console.warn("Audio synthesis notice:", e);
    }
  }

  private createHarmonicTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number
  ) {
    // Primary Tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, startTime);

    // Harmonic Overtone (Double Frequency for sparkling bell resonance)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Master Gain & Envelope
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(volume, startTime + 0.015); // Instant attack
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Smooth decay

    gain1.gain.setValueAtTime(0.7, startTime);
    gain2.gain.setValueAtTime(0.3, startTime);

    osc1.connect(gain1);
    gain1.connect(masterGain);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    masterGain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  /**
   * HTML5 Browser Desktop Push Notification
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    try {
      return await Notification.requestPermission();
    } catch (e) {
      return "denied";
    }
  }

  public getNotificationPermission(): NotificationPermission | "unsupported" {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  }

  public showDesktopNotification(
    title: string,
    body: string,
    onClick?: () => void
  ): void {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      const notif = new Notification(title, {
        body: body.length > 120 ? body.slice(0, 117) + "..." : body,
        icon: "/favicon.ico",
        silent: true, // We already play our high-fidelity custom chime!
        tag: "inbox-new-message"
      });

      notif.onclick = () => {
        window.focus();
        if (onClick) onClick();
        notif.close();
      };

      // Auto close after 6 seconds
      setTimeout(() => notif.close(), 6000);
    } catch (e) {
      console.warn("Desktop notification notice:", e);
    }
  }
}

export const notificationSound = new NotificationSoundService();
