"use client";

import { useEffect, useState } from "react";

import { track } from "@/lib/analytics";
import { isSaved, subscribe, toggleWatchlist } from "@/lib/watchlist";
import { cn } from "@/lib/utils";
import type { Movie } from "@/types/movie";

export default function WatchlistButton({
  movie,
  variant = "full",
}: {
  movie: Movie;
  variant?: "full" | "icon";
}) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setSaved(isSaved(movie.id));
    update();
    return subscribe(update);
  }, [movie.id]);

  const onClick = () => {
    const nowSaved = toggleWatchlist(movie);
    setSaved(nowSaved);
    track(nowSaved ? "movie_saved" : "movie_unsaved", { id: movie.id });
  };

  const label = saved ? "Saved to watchlist" : "Save to watchlist";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition active:scale-95",
          saved
            ? "border-rose-400/40 bg-rose-500/20 text-rose-300"
            : "border-white/20 bg-black/40 text-white hover:bg-black/60",
        )}
      >
        <span aria-hidden>{saved ? "❤️" : "🤍"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      className={cn(
        "btn-secondary w-full sm:w-auto",
        saved && "border-rose-400/40 bg-rose-500/10 text-rose-200",
      )}
    >
      <span aria-hidden>{saved ? "❤️" : "🤍"}</span>
      {/* suppressHydrationWarning: saved state comes from localStorage */}
      <span suppressHydrationWarning>
        {mounted && saved ? "Saved" : "Save to watchlist"}
      </span>
    </button>
  );
}
