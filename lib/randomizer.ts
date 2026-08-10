import "server-only";

import { discoverMovies, type DiscoverParams } from "@/lib/tmdb";
import type {
  DecadeFilter,
  Movie,
  MovieFilters,
  RatingFilter,
  RuntimeFilter,
  SurpriseMode,
} from "@/types/movie";

/**
 * The randomization engine.
 *
 * Design goals (see build spec §9, §28):
 *  - Random enough to be fun, good enough that users never get garbage.
 *  - Filters shape a *pool*, we then weight-sample from it.
 *  - Never return a movie the user has just seen (recent-history exclusion).
 *  - Every returned movie has complete, usable metadata (poster + overview).
 */

const CURRENT_YEAR = new Date().getFullYear();

// Baseline quality floor so we never surface broken/obscure entries by default.
const DEFAULT_MIN_VOTES = 200;

function ratingFloor(rating: RatingFilter): number | undefined {
  switch (rating) {
    case "6":
      return 6;
    case "7":
      return 7;
    case "8":
      return 8;
    default:
      return undefined;
  }
}

function decadeRange(decade: DecadeFilter): {
  gte?: string;
  lte?: string;
} {
  switch (decade) {
    case "2020s":
      return { gte: "2020-01-01", lte: `${CURRENT_YEAR}-12-31` };
    case "2010s":
      return { gte: "2010-01-01", lte: "2019-12-31" };
    case "2000s":
      return { gte: "2000-01-01", lte: "2009-12-31" };
    case "1990s":
      return { gte: "1990-01-01", lte: "1999-12-31" };
    case "older":
      return { lte: "1989-12-31" };
    default:
      return {};
  }
}

function runtimeRange(runtime: RuntimeFilter): {
  gte?: number;
  lte?: number;
} {
  switch (runtime) {
    case "under90":
      return { lte: 89 };
    case "90to120":
      return { gte: 90, lte: 120 };
    case "120to150":
      return { gte: 121, lte: 150 };
    case "over150":
      return { gte: 151 };
    default:
      return {};
  }
}

/**
 * "Surprise Me" presets. Each returns partial discover params that layer on top
 * of the base criteria. Adding a new mode here requires no randomizer changes.
 */
function surpriseParams(mode: SurpriseMode): Partial<DiscoverParams> & {
  genres?: number[];
} {
  switch (mode) {
    case "hidden-gem":
      // Well-rated but not blockbuster-popular.
      return { voteAverageGte: 7, voteCountGte: 300, sortBy: "vote_average.desc" };
    case "classic":
      return {
        voteAverageGte: 7.5,
        voteCountGte: 800,
        releaseDateLte: "1999-12-31",
        sortBy: "vote_average.desc",
      };
    case "cult-favorite":
      return { voteAverageGte: 6.5, voteCountGte: 400, sortBy: "vote_count.desc" };
    case "highly-rated":
      return { voteAverageGte: 8, voteCountGte: 1000, sortBy: "vote_average.desc" };
    case "date-night":
      return { voteAverageGte: 6.5, voteCountGte: 400, genres: [10749, 35] };
    case "family-night":
      return { voteAverageGte: 6.5, voteCountGte: 300, genres: [10751, 16] };
    case "wild-card":
    default:
      return { voteCountGte: 150, sortBy: "popularity.desc" };
  }
}

export function filtersToDiscoverParams(filters: MovieFilters): DiscoverParams {
  const base: DiscoverParams = {
    withGenres: filters.genres,
    voteAverageGte: ratingFloor(filters.rating),
    voteCountGte: DEFAULT_MIN_VOTES,
    sortBy: "popularity.desc",
    freeOnly: filters.freeOnly,
    watchRegion: filters.country ?? "US",
  };

  const decade = decadeRange(filters.decade);
  if (decade.gte) base.releaseDateGte = decade.gte;
  if (decade.lte) base.releaseDateLte = decade.lte;

  const runtime = runtimeRange(filters.runtime);
  if (runtime.gte) base.runtimeGte = runtime.gte;
  if (runtime.lte) base.runtimeLte = runtime.lte;

  if (filters.surprise) {
    const s = surpriseParams(filters.surprise);
    if (s.voteAverageGte !== undefined) base.voteAverageGte = s.voteAverageGte;
    if (s.voteCountGte !== undefined) base.voteCountGte = s.voteCountGte;
    if (s.releaseDateLte) base.releaseDateLte = s.releaseDateLte;
    if (s.sortBy) base.sortBy = s.sortBy;
    // Surprise-mode genres only apply when the user hasn't chosen their own.
    if (s.genres && filters.genres.length === 0) base.withGenres = s.genres;
  }

  return base;
}

/** A movie is "usable" only if it has the metadata that makes the card shine. */
function isUsable(movie: Movie): boolean {
  return (
    !!movie.posterUrl &&
    !!movie.overview &&
    movie.overview.length > 20 &&
    !!movie.title
  );
}

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

/**
 * Weighted pick that gently favors better-rated / more-popular titles so users
 * don't get garbage, while keeping enough entropy to stay fun.
 */
function weightedPick(pool: Movie[]): Movie {
  const weights = pool.map((m) => {
    const ratingBoost = Math.max(0.5, m.rating); // 0.5–10
    const popBoost = 1 + Math.log10(1 + m.popularity); // dampened
    return ratingBoost * popBoost;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export interface PickResult {
  movie: Movie | null;
  /** Total candidates discovered (before history exclusion). */
  poolSize: number;
  reason?: "empty" | "ok";
}

/**
 * Pick one movie matching the filters, excluding the recent-history ids.
 *
 * Strategy:
 *  1. Read page 1 to learn how many pages of results exist.
 *  2. Pick a random page within a sane cap (avoids the deep, obscure tail).
 *  3. Build a usable pool from that page, drop recently-seen ids.
 *  4. Weighted-sample the winner.
 */
export async function pickMovie(
  filters: MovieFilters,
  recentIds: number[] = [],
  signal?: AbortSignal,
): Promise<PickResult> {
  const params = filtersToDiscoverParams(filters);

  const firstPage = await discoverMovies({ ...params, page: 1 }, { signal });

  if (firstPage.totalResults === 0) {
    return { movie: null, poolSize: 0, reason: "empty" };
  }

  // Cap the page window: TMDB caps discover at 500 pages, and the further pages
  // hold increasingly obscure titles. Keep the fun-but-good balance.
  const maxPage = Math.min(firstPage.totalPages, 15);
  const targetPage = maxPage <= 1 ? 1 : 1 + randomInt(maxPage);

  let page = firstPage;
  if (targetPage !== 1) {
    try {
      page = await discoverMovies({ ...params, page: targetPage }, { signal });
    } catch {
      page = firstPage; // fall back to page 1 on any transient error
    }
  }

  const recent = new Set(recentIds);
  let pool = page.movies.filter(isUsable);

  // Prefer not repeating recent picks, but never fail purely because of it.
  const fresh = pool.filter((m) => !recent.has(m.id));
  if (fresh.length > 0) pool = fresh;

  if (pool.length === 0) {
    // The chosen page was thin; fall back to page 1's usable pool.
    const fallback = firstPage.movies
      .filter(isUsable)
      .filter((m) => !recent.has(m.id));
    const finalPool = fallback.length > 0 ? fallback : firstPage.movies.filter(isUsable);
    if (finalPool.length === 0) {
      return { movie: null, poolSize: firstPage.totalResults, reason: "empty" };
    }
    return {
      movie: weightedPick(finalPool),
      poolSize: firstPage.totalResults,
      reason: "ok",
    };
  }

  return {
    movie: weightedPick(pool),
    poolSize: firstPage.totalResults,
    reason: "ok",
  };
}
