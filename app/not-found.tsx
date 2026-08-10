import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 text-6xl" aria-hidden>
        🎬
      </div>
      <h1 className="text-3xl font-extrabold">Nothing playing here</h1>
      <p className="mt-2 text-slate-300">
        This reel ran out. Let&apos;s find you a movie instead.
      </p>
      <Link href="/" className="btn-primary mt-6">
        🎲 Pick a movie
      </Link>
    </div>
  );
}
