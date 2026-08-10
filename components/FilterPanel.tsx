"use client";

import { useEffect, useState } from "react";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type {
  DecadeFilter,
  Genre,
  MovieFilters,
  RatingFilter,
  RuntimeFilter,
} from "@/types/movie";

const RATINGS: { value: RatingFilter; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "6", label: "6+" },
  { value: "7", label: "7+" },
  { value: "8", label: "8+" },
];

const DECADES: { value: DecadeFilter; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "2020s", label: "2020s" },
  { value: "2010s", label: "2010s" },
  { value: "2000s", label: "2000s" },
  { value: "1990s", label: "1990s" },
  { value: "older", label: "Older" },
];

const RUNTIMES: { value: RuntimeFilter; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "under90", label: "Under 90m" },
  { value: "90to120", label: "90–120m" },
  { value: "120to150", label: "2–2.5h" },
  { value: "over150", label: "2.5h+" },
];

function SegHeader({ children }: { children: React.ReactNode }) {
  return (
    <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </legend>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className="flex flex-wrap gap-1.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition",
              active
                ? "bg-popcorn text-ink-950"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterPanel({
  filters,
  onChange,
  disabled = false,
}: {
  filters: MovieFilters;
  onChange: (next: MovieFilters) => void;
  disabled?: boolean;
}) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/genres")
      .then((r) => (r.ok ? r.json() : { genres: [] }))
      .then((d) => {
        if (active && Array.isArray(d.genres)) setGenres(d.genres);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const update = (patch: Partial<MovieFilters>) => {
    onChange({ ...filters, ...patch });
    track("filter_used", { keys: Object.keys(patch) });
  };

  const toggleGenre = (id: number) => {
    const has = filters.genres.includes(id);
    update({
      genres: has
        ? filters.genres.filter((g) => g !== id)
        : [...filters.genres, id],
    });
  };

  const activeCount =
    filters.genres.length +
    (filters.rating !== "any" ? 1 : 0) +
    (filters.decade !== "any" ? 1 : 0) +
    (filters.runtime !== "any" ? 1 : 0) +
    (filters.freeOnly ? 1 : 0);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 font-semibold">
          <span aria-hidden>🎛️</span>
          Preferences
          {activeCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neon px-1.5 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <span
          className={cn(
            "text-slate-400 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        >
          ▾
        </span>
      </button>

      <div
        className={cn(
          "grid transition-all duration-300",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <fieldset
            disabled={disabled}
            className="space-y-6 border-t border-white/10 px-5 py-5"
          >
            <div>
              <SegHeader>Genre</SegHeader>
              <div className="flex flex-wrap gap-1.5">
                {genres.length === 0 && (
                  <span className="text-sm text-slate-500">Loading genres…</span>
                )}
                {genres.map((g) => {
                  const active = filters.genres.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleGenre(g.id)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm font-medium transition",
                        active
                          ? "bg-neon text-white"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                      )}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <fieldset>
                <SegHeader>Rating</SegHeader>
                <Segmented
                  name="Minimum rating"
                  options={RATINGS}
                  value={filters.rating}
                  onChange={(v) => update({ rating: v })}
                />
              </fieldset>
              <fieldset>
                <SegHeader>Release</SegHeader>
                <Segmented
                  name="Release decade"
                  options={DECADES}
                  value={filters.decade}
                  onChange={(v) => update({ decade: v })}
                />
              </fieldset>
              <fieldset>
                <SegHeader>Runtime</SegHeader>
                <Segmented
                  name="Runtime"
                  options={RUNTIMES}
                  value={filters.runtime}
                  onChange={(v) => update({ runtime: v })}
                />
              </fieldset>
            </div>

            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition",
                filters.freeOnly
                  ? "border-freon/40 bg-freon/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              )}
            >
              <input
                type="checkbox"
                checked={filters.freeOnly}
                onChange={(e) => {
                  update({ freeOnly: e.target.checked });
                  track("free_only_toggled", { value: e.target.checked });
                }}
                className="h-5 w-5 accent-freon"
              />
              <span>
                <span className="block font-semibold">
                  Only show movies I can watch for free
                </span>
                <span className="block text-sm text-slate-400">
                  Tubi, Pluto TV, Freevee, The Roku Channel &amp; more
                </span>
              </span>
            </label>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
