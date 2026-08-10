"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import EmptyState from "@/components/EmptyState";
import FilterPanel from "@/components/FilterPanel";
import MovieResult from "@/components/MovieResult";
import PickAnimation from "@/components/PickAnimation";
import { track } from "@/lib/analytics";
import { getRecent, pushRecent } from "@/lib/history";
import { cn } from "@/lib/utils";
import type {
  MovieFilters,
  MovieWithStreaming,
  SurpriseMode,
} from "@/types/movie";

const DEFAULT_FILTERS: MovieFilters = {
  genres: [],
  rating: "any",
  decade: "any",
  runtime: "any",
  freeOnly: false,
  surprise: null,
  country: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ?? "US",
};

const SURPRISE_MODES: { mode: SurpriseMode; label: string; emoji: string }[] = [
  { mode: "hidden-gem", label: "Hidden Gem", emoji: "💎" },
  { mode: "highly-rated", label: "Highly Rated", emoji: "🏆" },
  { mode: "classic", label: "Classic", emoji: "🎞️" },
  { mode: "cult-favorite", label: "Cult Favorite", emoji: "🕶️" },
  { mode: "date-night", label: "Date Night", emoji: "❤️" },
  { mode: "family-night", label: "Family Night", emoji: "🧸" },
  { mode: "wild-card", label: "Wild Card", emoji: "🃏" },
];

const MIN_ANIMATION_MS = 1100;

type Status = "idle" | "picking" | "result" | "empty" | "error";

interface ErrorState {
  message: string;
  hint?: string;
}

export default function MovieRandomizer() {
  const [filters, setFilters] = useState<MovieFilters>(DEFAULT_FILTERS);
  const [status, setStatus] = useState<Status>("idle");
  const [movie, setMovie] = useState<MovieWithStreaming | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [reel, setReel] = useState<string[]>([]);
  const [showSurprise, setShowSurprise] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // Seed the shuffle animation with real posters (best-effort).
  useEffect(() => {
    fetch("/api/movies/reel")
      .then((r) => (r.ok ? r.json() : { posters: [] }))
      .then((d) => Array.isArray(d.posters) && setReel(d.posters))
      .catch(() => {});
  }, []);

  const runPick = useCallback(
    async (overrideFilters?: MovieFilters, isAnother = false) => {
      const effective = overrideFilters ?? filters;
      setStatus("picking");
      setError(null);
      track(isAnother ? "pick_another" : "movie_picked", {
        freeOnly: effective.freeOnly,
        surprise: effective.surprise ?? undefined,
        genres: effective.genres.length,
      });

      const started = Date.now();
      try {
        const res = await fetch("/api/movies/random", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            filters: effective,
            recentIds: getRecent(),
          }),
        });

        // Keep the animation on screen for a satisfying minimum.
        const elapsed = Date.now() - started;
        if (elapsed < MIN_ANIMATION_MS) {
          await new Promise((r) => setTimeout(r, MIN_ANIMATION_MS - elapsed));
        }

        if (res.status === 404) {
          setStatus("empty");
          setMovie(null);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError({
            message:
              data.message ??
              "Something went wrong finding a movie. Please try again.",
          });
          setStatus("error");
          return;
        }

        const data = (await res.json()) as { movie: MovieWithStreaming };
        pushRecent(data.movie.id);
        setMovie(data.movie);
        setStatus("result");
      } catch {
        setError({
          message: "Network hiccup — couldn't reach the movie service.",
          hint: "Check your connection and try again.",
        });
        setStatus("error");
      }
    },
    [filters],
  );

  // Scroll the result into view once it lands.
  useEffect(() => {
    if (status === "result" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status, movie]);

  const pick = () => {
    // The primary button uses the user's own filters, not a Surprise preset.
    const next = { ...filters, surprise: null };
    setFilters(next);
    runPick(next);
  };
  const pickAnother = () => runPick(undefined, true);

  const surpriseMe = (mode: SurpriseMode) => {
    track("surprise_me", { mode });
    const next = { ...filters, surprise: mode };
    setFilters(next);
    setShowSurprise(false);
    runPick(next);
  };

  const busy = status === "picking";

  return (
    <div className="space-y-8">
      {/* Hero / primary action */}
      <section className="text-center">
        <div className="relative mx-auto inline-flex flex-col items-center">
          <button
            type="button"
            onClick={pick}
            disabled={busy}
            className={cn(
              "group relative inline-flex items-center gap-3 rounded-full bg-popcorn px-10 py-6 text-2xl font-extrabold text-ink-950 shadow-glow-amber transition sm:px-14 sm:py-7 sm:text-3xl",
              "hover:bg-popcorn-light active:scale-[0.98]",
              busy && "cursor-not-allowed opacity-70",
            )}
          >
            {!busy && (
              <span
                className="absolute inset-0 -z-10 rounded-full bg-popcorn/50 animate-pulse-ring"
                aria-hidden
              />
            )}
            <span aria-hidden className={cn(!busy && "group-hover:animate-spin")}>
              🎲
            </span>
            {busy ? "Picking…" : "Pick a Movie"}
          </button>

          <button
            type="button"
            onClick={() => setShowSurprise((s) => !s)}
            aria-expanded={showSurprise}
            className="mt-4 text-sm font-medium text-slate-300 underline decoration-dotted underline-offset-4 hover:text-white"
          >
            ✨ or Surprise Me
          </button>
        </div>

        {showSurprise && (
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2 animate-fade-in">
            {SURPRISE_MODES.map((s) => (
              <button
                key={s.mode}
                type="button"
                onClick={() => surpriseMe(s.mode)}
                disabled={busy}
                className="btn-secondary px-4 py-2 text-sm"
              >
                <span aria-hidden>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-2xl">
        <FilterPanel filters={filters} onChange={setFilters} disabled={busy} />
      </section>

      {/* Result area */}
      <section ref={resultRef} className="scroll-mt-20">
        {status === "picking" && <PickAnimation posters={reel} />}

        {status === "result" && movie && (
          <MovieResult
            movie={movie}
            onPickAnother={pickAnother}
            picking={false}
          />
        )}

        {status === "empty" && (
          <EmptyState
            title="No movies matched those filters."
            message="That combination is a little too specific."
            hint="Try removing one filter — the free-only toggle or the rating floor are good places to start."
            action={
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setStatus("idle");
                }}
              >
                Adjust filters
              </button>
            }
          />
        )}

        {status === "error" && error && (
          <EmptyState
            title="Something interrupted the show."
            message={error.message}
            hint={error.hint}
            action={
              <button type="button" className="btn-primary" onClick={pick}>
                🎲 Try again
              </button>
            }
          />
        )}
      </section>
    </div>
  );
}
