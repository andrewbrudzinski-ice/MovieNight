/**
 * Polished skeleton shown while a pick resolves. Kept lightweight; the reel
 * animation lives in the randomizer itself — this is the metadata placeholder.
 */
export default function LoadingMovie() {
  return (
    <div className="card mx-auto max-w-4xl overflow-hidden animate-fade-in">
      <div className="shimmer aspect-[16/9] w-full bg-ink-800" />
      <div className="space-y-4 p-6 sm:p-8">
        <div className="shimmer h-8 w-2/3 rounded-lg bg-ink-800" />
        <div className="flex gap-2">
          <div className="shimmer h-6 w-16 rounded-full bg-ink-800" />
          <div className="shimmer h-6 w-16 rounded-full bg-ink-800" />
          <div className="shimmer h-6 w-20 rounded-full bg-ink-800" />
        </div>
        <div className="space-y-2">
          <div className="shimmer h-4 w-full rounded bg-ink-800" />
          <div className="shimmer h-4 w-11/12 rounded bg-ink-800" />
          <div className="shimmer h-4 w-4/5 rounded bg-ink-800" />
        </div>
        <div className="shimmer h-14 w-full rounded-2xl bg-ink-800" />
      </div>
    </div>
  );
}
