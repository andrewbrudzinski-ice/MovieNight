import LivingRoomRandomizer from "@/components/LivingRoomRandomizer";
import { isTmdbConfigured } from "@/lib/tmdb";

export default function HomePage() {
  const configured = isTmdbConfigured();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
        <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Stop scrolling.
          <br />
          <span className="bg-gradient-to-r from-popcorn via-popcorn-light to-neon-light bg-clip-text text-transparent">
            Start watching.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-pretty text-lg text-slate-300">
          Kick back, grab the remote, and let Movie Night pick tonight&apos;s
          movie — then see exactly where to watch it. Free options first.
        </p>
      </section>

      {!configured && (
        <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-popcorn/30 bg-popcorn/10 p-4 text-sm text-popcorn-light">
          <strong className="font-semibold">Setup needed:</strong> add a{" "}
          <code className="rounded bg-black/30 px-1">TMDB_API_KEY</code> to your
          environment (see <code className="rounded bg-black/30 px-1">.env.example</code>)
          to start getting picks. The interface is fully live below once the key
          is set.
        </div>
      )}

      <LivingRoomRandomizer />
    </div>
  );
}
