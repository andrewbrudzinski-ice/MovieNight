"use client";

/**
 * Recent-selection history so "Pick Another" doesn't repeat the same movies
 * (spec §28). Kept in sessionStorage — it's a per-visit anti-repeat memory,
 * not something worth persisting forever.
 */

const KEY = "movie-night:recent";
const MAX = 12;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getRecent(): number[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
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
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
  return next;
}
