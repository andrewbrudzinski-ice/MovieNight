# 🍿 Movie Night

**Stop scrolling. Start watching.**

Movie Night picks a movie for you and tells you exactly where to watch it —
prioritizing the free options. Press one button, get a great recommendation in
about five seconds, and see whether it's streaming free tonight.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## What it does

- **One-button picks.** A big *Pick a Movie* button runs a satisfying shuffle
  animation and reveals a single, well-chosen movie.
- **Free-first streaming.** Every result shows where to watch, with free
  services (Tubi, Pluto TV, Freevee, The Roku Channel, …) surfaced first, then
  subscription, rent, and buy.
- **Smart randomizer.** Picks from a quality pool (good ratings, enough votes,
  complete metadata, real poster + description) and never repeats your recent
  picks. Random enough to be fun, curated enough that you never get garbage.
- **Filters.** Genre (multi-select), minimum rating, decade, runtime, and a
  prominent *only show movies I can watch for free* toggle.
- **Surprise Me modes.** Hidden Gem, Highly Rated, Classic, Cult Favorite, Date
  Night, Family Night, Wild Card.
- **Watchlist.** Save movies (localStorage, no account needed). The watchlist
  re-checks where each title is free right now.
- **Polished everywhere.** Cinematic dark theme, loading skeletons, empty and
  error states, full keyboard access, and mobile-first responsive layout.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3** for styling
- **TMDB** (The Movie Database) for movie data and streaming availability
  (powered by JustWatch), behind a provider-agnostic abstraction
- No database required — the watchlist is client-side. Architecture is
  account-ready if you want to add auth/sync later (e.g. Supabase).

## Required APIs & environment variables

Movie Night needs a single credential: a **TMDB API key**.

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/).
2. Get a key at **Settings → API**. Either works:
   - a **v3 API key** (short), or
   - a **v4 Read Access Token** (long, JWT-style) — sent as a Bearer token.
3. Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

```env
# .env.local
TMDB_API_KEY=your_key_here
NEXT_PUBLIC_DEFAULT_COUNTRY=US   # optional, defaults to US
```

The key is **server-side only** — it is never exposed to the browser. All TMDB
calls happen in Next.js route handlers / server modules.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then add your TMDB_API_KEY
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build
npm run start       # run the production build
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
```

## How it's structured

```
app/
  page.tsx                 Home (hero + randomizer)
  watchlist/page.tsx       Saved movies
  about/page.tsx           About
  api/
    movies/random          POST → pick a movie + streaming (never cached)
    movies/reel            GET  → poster URLs to seed the shuffle animation
    streaming/[id]         GET  → normalized availability for a movie
    genres                 GET  → genre list (cached daily)
components/                MovieRandomizer, MovieResult, FilterPanel,
                           StreamingProviders, WatchlistButton, PickAnimation, …
lib/
  tmdb.ts                  ONLY module that knows TMDB's raw shape
  streaming.ts             provider-agnostic availability abstraction
  randomizer.ts            the pick engine (pool → weighted sample)
  watchlist.ts             localStorage watchlist
  history.ts               recent-pick memory (anti-repeat)
  analytics.ts             pluggable, privacy-friendly event shim
  utils.ts
types/                     movie.ts, streaming.ts
```

### Swapping the movie / streaming provider

The UI never touches a raw TMDB response — it consumes the normalized `Movie`
and `StreamingAvailability` types. To change providers, reimplement `lib/tmdb.ts`
and/or `lib/streaming.ts` and keep the return shapes. Nothing else changes.

### Caching

- Genre and provider metadata: cached ~1 day.
- Discover / metadata queries: cached ~1 hour via Next's data cache.
- **Streaming availability: ~30 min** (it changes often).
- The random pick route is `force-dynamic` so you get a fresh pick every click.

### Analytics

`lib/analytics.ts` emits anonymous events (`movie_picked`, `pick_another`,
`filter_used`, `movie_saved`, `provider_clicked`, `surprise_me`, …). By default
it no-ops in production and logs in dev. Point `window.__movieNightAnalytics` at
your provider to capture them, or call `setAnalyticsEnabled(false)` to disable.
No personal data is collected.

## Product rules honored

Movie Night never invents movie information, streaming availability, or provider
links. TMDB exposes a per-title JustWatch watch link (not per-provider deep
links), so *Watch now* uses that verified link. If availability can't be
verified, the UI says so rather than guessing. A movie is only shown as *free*
when the provider data actually reports a free/ad-supported option.

## Limitations & notes

- **Watch links** use TMDB's per-title JustWatch link (the most specific link
  the data source provides); TMDB does not expose per-provider deep links.
- Availability is **US by default** and varies by region; the architecture
  already accepts a `country` param end-to-end for adding more regions.
- The watchlist is per-browser (localStorage). Add auth to sync across devices.
- Requires outbound network access to `api.themoviedb.org` and
  `image.tmdb.org`. In a locked-down/sandboxed environment those hosts must be
  allowlisted for picks and posters to load.

## Recommended next steps

- Add country selection in the UI (backend already supports it).
- Add Supabase (or similar) auth so watchlists sync across devices.
- Integrate a dedicated streaming-availability API for per-provider deep links.
- Wire the analytics shim to a real, privacy-friendly provider.
- Add trailers (TMDB videos) and cast to the result screen.
- Add a `/movie/[id]` shareable permalink page.

---

Movie data & streaming availability by [TMDB](https://www.themoviedb.org/) and
JustWatch. This product uses the TMDB API but is not endorsed or certified by
TMDB.
