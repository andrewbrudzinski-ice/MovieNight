"use client";

import Image from "next/image";

import Poster from "@/components/Poster";
import StreamingProviders from "@/components/StreamingProviders";
import WatchlistButton from "@/components/WatchlistButton";
import { formatRating, formatRuntime, funNote } from "@/lib/utils";
import { hasFreeOption } from "@/types/streaming";
import type { MovieWithStreaming } from "@/types/movie";

export default function MovieResult({
  movie,
  onPickAnother,
  picking = false,
}: {
  movie: MovieWithStreaming;
  onPickAnother: () => void;
  picking?: boolean;
}) {
  const runtime = formatRuntime(movie.runtime);
  const rating = formatRating(movie.rating);
  const note = funNote(movie);
  const free = hasFreeOption(movie.streaming);

  return (
    <article className="card mx-auto max-w-4xl animate-scale-in overflow-hidden">
      {/* Backdrop hero */}
      <div className="relative">
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/8]">
          {movie.backdropUrl ? (
            <Image
              src={movie.backdropUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-ink-700 to-ink-850" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/50 to-transparent" />
        </div>

        {/* Poster + title overlap */}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 sm:gap-6 sm:p-8">
          <div className="hidden w-28 shrink-0 sm:block sm:w-36">
            <Poster
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
              className="shadow-card ring-1 ring-white/10"
              priority
              sizes="144px"
            />
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-popcorn">
              Tonight&apos;s Pick 🍿
            </p>
            <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">
              {movie.title}
            </h1>
            {movie.originalTitle && (
              <p className="mt-0.5 text-sm italic text-slate-400">
                {movie.originalTitle}
              </p>
            )}
          </div>
          <div className="shrink-0 pb-1">
            <WatchlistButton movie={movie} variant="icon" />
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-8">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          {rating && (
            <span className="inline-flex items-center gap-1 font-semibold text-popcorn">
              <span aria-hidden>⭐</span>
              <span aria-label={`Rating ${rating} out of 10`}>{rating}</span>
            </span>
          )}
          {movie.year && <span className="text-slate-300">{movie.year}</span>}
          {runtime && (
            <>
              <span className="text-slate-600" aria-hidden>
                •
              </span>
              <span className="text-slate-300">{runtime}</span>
            </>
          )}
          {free && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-freon/40 bg-freon/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-freon">
              <span className="h-1.5 w-1.5 rounded-full bg-freon" aria-hidden />
              Free
            </span>
          )}
        </div>

        {movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <span key={g.id} className="chip">
                {g.name}
              </span>
            ))}
          </div>
        )}

        {note && (
          <p className="text-sm font-medium text-neon-light">{note}</p>
        )}

        {movie.overview && (
          <p className="max-w-2xl leading-relaxed text-slate-300">
            {movie.overview}
          </p>
        )}

        {/* Streaming */}
        <div className="border-t border-white/10 pt-6">
          <StreamingProviders
            availability={movie.streaming}
            unavailable={movie.streamingUnavailable}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={onPickAnother}
            disabled={picking}
            className="btn-primary flex-1"
          >
            <span aria-hidden>🎲</span>
            {picking ? "Picking…" : "Pick another"}
          </button>
          <WatchlistButton movie={movie} />
        </div>
      </div>
    </article>
  );
}
