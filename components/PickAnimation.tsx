"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * The "beat the algorithm" shuffle. Posters cycle quickly then slow down while
 * the pick resolves. Purely visual — the actual selection happens server-side.
 * Respects prefers-reduced-motion (falls back to a calm loading message).
 */
export default function PickAnimation({ posters }: { posters: string[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion.current || posters.length === 0) return;

    let delay = 80;
    const tick = () => {
      setIndex((i) => (i + 1) % posters.length);
      // Gently ease the cadence so it feels like it's landing.
      delay = Math.min(delay * 1.06, 220);
      timer.current = setTimeout(tick, delay);
    };
    timer.current = setTimeout(tick, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [posters]);

  const current = posters[index];

  return (
    <div
      className="card mx-auto flex max-w-sm flex-col items-center gap-5 p-8 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <span
          className="absolute -inset-3 rounded-3xl bg-neon/30 blur-2xl"
          aria-hidden
        />
        <div className="relative aspect-[2/3] w-40 overflow-hidden rounded-2xl ring-1 ring-white/10 sm:w-48">
          {current ? (
            <Image
              key={current}
              src={current}
              alt=""
              fill
              sizes="192px"
              className="object-cover animate-fade-in"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neon/40 to-ink-800 text-5xl">
              🎬
            </div>
          )}
        </div>
      </div>
      <p className="text-lg font-semibold">🎬 Finding your movie…</p>
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-popcorn"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
