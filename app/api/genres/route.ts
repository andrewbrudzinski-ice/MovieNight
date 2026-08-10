import { NextResponse } from "next/server";

import { getGenres, isTmdbConfigured } from "@/lib/tmdb";

export const revalidate = 86400; // genres change rarely

export async function GET() {
  if (!isTmdbConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "TMDB_API_KEY is not set." },
      { status: 503 },
    );
  }
  try {
    const genres = await getGenres();
    return NextResponse.json({ genres });
  } catch {
    return NextResponse.json(
      { error: "tmdb_error", message: "Could not load genres." },
      { status: 502 },
    );
  }
}
