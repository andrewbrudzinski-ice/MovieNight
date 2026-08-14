"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import WatchlistButton from "@/components/WatchlistButton";
import { track } from "@/lib/analytics";
import { formatRating, formatRuntime, funNote } from "@/lib/utils";
import { hasFreeOption } from "@/types/streaming";
import type { StreamingProvider } from "@/types/streaming";
import type { MovieWithStreaming } from "@/types/movie";

export type ScreenStatus = "idle" | "picking" | "result" | "empty" | "error";

/**
 * Everything about the pick lives INSIDE the TV — like a smart-TV app's title
 * page. The frame/room around it lives in LivingRoomScene. Fixed 16:9 so the
 * scene never reflows between states.
 */
export default function TvScreen({
  status,
  movie,
  reel,
  errorMessage,
}: {
  status: ScreenStatus;
  movie: MovieWithStreaming | null;
  reel: string[];
  errorMessage?: string;
}) {
  return (
    <div className="tv-scanlines relative h-full w-full overflow-hidden bg-black">
      {status === "idle" && <Standby />}
      {status === "picking" && <ChannelSurf reel={reel} />}
      {status === "result" && movie && <NowPlaying movie={movie} />}
      {status === "empty" && (
        <NoSignal
          heading="No matches"
          line="Nothing on any channel with those filters."
          sub="Try removing one — the free-only toggle is a good start."
        />
      )}
      {status === "error" && (
        <NoSignal
          heading="No signal"
          line={errorMessage ?? "Couldn't tune in right now."}
          sub="Grab the remote and try again."
        />
      )}
    </div>
  );
}

function Standby() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(120%_100%_at_50%_0%,#161327_0%,#0b0a16_55%,#050409_100%)] text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500 sm:text-xs">
        Movie Night
      </p>
      <p className="px-6 text-base font-semibold text-slate-200 sm:text-2xl">
        Ready when you are
      </p>
      <p className="text-xs text-slate-500 sm:text-sm">
        Press the remote to pick tonight&apos;s movie
      </p>
    </div>
  );
}

function ChannelSurf({ reel }: { reel: string[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || reel.length === 0) return;

    let delay = 90;
    const tick = () => {
      setIndex((i) => (i + 1) % reel.length);
      delay = Math.min(delay * 1.06, 240);
      timer.current = setTimeout(tick, delay);
    };
    timer.current = setTimeout(tick, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reel]);

  const current = reel[index];

  return (
    <div
      className="tv-flicker relative flex h-full w-full items-center justify-center bg-black"
      role="status"
      aria-live="polite"
    >
      {current ? (
        <Image
          key={current}
          src={current}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover opacity-90"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neon/25 to-ink-900" />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <span className="relative rounded-full bg-black/60 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur">
        Finding your movie…
      </span>
    </div>
  );
}

function ProviderLogos({
  providers,
  max = 4,
}: {
  providers: StreamingProvider[];
  max?: number;
}) {
  const shown = providers.filter((p) => p.logoUrl).slice(0, max);
  if (shown.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      {shown.map((p) => (
        <Image
          key={p.id}
          src={p.logoUrl as string}
          alt={p.name}
          title={p.name}
          width={22}
          height={22}
          className="h-5 w-5 rounded-[5px] object-cover ring-1 ring-white/10 sm:h-6 sm:w-6"
        />
      ))}
    </div>
  );
}

function NowPlaying({ movie }: { movie: MovieWithStreaming }) {
  const runtime = formatRuntime(movie.runtime);
  const rating = formatRating(movie.rating);
  const note = funNote(movie);
  const s = movie.streaming;
  const free = hasFreeOption(s);
  const primaryFree = free ? s!.free[0] : null;
  const otherProviders = s
    ? [...s.subscription, ...s.free.slice(free ? 1 : 0), ...s.rent, ...s.buy]
    : [];
  const otherWithLogos = otherProviders.filter((p) => p.logoUrl);

  return (
    <div className="relative h-full w-full">
      {movie.backdropUrl ? (
        <Image
          src={movie.backdropUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover"
        />
      ) : movie.posterUrl ? (
        <Image
          src={movie.posterUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 700px"
          className="scale-110 object-cover object-top blur-md"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ink-700 to-black" />
      )}
      {/* cinematic scrims: bottom for text, left for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

      {/* save button, top-right like a real app */}
      <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
        <WatchlistButton movie={movie} variant="icon" />
      </div>

      {/* title-card content, bottom-left */}
      <div className="tv-pop absolute inset-x-0 bottom-0 p-3 sm:p-5">
        <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-popcorn sm:text-[11px]">
          Tonight&apos;s Pick
        </p>
        <h2 className="text-lg font-extrabold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-3xl md:text-4xl">
          {movie.title}
        </h2>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm">
          {rating && (
            <span className="inline-flex items-center gap-1 font-semibold text-popcorn">
              <span aria-hidden>★</span>
              <span aria-label={`Rated ${rating} out of 10`}>{rating}</span>
            </span>
          )}
          {movie.year && <span className="text-slate-200">{movie.year}</span>}
          {runtime && (
            <>
              <span className="text-slate-500" aria-hidden>
                •
              </span>
              <span className="text-slate-200">{runtime}</span>
            </>
          )}
          {movie.genres.length > 0 && (
            <>
              <span className="text-slate-500" aria-hidden>
                •
              </span>
              <span className="truncate text-slate-300">
                {movie.genres.slice(0, 3).map((g) => g.name).join(" · ")}
              </span>
            </>
          )}
        </div>

        {note && (
          <p className="mt-1 hidden text-xs font-medium text-neon-light sm:block">
            {note}
          </p>
        )}

        {movie.overview && (
          <p className="mt-2 hidden max-w-xl text-sm leading-snug text-slate-300 line-clamp-2 sm:line-clamp-2 md:block">
            {movie.overview}
          </p>
        )}

        {/* streaming — on the TV, nowhere else */}
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          {movie.streamingUnavailable ? (
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-300">
              Availability couldn&apos;t be verified
            </span>
          ) : primaryFree ? (
            <>
              <WatchLink
                href={primaryFree.link}
                providerName={primaryFree.name}
                type="free"
                label={`Watch free on ${primaryFree.name}`}
                free
              />
              {otherWithLogos.length > 0 && (
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="hidden sm:inline">also on</span>
                  <ProviderLogos providers={otherWithLogos} />
                </span>
              )}
            </>
          ) : otherProviders.length > 0 ? (
            <>
              <WatchLink
                href={s?.link ?? null}
                providerName="JustWatch"
                type="subscription"
                label="Where to watch"
              />
              {otherWithLogos.length > 0 && (
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="hidden sm:inline">on</span>
                  <ProviderLogos providers={otherWithLogos} />
                </span>
              )}
            </>
          ) : (
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-300">
              No streaming options found right now
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function WatchLink({
  href,
  providerName,
  type,
  label,
  free = false,
}: {
  href: string | null;
  providerName: string;
  type: string;
  label: string;
  free?: boolean;
}) {
  const cls = free
    ? "bg-freon text-ink-950 hover:bg-freon/90 shadow-[0_0_20px_-6px] shadow-freon"
    : "bg-white text-ink-950 hover:bg-white/90";
  const content = (
    <>
      {free && <span className="h-1.5 w-1.5 rounded-full bg-ink-950/70" aria-hidden />}
      {label}
      <span aria-hidden>▸</span>
    </>
  );
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 sm:text-sm";
  if (!href) {
    return <span className={`${base} ${cls} opacity-90`}>{content}</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("provider_clicked", { provider: providerName, type })}
      className={`${base} ${cls}`}
    >
      {content}
    </a>
  );
}

function NoSignal({
  heading,
  line,
  sub,
}: {
  heading: string;
  line: string;
  sub: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[radial-gradient(120%_100%_at_50%_0%,#161327_0%,#0b0a16_60%,#050409_100%)] px-6 text-center">
      <p className="text-base font-bold text-slate-200 sm:text-lg">{heading}</p>
      <p className="max-w-sm text-xs text-slate-400 sm:text-sm">{line}</p>
      <p className="max-w-sm text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}
