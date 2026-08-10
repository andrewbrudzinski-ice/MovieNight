import { NextResponse } from "next/server";

import { getStreamingAvailability } from "@/lib/streaming";
import { isTmdbConfigured } from "@/lib/tmdb";

export const revalidate = 1800; // availability changes; refresh every 30 min

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isTmdbConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "TMDB_API_KEY is not set." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isFinite(movieId) || movieId <= 0) {
    return NextResponse.json(
      { error: "bad_request", message: "Invalid movie id." },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  const country = (url.searchParams.get("country") ?? "US").toUpperCase();

  try {
    const availability = await getStreamingAvailability(movieId, country);
    return NextResponse.json({ availability });
  } catch {
    return NextResponse.json(
      {
        error: "unavailable",
        message: "Streaming availability couldn't be verified right now.",
      },
      { status: 502 },
    );
  }
}
