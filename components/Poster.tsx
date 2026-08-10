"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Poster image with a graceful fallback for missing / broken artwork so the UI
 * never looks broken (spec §20).
 */
export default function Poster({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
  rounded = "rounded-2xl",
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  rounded?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={cn(
          "flex aspect-[2/3] w-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-850 text-center",
          rounded,
          className,
        )}
        role="img"
        aria-label={`${alt} (no poster available)`}
      >
        <span className="px-4 text-sm text-slate-400">
          <span className="mb-1 block text-3xl" aria-hidden>
            🎬
          </span>
          No poster
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[2/3] w-full overflow-hidden", rounded, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 50vw, 300px"}
        priority={priority}
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  );
}
