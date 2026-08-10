"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import EmptyState from "@/components/EmptyState";
import Poster from "@/components/Poster";
import { track } from "@/lib/analytics";
import {
  getWatchlist,
  removeFromWatchlist,
  subscribe,
} from "@/lib/watchlist";
import { formatRating } from "@/lib/utils";
import type { StreamingAvailability } from "@/types/streaming";
import type { WatchlistItem } from "@/types/movie";

export default function WatchlistView() {
  const [items, setItems] = useState<WatchlistItem[] | null>(null);
  const [freeMap, setFreeMap] = useState<Record<number, string[]>>({});

  useEffect(() => {
    const update = () => setItems(getWatchlist());
    update();
    return subscribe(update);
  }, []);

  // Lazily verify current free availability for saved titles (best-effort).
  useEffect(() => {
    if (!items || items.length === 0) return;
    let active = true;
    (async () => {
      const country = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ?? "US";
      const results = await Promise.all(
        items.map(async (m) => {
          try {
            const res = await fetch(`/api/streaming/${m.id}?country=${country}`);
            if (!res.ok) return [m.id, []] as const;
            const data = (await res.json()) as {
              availability: StreamingAvailability | null;
            };
            const free = data.availability?.free.map((p) => p.name) ?? [];
            return [m.id, free] as const;
          } catch {
            return [m.id, []] as const;
          }
        }),
      );
      if (active) setFreeMap(Object.fromEntries(results));
    })();
    return () => {
      active = false;
    };
  }, [items]);

  if (items === null) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer aspect-[2/3] rounded-2xl bg-ink-800" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your watchlist is empty"
        message="Save movies you want to watch and they'll show up here — with a fresh check on where they're free."
        action={
          <Link href="/" className="btn-primary">
            🎲 Pick a movie
          </Link>
        }
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((m) => {
        const free = freeMap[m.id];
        const rating = formatRating(m.rating);
        return (
          <li key={m.id} className="group card overflow-hidden">
            <div className="relative">
              <Poster
                src={m.posterUrl}
                alt={`${m.title} poster`}
                rounded="rounded-none"
                sizes="(max-width: 640px) 50vw, 200px"
              />
              <button
                type="button"
                onClick={() => {
                  removeFromWatchlist(m.id);
                  track("movie_unsaved", { id: m.id, from: "watchlist" });
                }}
                aria-label={`Remove ${m.title} from watchlist`}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/50 text-sm text-white backdrop-blur transition hover:bg-rose-500/80"
              >
                <span aria-hidden>✕</span>
              </button>
              {free && free.length > 0 && (
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full border border-freon/40 bg-black/70 px-2 py-0.5 text-xs font-bold text-freon backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-freon" aria-hidden />
                  Free · {free[0]}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold" title={m.title}>
                {m.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {m.year ?? "—"}
                {rating && (
                  <>
                    {" · "}
                    <span className="text-popcorn">⭐ {rating}</span>
                  </>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
