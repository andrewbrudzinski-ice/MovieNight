import { NextResponse } from "next/server";

import { discoverMovies, isTmdbConfigured } from "@/lib/tmdb";

// Poster URLs used purely to seed the shuffle animation. The route renders
// per-request (so it isn't frozen empty at build time), but the underlying
// TMDB calls are served from Next's data cache — see discoverMovies' revalidate.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isTmdbConfigured()) {
    return NextResponse.json({ posters: [] });
  }
  try {
    const [a, b] = await Promise.all([
      discoverMovies({ voteCountGte: 1000, sortBy: "popularity.desc", page: 1 }),
      discoverMovies({ voteCountGte: 1000, sortBy: "vote_average.desc", page: 1 }),
    ]);
    const posters = [...a.movies, ...b.movies]
      .map((m) => m.posterUrl)
      .filter((u): u is string => !!u)
      .slice(0, 30);
    return NextResponse.json({ posters });
  } catch {
    return NextResponse.json({ posters: [] });
  }
}
