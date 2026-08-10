import type { Metadata } from "next";

import WatchlistView from "@/components/WatchlistView";

export const metadata: Metadata = {
  title: "My Watchlist",
  description: "Movies you've saved on Movie Night, with fresh free-to-watch checks.",
};

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          My Watchlist
        </h1>
        <p className="mt-2 text-slate-300">
          Saved for later. We re-check where each one is free right now.
        </p>
      </header>
      <WatchlistView />
    </div>
  );
}
