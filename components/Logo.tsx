import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label="Movie Night home"
    >
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon to-neon-dark text-lg shadow-glow transition group-hover:scale-105"
      >
        🍿
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Movie<span className="text-popcorn">Night</span>
      </span>
    </Link>
  );
}
