import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "How Movie Night picks your next movie and finds where to watch it free.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        About Movie Night
      </h1>
      <div className="mt-6 space-y-5 leading-relaxed text-slate-300">
        <p>
          You don&apos;t know what to watch. Movie Night picks one for you and
          tells you where you can watch it — prioritizing the options that
          won&apos;t cost you a thing.
        </p>
        <p>
          Press one button. We pull from a pool of well-rated, well-known movies
          that match your preferences, avoid anything we just showed you, and
          reveal a single pick. Then we check real, current streaming
          availability and put the free options front and center.
        </p>
        <h2 className="pt-2 text-xl font-bold text-white">The details</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            Movie data and streaming availability come from{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-popcorn underline underline-offset-2"
            >
              TMDB
            </a>{" "}
            (powered by JustWatch). We never invent availability — if we
            can&apos;t verify it, we say so.
          </li>
          <li>
            &ldquo;Free&rdquo; means ad-supported or no-cost services like Tubi,
            Pluto TV, Freevee, and The Roku Channel.
          </li>
          <li>
            Availability varies by country and changes over time. Default region
            is the United States.
          </li>
          <li>
            Your watchlist lives in your browser — no account required.
          </li>
        </ul>
        <div className="pt-4">
          <Link href="/" className="btn-primary">
            🎲 Pick a movie
          </Link>
        </div>
      </div>
    </div>
  );
}
