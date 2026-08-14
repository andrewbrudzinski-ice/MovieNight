"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The TV remote resting on the coffee table. The big glowing button is the
 * randomizer; a small ✨ button toggles the Surprise-Me tray. It's a real,
 * labelled <button> so it's fully keyboard-accessible.
 */
export default function Remote({
  onPick,
  onSurprise,
  busy,
  hasResult,
}: {
  onPick: () => void;
  onSurprise: () => void;
  busy: boolean;
  hasResult: boolean;
}) {
  const [pressed, setPressed] = useState(false);

  const press = () => {
    if (busy) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 200);
    onPick();
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Remote body */}
      <div
        className={cn(
          "relative w-24 select-none rounded-[1.6rem] border border-white/10 bg-gradient-to-b from-ink-700 to-ink-850 px-3 py-4 shadow-card sm:w-28",
          pressed && "remote-press",
        )}
      >
        {/* soft glow behind the main button */}
        {!busy && (
          <span
            className="pointer-events-none absolute left-1/2 top-11 h-16 w-16 -translate-x-1/2 rounded-full bg-popcorn/40 blur-xl"
            aria-hidden
          />
        )}

        {/* IR window / brand strip */}
        <div className="mx-auto mb-3 h-1.5 w-8 rounded-full bg-black/50" aria-hidden />

        {/* Main randomize button */}
        <button
          type="button"
          onClick={press}
          disabled={busy}
          aria-label={hasResult ? "Pick another movie" : "Pick a movie"}
          className={cn(
            "group relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-ink-950 transition sm:h-16 sm:w-16",
            "bg-gradient-to-b from-popcorn-light to-popcorn shadow-[0_6px_0_0] shadow-popcorn-dark",
            "hover:from-popcorn hover:to-popcorn-dark active:translate-y-1 active:shadow-[0_2px_0_0]",
            busy && "cursor-not-allowed opacity-70",
          )}
        >
          <span
            aria-hidden
            className={cn(busy ? "animate-spin" : "group-hover:animate-spin")}
          >
            🎲
          </span>
        </button>
        <p className="mt-1.5 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
          {busy ? "•••" : hasResult ? "Again" : "Pick"}
        </p>

        {/* Decorative D-pad-ish dots + a working Surprise button */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white/15" aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-white/15" aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-white/15" aria-hidden />
        </div>
        <button
          type="button"
          onClick={onSurprise}
          disabled={busy}
          className="mx-auto mt-2 flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-neon-light transition hover:bg-white/10 disabled:opacity-60"
        >
          <span aria-hidden>✨</span> Surprise
        </button>
      </div>
    </div>
  );
}
