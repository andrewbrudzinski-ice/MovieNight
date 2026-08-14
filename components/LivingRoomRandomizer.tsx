"use client";

import { useCallback, useEffect, useState } from "react";

import FilterPanel from "@/components/FilterPanel";
import LivingRoomScene from "@/components/livingroom/LivingRoomScene";
import type { ScreenStatus } from "@/components/livingroom/TvScreen";
import { track } from "@/lib/analytics";
import { getRecent, pushRecent } from "@/lib/history";
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

// A touch longer than the API usually takes, so the channel-surf always plays.
const MIN_ANIMATION_MS = 1400;

export default function LivingRoomRandomizer() {
  const [filters, setFilters] = useState<MovieFilters>(DEFAULT_FILTERS);
  const [status, setStatus] = useState<ScreenStatus>("idle");
  const [movie, setMovie] = useState<MovieWithStreaming | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [reel, setReel] = useState<string[]>([]);
  const [showSurprise, setShowSurprise] = useState(false);

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
      setErrorMessage(undefined);
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
          body: JSON.stringify({ filters: effective, recentIds: getRecent() }),
        });

        const elapsed = Date.now() - started;
        if (elapsed < MIN_ANIMATION_MS) {
          await new Promise((r) => setTimeout(r, MIN_ANIMATION_MS - elapsed));
        }

        if (res.status === 404) {
          setMovie(null);
          setStatus("empty");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setErrorMessage(
            data.message ?? "Couldn't reach the movie service. Please try again.",
          );
          setStatus("error");
          return;
        }

        const data = (await res.json()) as { movie: MovieWithStreaming };
        pushRecent(data.movie.id);
        setMovie(data.movie);
        setStatus("result");
      } catch {
        setErrorMessage("Network hiccup — couldn't reach the movie service.");
        setStatus("error");
      }
    },
    [filters],
  );

  const pick = () => {
    const next = { ...filters, surprise: null };
    setFilters(next);
    setShowSurprise(false);
    runPick(next, status === "result");
  };

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
      <LivingRoomScene
        status={status}
        movie={movie}
        reel={reel}
        errorMessage={errorMessage}
        onPick={pick}
        onSurprise={() => setShowSurprise((s) => !s)}
        busy={busy}
      />

      {/* Surprise-Me tray (opened from the remote) */}
      {showSurprise && (
        <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-2 animate-fade-in">
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

      {/* The movie lives entirely on the TV — no duplicate card here. */}

      {/* Preferences */}
      <section className="mx-auto max-w-2xl">
        <FilterPanel filters={filters} onChange={setFilters} disabled={busy} />
      </section>
    </div>
  );
}
