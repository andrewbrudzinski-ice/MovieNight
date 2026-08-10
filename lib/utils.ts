import type { Movie } from "@/types/movie";

/** Format runtime in minutes as "2h 32m" / "48m". */
export function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** One-decimal rating, e.g. 8 -> "8.0". */
export function formatRating(rating: number | null | undefined): string | null {
  if (!rating || rating <= 0) return null;
  return rating.toFixed(1);
}

/** Small, tasteful personality line for the result screen (spec §27). */
export function funNote(movie: Movie): string | null {
  if (movie.rating >= 8 && movie.voteCount >= 1000) return "This one's a banger. 🔥";
  if (movie.year && movie.year <= 1999 && movie.rating >= 7.5)
    return "A certified classic. 🎬";
  if (movie.runtime && movie.runtime < 90)
    return "Perfect if you don't have all night.";
  if (movie.runtime && movie.runtime > 150) return "Settle in — this is a long one.";
  if (movie.rating >= 7.5) return "Critically, a solid pick. 👌";
  return null;
}

/** Clamp helper. */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Build a compact class-name string, dropping falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
