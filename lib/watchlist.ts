"use client";

import type { Movie, WatchlistItem } from "@/types/movie";

/**
 * Lightweight, anonymous watchlist backed by localStorage.
 *
 * No auth required for v1 (spec §16). The shape is deliberately account-ready:
 * to add server-side sync later, back these functions with an API and keep the
 * same signatures.
 */

const KEY = "movie-night:watchlist";
const EVENT = "movie-night:watchlist-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getWatchlist(): WatchlistItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WatchlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: WatchlistItem[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function isSaved(id: number): boolean {
  return getWatchlist().some((m) => m.id === id);
}

export function addToWatchlist(movie: Movie): WatchlistItem[] {
  const items = getWatchlist();
  if (items.some((m) => m.id === movie.id)) return items;
  const entry: WatchlistItem = {
    id: movie.id,
    title: movie.title,
    posterUrl: movie.posterUrl,
    year: movie.year,
    rating: movie.rating,
    savedAt: Date.now(),
  };
  const next = [entry, ...items];
  save(next);
  return next;
}

export function removeFromWatchlist(id: number): WatchlistItem[] {
  const next = getWatchlist().filter((m) => m.id !== id);
  save(next);
  return next;
}

export function toggleWatchlist(movie: Movie): boolean {
  if (isSaved(movie.id)) {
    removeFromWatchlist(movie.id);
    return false;
  }
  addToWatchlist(movie);
  return true;
}

/** Subscribe to changes (same-tab custom event + cross-tab storage event). */
export function subscribe(listener: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => listener();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
