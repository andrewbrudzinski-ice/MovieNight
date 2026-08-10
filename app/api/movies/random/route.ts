import { NextResponse } from "next/server";

import { pickMovie } from "@/lib/randomizer";
import { getStreamingAvailability } from "@/lib/streaming";
import { getMovieDetail, isTmdbConfigured, TmdbError } from "@/lib/tmdb";
import { hasFreeOption } from "@/types/streaming";
import type {
  DecadeFilter,
  MovieFilters,
  MovieWithStreaming,
  RatingFilter,
  RuntimeFilter,
  SurpriseMode,
} from "@/types/movie";

export const dynamic = "force-dynamic"; // randomization must not be cached

const RATINGS: RatingFilter[] = ["any", "6", "7", "8"];
const DECADES: DecadeFilter[] = ["any", "2020s", "2010s", "2000s", "1990s", "older"];
const RUNTIMES: RuntimeFilter[] = ["any", "under90", "90to120", "120to150", "over150"];
const SURPRISES: SurpriseMode[] = [
  "hidden-gem",
  "classic",
  "cult-favorite",
  "wild-card",
  "highly-rated",
  "date-night",
  "family-night",
];

function parseFilters(body: unknown): { filters: MovieFilters; recentIds: number[] } {
  const b = (body ?? {}) as Record<string, unknown>;
  const rawFilters = (b.filters ?? {}) as Record<string, unknown>;

  const genres = Array.isArray(rawFilters.genres)
    ? rawFilters.genres.map(Number).filter((n) => Number.isFinite(n))
    : [];

  const rating = RATINGS.includes(rawFilters.rating as RatingFilter)
    ? (rawFilters.rating as RatingFilter)
    : "any";
  const decade = DECADES.includes(rawFilters.decade as DecadeFilter)
    ? (rawFilters.decade as DecadeFilter)
    : "any";
  const runtime = RUNTIMES.includes(rawFilters.runtime as RuntimeFilter)
    ? (rawFilters.runtime as RuntimeFilter)
    : "any";
  const surprise = SURPRISES.includes(rawFilters.surprise as SurpriseMode)
    ? (rawFilters.surprise as SurpriseMode)
    : null;

  const country =
    typeof rawFilters.country === "string" && rawFilters.country.length === 2
      ? rawFilters.country.toUpperCase()
      : "US";

  const recentIds = Array.isArray(b.recentIds)
    ? b.recentIds.map(Number).filter((n) => Number.isFinite(n))
    : [];

  return {
    filters: {
      genres,
      rating,
      decade,
      runtime,
      freeOnly: rawFilters.freeOnly === true,
      surprise,
      country,
    },
    recentIds,
  };
}

export async function POST(request: Request) {
  if (!isTmdbConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "TMDB is not configured. Add TMDB_API_KEY to your environment to enable picks.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { filters, recentIds } = parseFilters(body);

  try {
    const pick = await pickMovie(filters, recentIds);

    if (!pick.movie) {
      return NextResponse.json(
        {
          error: "no_results",
          message: "No movies matched those filters.",
          suggestion: "Try removing one filter.",
        },
        { status: 404 },
      );
    }

    const country = filters.country ?? "US";

    // Fetch full detail (runtime, tagline) and streaming in parallel.
    const [detail, streaming] = await Promise.allSettled([
      getMovieDetail(pick.movie.id),
      getStreamingAvailability(pick.movie.id, country),
    ]);

    const base =
      detail.status === "fulfilled"
        ? { ...pick.movie, ...detail.value }
        : pick.movie;

    let streamingValue = null;
    let streamingUnavailable = false;
    if (streaming.status === "fulfilled") {
      streamingValue = streaming.value;
    } else {
      streamingUnavailable = true;
    }

    // Free-only guarantee: the discover query already filters to free titles,
    // but availability can lag. If the user demanded free and we can't confirm
    // a free option, transparently retry a couple of times rather than lying.
    if (filters.freeOnly && !hasFreeOption(streamingValue)) {
      const retried = await retryForFree(filters, [
        ...recentIds,
        pick.movie.id,
      ]);
      if (retried) {
        return NextResponse.json(retried satisfies { movie: MovieWithStreaming });
      }
      // Fall through: return what we have but flag it honestly.
    }

    const result: MovieWithStreaming = {
      ...base,
      streaming: streamingValue,
      streamingUnavailable,
    };

    return NextResponse.json({ movie: result });
  } catch (err) {
    if (err instanceof TmdbError && err.status === 401) {
      return NextResponse.json(
        {
          error: "bad_credentials",
          message: "TMDB rejected the API credentials. Check TMDB_API_KEY.",
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        error: "upstream_error",
        message: "Couldn't reach the movie service. Please try again.",
      },
      { status: 502 },
    );
  }
}

/** Try up to 3 more times to find a movie with a confirmed free option. */
async function retryForFree(
  filters: MovieFilters,
  seen: number[],
): Promise<{ movie: MovieWithStreaming } | null> {
  const country = filters.country ?? "US";
  const exclude = [...seen];
  for (let i = 0; i < 3; i++) {
    const pick = await pickMovie(filters, exclude);
    if (!pick.movie) return null;
    exclude.push(pick.movie.id);
    try {
      const [detail, streaming] = await Promise.allSettled([
        getMovieDetail(pick.movie.id),
        getStreamingAvailability(pick.movie.id, country),
      ]);
      if (streaming.status === "fulfilled" && hasFreeOption(streaming.value)) {
        const base =
          detail.status === "fulfilled"
            ? { ...pick.movie, ...detail.value }
            : pick.movie;
        return {
          movie: {
            ...base,
            streaming: streaming.value,
            streamingUnavailable: false,
          },
        };
      }
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}
