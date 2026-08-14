"use client";

/**
 * Tiny Web-Audio sound kit. Sounds are synthesized on the fly (no audio files
 * to bundle, works offline). Everything is a no-op on the server, when the
 * browser lacks Web Audio, or when the user has muted — and it never throws.
 *
 * Audio only plays in response to a user gesture (a remote press), so browser
 * autoplay policies are satisfied.
 */

const MUTE_KEY = "movie-night:sound";
const EVENT = "movie-night:sound-changed";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "off";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "off" : "on");
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* ignore */
  }
}

export function subscribeSound(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => listener();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function blip(
  c: AudioContext,
  {
    type,
    freq,
    freqEnd,
    start,
    duration,
    peak,
  }: {
    type: OscillatorType;
    freq: number;
    freqEnd?: number;
    start: number;
    duration: number;
    peak: number;
  },
): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** A crisp remote-button "tick-thock". */
export function playClick(): void {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  blip(c, { type: "square", freq: 1900, freqEnd: 900, start: now, duration: 0.045, peak: 0.09 });
  blip(c, { type: "sine", freq: 240, freqEnd: 130, start: now, duration: 0.07, peak: 0.14 });
}

/** A soft two-note chime when the pick lands. */
export function playReveal(): void {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  blip(c, { type: "sine", freq: 523.25, start: now, duration: 0.14, peak: 0.08 }); // C5
  blip(c, { type: "sine", freq: 783.99, start: now + 0.1, duration: 0.22, peak: 0.09 }); // G5
}
