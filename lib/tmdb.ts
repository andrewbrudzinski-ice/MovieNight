import "server-only";

import type { Genre, Movie } from "@/types/movie";

/**
 * Server-side TMDB abstraction.
 *
 * This is the ONLY module that knows about TMDB's raw API shape. Everything
 * else in the app consumes the normalized `Movie` / `Genre` types, so the
 * movie provider can be swapped later without touching the UI.
 *
 * The TMDB API key is read from the server-only `TMDB_API_KEY` env var and is
 * never sent to the client.
 */

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export class TmdbError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
  }
}

export class TmdbConfigError extends Error {
  constructor(message = "TMDB_API_KEY is not configured") {
    super(message);
    this.name = "TmdbConfigError";
  }
}

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY?.trim();
  if (!key) throw new TmdbConfigError();
  return key;
}

/**
 * A TMDB v4 read-access token is a long JWT (starts with "eyJ"). A v3 API key
 * is short. We support both: JWT -> Bearer header, short key -> api_key query.
 */
function isBearerToken(key: string): boolean {
  return key.startsWith("eyJ") || key.length > 60;
}

interface TmdbFetchOptions {
  /** Next.js revalidate window in seconds. */
  revalidate?: number;
  signal?: AbortSignal;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  options: TmdbFetchOptions = {},
): Promise<T> {
  const key = getApiKey();
  const url = new URL(`${TMDB_BASE}${path}`);

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = { accept: "application/json" };
  if (isBearerToken(key)) {
    headers.authorization = `Bearer ${key}`;
  } else {
    url.searchParams.set("api_key", key);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers,
      signal: options.signal,
      next: { revalidate: options.revalidate ?? 60 * 60 },
    });
  } catch (err) {
    throw new TmdbError(
      `Network error contacting TMDB: ${(err as Error).message}`,
      503,
    );
  }

  if (res.status === 401) {
    throw new TmdbError("TMDB rejected the API credentials (401).", 401);
  }
  if (!res.ok) {
    throw new TmdbError(`TMDB request failed (${res.status}).`, res.status);
  }
  return (await res.json()) as T;
}

export function isTmdbConfigured(): boolean {
  return !!process.env.TMDB_API_KEY?.trim();
}

// ---------------------------------------------------------------------------
// Image helpers
// ---------------------------------------------------------------------------

export function posterUrl(path: string | null, size = "w500"): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function backdropUrl(path: string | null, size = "w1280"): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function logoUrl(path: string | null, size = "w92"): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

// ---------------------------------------------------------------------------
// Raw TMDB response shapes (kept private to this module)
// ---------------------------------------------------------------------------

interface RawMovieListItem {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  runtime?: number | null;
}

interface RawMovieDetail extends RawMovieListItem {
  runtime: number | null;
  genres: { id: number; name: string }[];
  tagline?: string;
}

interface RawDiscoverResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: RawMovieListItem[];
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

let genreCache: Map<number, string> | null = null;

function yearFromDate(date?: string | null): number | null {
  if (!date) return null;
  const y = Number(date.slice(0, 4));
  return Number.isFinite(y) && y > 0 ? y : null;
}

function normalizeListItem(raw: RawMovieListItem, genreMap: Map<number, string>): Movie {
  return {
    id: raw.id,
    title: raw.title,
    originalTitle:
      raw.original_title && raw.original_title !== raw.title
        ? raw.original_title
        : undefined,
    overview: raw.overview ?? "",
    posterUrl: posterUrl(raw.poster_path),
    backdropUrl: backdropUrl(raw.backdrop_path),
    year: yearFromDate(raw.release_date),
    releaseDate: raw.release_date ?? null,
    rating: raw.vote_average ?? 0,
    voteCount: raw.vote_count ?? 0,
    runtime: raw.runtime ?? null,
    genres: (raw.genre_ids ?? []).map((id) => ({
      id,
      name: genreMap.get(id) ?? "",
    })),
    popularity: raw.popularity ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Movie genres. Cached in-process and revalidated daily by Next. */
export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>(
    "/genre/movie/list",
    { language: "en-US" },
    { revalidate: 60 * 60 * 24 },
  );
  genreCache = new Map(data.genres.map((g) => [g.id, g.name]));
  return data.genres;
}

async function getGenreMap(): Promise<Map<number, string>> {
  if (genreCache) return genreCache;
  await getGenres();
  return genreCache ?? new Map();
}

export interface DiscoverParams {
  withGenres?: number[];
  voteAverageGte?: number;
  voteCountGte?: number;
  releaseDateGte?: string;
  releaseDateLte?: string;
  runtimeGte?: number;
  runtimeLte?: number;
  sortBy?: string;
  page?: number;
  /** When set, only titles with a free/ads monetization type in the region. */
  freeOnly?: boolean;
  watchRegion?: string;
}

export interface DiscoverResult {
  page: number;
  totalPages: number;
  totalResults: number;
  movies: Movie[];
}

export async function discoverMovies(
  params: DiscoverParams,
  options: TmdbFetchOptions = {},
): Promise<DiscoverResult> {
  const genreMap = await getGenreMap();

  const query: Record<string, string | number | boolean | undefined> = {
    include_adult: false,
    include_video: false,
    language: "en-US",
    sort_by: params.sortBy ?? "popularity.desc",
    page: params.page ?? 1,
    "vote_count.gte": params.voteCountGte,
    "vote_average.gte": params.voteAverageGte,
    "primary_release_date.gte": params.releaseDateGte,
    "primary_release_date.lte": params.releaseDateLte,
    "with_runtime.gte": params.runtimeGte,
    "with_runtime.lte": params.runtimeLte,
  };

  if (params.withGenres && params.withGenres.length > 0) {
    query.with_genres = params.withGenres.join(",");
  }
  if (params.freeOnly) {
    query.watch_region = params.watchRegion ?? "US";
    // "free" = no-cost with signup, "ads" = ad-supported (Tubi/Pluto/Freevee).
    query.with_watch_monetization_types = "free|ads";
  }

  const data = await tmdbFetch<RawDiscoverResponse>("/discover/movie", query, {
    revalidate: params.freeOnly ? 60 * 30 : 60 * 60,
    signal: options.signal,
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    movies: data.results.map((m) => normalizeListItem(m, genreMap)),
  };
}

/** Full movie detail (adds runtime, genres, tagline) by id. */
export async function getMovieDetail(
  id: number,
  options: TmdbFetchOptions = {},
): Promise<Movie> {
  const raw = await tmdbFetch<RawMovieDetail>(
    `/movie/${id}`,
    { language: "en-US" },
    { revalidate: 60 * 60 * 24, signal: options.signal },
  );

  return {
    id: raw.id,
    title: raw.title,
    originalTitle:
      raw.original_title && raw.original_title !== raw.title
        ? raw.original_title
        : undefined,
    overview: raw.overview ?? "",
    posterUrl: posterUrl(raw.poster_path),
    backdropUrl: backdropUrl(raw.backdrop_path),
    year: yearFromDate(raw.release_date),
    releaseDate: raw.release_date ?? null,
    rating: raw.vote_average ?? 0,
    voteCount: raw.vote_count ?? 0,
    runtime: raw.runtime ?? null,
    genres: (raw.genres ?? []).map((g) => ({ id: g.id, name: g.name })),
    popularity: raw.popularity ?? 0,
    tagline: raw.tagline || undefined,
  };
}

// Re-exported for the streaming module (same TMDB fetch plumbing).
export { tmdbFetch };
