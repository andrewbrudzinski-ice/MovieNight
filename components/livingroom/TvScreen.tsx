"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { formatRating, formatRuntime, funNote } from "@/lib/utils";
import { hasFreeOption } from "@/types/streaming";
import type { MovieWithStreaming } from "@/types/movie";

export type ScreenStatus = "idle" | "picking" | "result" | "empty" | "error";

/**
 * Everything shown inside the TV. The frame around it lives in LivingRoomScene.
 * The screen is a fixed 16:9 area so the scene never reflows between states.
 */
export default function TvScreen({
  status,
  movie,
  reel,
  errorMessage,
}: {
  status: ScreenStatus;
  movie: MovieWithStreaming | null;
  reel: string[];
  errorMessage?: string;
}) {
  return (
    <div className="tv-scanlines relative h-full w-full overflow-hidden bg-black">
      {status === "idle" && <Standby />}
      {status === "picking" && <ChannelSurf reel={reel} />}
      {status === "result" && movie && <NowPlaying movie={movie} />}
      {status === "empty" && (
        <NoSignal
          heading="No matches"
          line="Nothing on any channel with those filters."
          sub="Try removing one — the free-only toggle is a good start."
        />
      )}
      {status === "error" && (
        <NoSignal
          heading="No signal"
          line={errorMessage ?? "Couldn't tune in right now."}
          sub="Grab the remote and try again."
        />
      )}
    </div>
  );
}

function Standby() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink-850 via-ink-900 to-black text-center">
      <span
        className="pointer-events-none absolute -inset-10 bg-neon/10 blur-3xl"
        aria-hidden
      />
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
        Movie Night
      </p>
      <p className="px-6 text-lg font-bold text-slate-200 sm:text-2xl">
        Ready when you are 🍿
      </p>
      <p className="text-sm text-slate-500">
        Press the remote to pick tonight&apos;s movie
      </p>
      <span
        className="mt-1 inline-block h-2 w-2 animate-pulse rounded-full bg-freon shadow-[0_0_10px] shadow-freon"
        aria-hidden
      />
    </div>
  );
}

function ChannelSurf({ reel }: { reel: string[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || reel.length === 0) return;

    let delay = 90;
    const tick = () => {
      setIndex((i) => (i + 1) % reel.length);
      delay = Math.min(delay * 1.06, 240);
      timer.current = setTimeout(tick, delay);
    };
    timer.current = setTimeout(tick, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reel]);

  const current = reel[index];

  return (
    <div
      className="tv-flicker relative flex h-full w-full items-center justify-center bg-black"
      role="status"
      aria-live="polite"
    >
      {current ? (
        <Image
          key={current}
          src={current}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover opacity-90"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neon/30 to-ink-900" />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative flex flex-col items-center gap-2">
        <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
          🎬 Finding your movie…
        </span>
        <span className="sr-only">Shuffling movies</span>
      </div>
    </div>
  );
}

function NowPlaying({ movie }: { movie: MovieWithStreaming }) {
  const runtime = formatRuntime(movie.runtime);
  const rating = formatRating(movie.rating);
  const note = funNote(movie);
  const free = hasFreeOption(movie.streaming);

  return (
    <div className="relative h-full w-full">
      {movie.backdropUrl ? (
        <Image
          src={movie.backdropUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover"
        />
      ) : movie.posterUrl ? (
        <Image
          src={movie.posterUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover object-top blur-sm"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ink-700 to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="tv-pop absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-popcorn sm:text-xs">
          Tonight&apos;s Pick
        </p>
        <h2 className="text-xl font-extrabold leading-tight text-white drop-shadow sm:text-3xl md:text-4xl">
          {movie.title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {rating && (
            <span className="inline-flex items-center gap-1 font-semibold text-popcorn">
              <span aria-hidden>⭐</span>
              <span aria-label={`Rated ${rating} out of 10`}>{rating}</span>
            </span>
          )}
          {movie.year && <span className="text-slate-200">{movie.year}</span>}
          {runtime && (
            <>
              <span className="text-slate-500" aria-hidden>
                •
              </span>
              <span className="text-slate-200">{runtime}</span>
            </>
          )}
          {free && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-freon/50 bg-freon/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-freon sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-freon" aria-hidden />
              Free
            </span>
          )}
        </div>
        {note && (
          <p className="mt-1.5 text-xs font-medium text-neon-light sm:text-sm">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

function NoSignal({
  heading,
  line,
  sub,
}: {
  heading: string;
  line: string;
  sub: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-ink-850 to-black px-6 text-center">
      <span className="text-3xl" aria-hidden>
        📺
      </span>
      <p className="text-lg font-bold text-slate-200">{heading}</p>
      <p className="max-w-sm text-sm text-slate-400">{line}</p>
      <p className="max-w-sm text-xs text-slate-500">{sub}</p>
    </div>
  );
}
