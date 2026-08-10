import "server-only";

import { logoUrl, tmdbFetch } from "@/lib/tmdb";
import type {
  StreamingAvailability,
  StreamingProvider,
} from "@/types/streaming";

/**
 * Provider-agnostic streaming-availability abstraction.
 *
 * Today this is backed by TMDB's `/movie/{id}/watch/providers` endpoint (data
 * powered by JustWatch). The UI never sees TMDB's raw shape — it consumes the
 * normalized `StreamingAvailability`. To swap in a dedicated availability
 * provider later, reimplement `getStreamingAvailability` and keep the return
 * shape.
 *
 * Availability varies by country and changes often, so this is fetched
 * dynamically with a short revalidation window and never persisted client-side.
 */

interface RawProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
}

interface RawCountryProviders {
  link?: string;
  flatrate?: RawProvider[];
  free?: RawProvider[];
  ads?: RawProvider[];
  rent?: RawProvider[];
  buy?: RawProvider[];
}

interface RawWatchProvidersResponse {
  id: number;
  results: Record<string, RawCountryProviders>;
}

function mapProviders(
  raw: RawProvider[] | undefined,
  link: string | null,
): StreamingProvider[] {
  if (!raw) return [];
  return raw
    .slice()
    .sort((a, b) => (a.display_priority ?? 99) - (b.display_priority ?? 99))
    .map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logoUrl: logoUrl(p.logo_path),
      // TMDB exposes only a per-title JustWatch link (not per-provider deep
      // links). We surface that rather than fabricating a provider URL.
      link,
    }));
}

/** De-duplicate providers by id, preserving order. */
function dedupe(providers: StreamingProvider[]): StreamingProvider[] {
  const seen = new Set<number>();
  const out: StreamingProvider[] = [];
  for (const p of providers) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

/**
 * Normalized availability for a movie in a country, or `null` if the provider
 * has no data for that country. Throwing is reserved for genuine fetch errors
 * so callers can distinguish "no availability" from "couldn't verify".
 */
export async function getStreamingAvailability(
  movieId: number,
  country = "US",
  signal?: AbortSignal,
): Promise<StreamingAvailability | null> {
  const data = await tmdbFetch<RawWatchProvidersResponse>(
    `/movie/${movieId}/watch/providers`,
    {},
    { revalidate: 60 * 30, signal },
  );

  const region = data.results?.[country.toUpperCase()];
  if (!region) return null;

  const link = region.link ?? null;

  // Free = truly-free + ad-supported (Tubi, Pluto TV, Freevee, Roku Channel).
  const free = dedupe([
    ...mapProviders(region.free, link),
    ...mapProviders(region.ads, link),
  ]);

  return {
    country: country.toUpperCase(),
    free,
    subscription: dedupe(mapProviders(region.flatrate, link)),
    rent: dedupe(mapProviders(region.rent, link)),
    buy: dedupe(mapProviders(region.buy, link)),
    link,
  };
}
