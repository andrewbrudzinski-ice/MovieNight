"use client";

import { useEffect, useState } from "react";

import { isMuted, setMuted, subscribeSound } from "@/lib/sound";

/** Small speaker toggle so viewers can silence the remote/chime sounds. */
export default function SoundToggle() {
  const [muted, setMutedState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setMutedState(isMuted());
    update();
    return subscribeSound(update);
  }, []);

  const toggle = () => setMuted(!muted);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={muted}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      title={muted ? "Sound off" : "Sound on"}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/30 text-slate-300 backdrop-blur transition hover:bg-black/50 hover:text-white"
    >
      <span suppressHydrationWarning aria-hidden>
        {mounted && muted ? (
          <SpeakerOff className="h-4 w-4" />
        ) : (
          <SpeakerOn className="h-4 w-4" />
        )}
      </span>
    </button>
  );
}

function SpeakerOn({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function SpeakerOff({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="m22 9-6 6" />
      <path d="m16 9 6 6" />
    </svg>
  );
}
