import type { StreamingAvailability } from "./streaming";

/**
 * Genre as exposed by the app. Ids match TMDB genre ids but the app should
 * treat them as opaque so the provider can be swapped later.
 */
export interface Genre {
  id: number;
  name: string;
}

/**
 * Normalized movie shape used across the app. Intentionally decoupled from any
 * single provider's raw response — see lib/tmdb.ts for the mapping.
 */
export interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  year: number | null;
  releaseDate: string | null;
  rating: number; // 0–10
  voteCount: number;
  runtime: number | null; // minutes
  genres: Genre[];
  popularity: number;
  tagline?: string;
}

/**
 * A movie plus its streaming availability, as returned to the result screen.
 */
export interface MovieWithStreaming extends Movie {
  streaming: StreamingAvailability | null;
  /** True when we could not verify availability (vs. verified-but-empty). */
  streamingUnavailable?: boolean;
}

export type RatingFilter = "any" | "6" | "7" | "8";

export type DecadeFilter = "any" | "2020s" | "2010s" | "2000s" | "1990s" | "older";

export type RuntimeFilter = "any" | "under90" | "90to120" | "120to150" | "over150";

export interface MovieFilters {
  genres: number[];
  rating: RatingFilter;
  decade: DecadeFilter;
  runtime: RuntimeFilter;
  freeOnly: boolean;
  /** Optional "Surprise Me" preset that overrides the discover criteria. */
  surprise?: SurpriseMode | null;
  country?: string;
}

export type SurpriseMode =
  | "hidden-gem"
  | "classic"
  | "cult-favorite"
  | "wild-card"
  | "highly-rated"
  | "date-night"
  | "family-night";

/** A saved watchlist entry (persisted in localStorage). */
export interface WatchlistItem {
  id: number;
  title: string;
  posterUrl: string | null;
  year: number | null;
  rating: number;
  savedAt: number;
}
