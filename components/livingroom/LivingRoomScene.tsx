"use client";

import Remote from "@/components/livingroom/Remote";
import TvScreen, { type ScreenStatus } from "@/components/livingroom/TvScreen";
import type { MovieWithStreaming } from "@/types/movie";

/**
 * The cozy living-room set: a glowing TV on a media console, and a coffee table
 * in the foreground with the remote (and some popcorn). The TV is the reveal;
 * the remote is the button. Laid out as a vertical stack so it stays responsive
 * from phones to big screens.
 */
export default function LivingRoomScene({
  status,
  movie,
  reel,
  errorMessage,
  onPick,
  onSurprise,
  busy,
}: {
  status: ScreenStatus;
  movie: MovieWithStreaming | null;
  reel: string[];
  errorMessage?: string;
  onPick: () => void;
  onSurprise: () => void;
  busy: boolean;
}) {
  const hasResult = status === "result";
  // Tint the wall glow to match the mood: warm when a movie's on, cool at rest.
  const glow = hasResult
    ? "bg-popcorn/25"
    : status === "picking"
      ? "bg-neon/30"
      : "bg-neon/15";

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-b from-ink-900 via-ink-950 to-black px-4 pb-8 pt-10 sm:px-10 sm:pt-14">
      {/* Warm lamp glow, upper corner */}
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-popcorn/10 blur-3xl"
        aria-hidden
      />

      {/* TV + wall-glow */}
      <div className="relative mx-auto w-full max-w-2xl">
        <span
          className={`pointer-events-none absolute -inset-6 -z-0 rounded-[3rem] blur-3xl transition-colors duration-700 ${glow}`}
          aria-hidden
        />

        {/* TV frame */}
        <div className="relative z-10 rounded-2xl border border-white/10 bg-gradient-to-b from-ink-700 to-ink-850 p-2 shadow-card sm:rounded-3xl sm:p-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-black/60 sm:rounded-2xl">
            <TvScreen
              status={status}
              movie={movie}
              reel={reel}
              errorMessage={errorMessage}
            />
            {/* glass reflection */}
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent"
              aria-hidden
            />
          </div>
          {/* power LED */}
          <span
            className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-freon shadow-[0_0_6px] shadow-freon sm:bottom-1.5"
            aria-hidden
          />
        </div>

        {/* TV stand + media console */}
        <div className="relative z-0 mx-auto -mt-px h-3 w-10 bg-gradient-to-b from-ink-700 to-ink-800" aria-hidden />
        <div
          className="mx-auto h-3 w-3/4 rounded-b-xl bg-gradient-to-b from-ink-700 to-ink-850 shadow-lg sm:h-4"
          aria-hidden
        />
      </div>

      {/* Coffee table in the foreground */}
      <div className="relative mt-10 sm:mt-12" style={{ perspective: "700px" }}>
        {/* idle hint pointing at the remote */}
        {status === "idle" && (
          <p className="mb-2 flex items-center justify-center gap-1 text-center text-sm text-slate-400">
            Grab the remote
            <span className="animate-nudge" aria-hidden>
              👇
            </span>
          </p>
        )}

        {/* table surface (faked depth) */}
        <div className="relative mx-auto max-w-md">
          <div
            className="absolute inset-x-0 bottom-0 top-6 rounded-[50%_50%_18%_18%/40%_40%_12%_12%] border-t border-white/10 bg-gradient-to-b from-ink-700/90 to-ink-850 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
            style={{ transform: "rotateX(38deg)" }}
            aria-hidden
          />

          {/* things resting on the table */}
          <div className="relative flex items-end justify-center gap-4 pb-2 pt-2">
            {/* popcorn */}
            <div
              className="hidden select-none flex-col items-center sm:flex"
              aria-hidden
            >
              <span className="text-3xl drop-shadow">🍿</span>
            </div>

            {/* the remote */}
            <Remote
              onPick={onPick}
              onSurprise={onSurprise}
              busy={busy}
              hasResult={hasResult}
            />

            {/* a warm mug */}
            <div
              className="hidden select-none flex-col items-center sm:flex"
              aria-hidden
            >
              <span className="text-3xl drop-shadow">☕</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
