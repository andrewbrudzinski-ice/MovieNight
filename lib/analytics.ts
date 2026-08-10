"use client";

/**
 * Minimal, privacy-friendly analytics shim.
 *
 * No personal data is collected. Events are emitted to any injected sink
 * (`window.__movieNightAnalytics`) or to the console in development, and are a
 * no-op otherwise. Swap in a real provider by assigning the sink — nothing else
 * in the app changes.
 */

export type AnalyticsEvent =
  | "movie_picked"
  | "pick_another"
  | "filter_used"
  | "movie_saved"
  | "movie_unsaved"
  | "provider_clicked"
  | "surprise_me"
  | "free_only_toggled";

type Sink = (event: AnalyticsEvent, props?: Record<string, unknown>) => void;

declare global {
  interface Window {
    __movieNightAnalytics?: Sink;
  }
}

let enabled = true;

export function setAnalyticsEnabled(value: boolean): void {
  enabled = value;
}

export function track(
  event: AnalyticsEvent,
  props: Record<string, unknown> = {},
): void {
  if (!enabled || typeof window === "undefined") return;
  try {
    if (typeof window.__movieNightAnalytics === "function") {
      window.__movieNightAnalytics(event, props);
    } else if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, props);
    }
  } catch {
    /* analytics must never break the app */
  }
}
