"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

function ShuffleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="M15 15l6 6" />
      <path d="M4 4l5 5" />
    </svg>
  );
}

/**
 * A realistic modern streaming remote resting on the coffee table. The round
 * OK button (with a shuffle glyph) is the randomizer; a small shortcut key is
 * Surprise. Both are real, labelled <button>s — fully keyboard-accessible.
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
    <div
      className={cn(
        "relative w-[4.5rem] select-none rounded-[1.75rem] p-3 sm:w-[5.25rem]",
        "bg-[linear-gradient(150deg,#3a3a42_0%,#232329_38%,#17171c_100%)]",
        "border border-white/10 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)]",
        "[transform:rotate(-4deg)]",
        pressed && "remote-press",
      )}
    >
      {/* speaker/IR grille + standby LED */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="h-1 w-4 rounded-full bg-black/50 shadow-inner" aria-hidden />
        <span
          className="h-1.5 w-1.5 rounded-full bg-rose-500/80 shadow-[0_0_5px] shadow-rose-500/60"
          aria-hidden
        />
      </div>

      {/* navigation ring + OK (the randomize button) */}
      <div className="relative mx-auto grid h-[3.4rem] w-[3.4rem] place-items-center sm:h-16 sm:w-16">
        {/* dished ring */}
        <div
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_35%,#2c2c33,#141418)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7),inset_0_-1px_0_rgba(255,255,255,0.05)]"
          aria-hidden
        />
        {/* directional ticks */}
        {["top-1", "bottom-1", "left-1", "right-1"].map((pos) => (
          <span
            key={pos}
            className={cn(
              "absolute h-0.5 w-0.5 rounded-full bg-white/25",
              pos.startsWith("top") && "left-1/2 top-1 -translate-x-1/2",
              pos.startsWith("bottom") && "bottom-1 left-1/2 -translate-x-1/2",
              pos.startsWith("left") && "left-1 top-1/2 -translate-y-1/2",
              pos.startsWith("right") && "right-1 top-1/2 -translate-y-1/2",
            )}
            aria-hidden
          />
        ))}

        {/* soft invitation glow */}
        {!busy && (
          <span
            className="pointer-events-none absolute inset-1 rounded-full bg-popcorn/25 blur-md"
            aria-hidden
          />
        )}

        <button
          type="button"
          onClick={press}
          disabled={busy}
          aria-label={hasResult ? "Pick another movie" : "Pick a movie"}
          className={cn(
            "relative z-10 grid h-[2.1rem] w-[2.1rem] place-items-center rounded-full text-ink-950 transition sm:h-10 sm:w-10",
            "bg-[radial-gradient(circle_at_50%_30%,#ffe0a3,#ffc857_55%,#f0a828_100%)]",
            "shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.6)]",
            "hover:brightness-105 active:translate-y-px",
            busy && "cursor-not-allowed opacity-70",
          )}
        >
          <ShuffleIcon
            className={cn(
              "h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]",
              busy && "animate-spin",
            )}
          />
        </button>
      </div>

      {/* volume / channel rockers */}
      <div className="mt-2.5 flex justify-center gap-2" aria-hidden>
        <span className="h-5 w-2.5 rounded-full bg-black/40 shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)]" />
        <span className="h-5 w-2.5 rounded-full bg-black/40 shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)]" />
      </div>

      {/* Surprise shortcut key */}
      <button
        type="button"
        onClick={onSurprise}
        disabled={busy}
        aria-label="Surprise me"
        className={cn(
          "mt-2.5 flex h-[1.35rem] w-full items-center justify-center rounded-lg text-[8px] font-semibold uppercase tracking-[0.08em] transition sm:text-[9px]",
          "bg-[linear-gradient(180deg,#3a3550,#241f36)] text-neon-light",
          "border border-neon/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-neon/60",
          "disabled:opacity-60",
        )}
      >
        Surprise
      </button>
    </div>
  );
}
