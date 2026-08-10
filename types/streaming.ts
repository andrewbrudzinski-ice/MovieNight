/**
 * Provider-agnostic streaming types. The UI depends only on these shapes,
 * never on a raw TMDB / JustWatch response, so the data source can change.
 */

export type ProviderType = "free" | "subscription" | "rent" | "buy";

export interface StreamingProvider {
  /** Stable provider id (TMDB provider id today; opaque to the UI). */
  id: number;
  name: string;
  logoUrl: string | null;
  /**
   * Best available watch link. TMDB only exposes a per-title JustWatch link
   * (not per-provider deep links), so multiple providers may share it. We
   * never fabricate provider URLs.
   */
  link: string | null;
}

export interface StreamingAvailability {
  country: string;
  free: StreamingProvider[];
  subscription: StreamingProvider[];
  rent: StreamingProvider[];
  buy: StreamingProvider[];
  /** The provider-supplied landing link for this title in this country. */
  link: string | null;
}

export function hasFreeOption(a: StreamingAvailability | null | undefined): boolean {
  return !!a && a.free.length > 0;
}

export function hasAnyOption(a: StreamingAvailability | null | undefined): boolean {
  return (
    !!a &&
    (a.free.length > 0 ||
      a.subscription.length > 0 ||
      a.rent.length > 0 ||
      a.buy.length > 0)
  );
}
