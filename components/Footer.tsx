export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p>
          Movie Night · Stop scrolling. Start watching. 🍿
        </p>
        <p className="mt-2 text-xs">
          Movie data &amp; streaming availability provided by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 underline decoration-dotted underline-offset-2 hover:text-slate-200"
          >
            TMDB
          </a>{" "}
          and JustWatch. Availability varies by region and changes over time.
        </p>
      </div>
    </footer>
  );
}
