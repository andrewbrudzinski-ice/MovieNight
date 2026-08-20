"use client";

/**
 * Recent-selection history so picks don't repeat the same movies (spec §28).
 *
 * Persisted in localStorage so the anti-repeat memory survives across visits,
 * not just the current tab — coming back tomorrow shouldn't hand you the same
 * movie you saw last night. Capped so it stays a rolling window; the randomizer
 * safely ignores it when a narrow filter would otherwise leave nothing.
 */

const KEY = "movie-night:recent";
const MAX = 40;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getRecent(): number[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecent(id: number): number[] {
  if (!isBrowser()) return [];
  const existing = getRecent().filter((x) => x !== id);
  const next = [id, ...existing].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
  return next;
}
