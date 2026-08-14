"use client";

import Remote from "@/components/livingroom/Remote";
import TvScreen, { type ScreenStatus } from "@/components/livingroom/TvScreen";
import type { MovieWithStreaming } from "@/types/movie";

/**
 * The living-room set, drawn with layered CSS for a realistic (not cartoonish)
 * look: a wall-to-floor gradient with depth, a modern flat-screen TV on a
 * pedestal + media console, a wood coffee table in perspective holding the
 * remote, ambient lamp + screen light, and a soft couch foreground. The TV is
 * the only place the movie appears.
 */
export default function LivingRoomScene({
  status,
  movie,
  reel,
  errorMessage,
  onPick,
  onSurprise,
  busy,
}: {
  status: ScreenStatus;
  movie: MovieWithStreaming | null;
  reel: string[];
  errorMessage?: string;
  onPick: () => void;
  onSurprise: () => void;
  busy: boolean;
}) {
  const hasResult = status === "result";
  const glow = hasResult
    ? "bg-popcorn/20"
    : status === "picking"
      ? "bg-neon/25"
      : "bg-sky-400/10";

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/5 shadow-card">
      {/* Wall → floor */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#14131f 0%,#100f19 46%,#0c0b13 62%,#0a0910 100%)",
        }}
        aria-hidden
      />
      {/* wall/floor seam + floor sheen */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "62%",
          height: "1px",
          background:
            "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)",
        }}
        aria-hidden
      />
      {/* warm lamp glow, upper-right */}
      <span
        className="pointer-events-none absolute -right-16 -top-10 h-64 w-64 rounded-full bg-amber-300/10 blur-[60px]"
        aria-hidden
      />
      {/* corner vignette */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 30%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
        aria-hidden
      />

      <div className="relative px-4 pb-0 pt-10 sm:px-10 sm:pt-14">
        {/* ---- TV ---- */}
        <div className="relative mx-auto w-full max-w-2xl">
          {/* screen light spilling on the wall */}
          <span
            className={`pointer-events-none absolute -inset-8 -z-0 rounded-[3rem] blur-[55px] transition-colors duration-700 ${glow}`}
            aria-hidden
          />

          {/* bezel */}
          <div
            className="relative z-10 rounded-[14px] p-[6px] sm:rounded-[18px] sm:p-[8px]"
            style={{
              background: "linear-gradient(160deg,#2a2a30,#0d0d10 60%)",
              boxShadow:
                "0 30px 60px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px rgba(0,0,0,0.6)",
            }}
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-[8px] ring-1 ring-black sm:rounded-[11px]">
              <TvScreen
                status={status}
                movie={movie}
                reel={reel}
                errorMessage={errorMessage}
              />
              {/* faint glass reflection */}
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/[0.07] to-transparent"
                aria-hidden
              />
            </div>
            {/* brand + standby dot on the chin */}
            <div className="absolute inset-x-0 bottom-[1px] flex items-center justify-center gap-1.5">
              <span
                className="h-[3px] w-[3px] rounded-full bg-freon/80 shadow-[0_0_5px] shadow-freon/70"
                aria-hidden
              />
            </div>
          </div>

          {/* soundbar */}
          <div
            className="relative z-10 mx-auto mt-1.5 h-2 w-[86%] rounded-full sm:h-2.5"
            style={{
              background: "linear-gradient(180deg,#26262c,#131317)",
              boxShadow: "0 6px 14px -6px rgba(0,0,0,0.8)",
            }}
            aria-hidden
          />

          {/* pedestal stand */}
          <div
            className="relative z-0 mx-auto h-4 w-16 sm:h-5 sm:w-20"
            style={{
              background: "linear-gradient(180deg,#26262c,#17171b)",
              clipPath: "polygon(30% 0, 70% 0, 88% 100%, 12% 100%)",
            }}
            aria-hidden
          />
          {/* stand base + media console */}
          <div className="relative z-0 mx-auto -mt-0.5 h-1.5 w-32 rounded-full bg-black/60 blur-[1px] sm:w-40" aria-hidden />
          <div
            className="relative z-0 mx-auto -mt-1 h-8 w-3/4 rounded-lg sm:h-10"
            style={{
              background: "linear-gradient(180deg,#221c19 0%,#171310 100%)",
              boxShadow:
                "0 16px 30px -18px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            aria-hidden
          >
            {/* console seam / drawers */}
            <span className="absolute inset-x-6 top-1/2 h-px bg-white/5" aria-hidden />
          </div>
        </div>

        {/* ---- Foreground: rug, coffee table, remote ---- */}
        <div className="relative mt-6 sm:mt-8">
          {status === "idle" && (
            <p className="relative z-20 mb-4 flex items-center justify-center gap-1.5 text-center text-sm text-slate-400">
              Grab the remote
              <span className="animate-nudge" aria-hidden>
                ↓
              </span>
            </p>
          )}

          <div
            className="relative mx-auto h-60 max-w-md sm:h-64"
            style={{ perspective: "900px" }}
          >
            {/* rug */}
            <span
              className="pointer-events-none absolute bottom-8 left-1/2 h-28 w-[88%] -translate-x-1/2 rounded-[50%] bg-neon/[0.06] blur-2xl"
              aria-hidden
            />
            {/* table shadow on floor */}
            <span
              className="absolute inset-x-8 bottom-9 h-8 rounded-[50%] bg-black/50 blur-lg"
              aria-hidden
            />

            {/* table front edge (thickness) */}
            <div
              className="absolute inset-x-8 bottom-9 h-4 rounded-b-xl"
              style={{ background: "linear-gradient(180deg,#2c2620,#1a1712)" }}
              aria-hidden
            />
            {/* table legs */}
            <span className="absolute bottom-4 left-12 h-6 w-2 rounded-b bg-[#171310]" aria-hidden />
            <span className="absolute bottom-4 right-12 h-6 w-2 rounded-b bg-[#171310]" aria-hidden />

            {/* tabletop (perspective) */}
            <div
              className="absolute inset-x-6 bottom-9 h-20 rounded-[14px]"
              style={{
                transform: "rotateX(54deg)",
                transformOrigin: "center bottom",
                background:
                  "linear-gradient(160deg,#3a322a 0%,#2a241e 45%,#211c17 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.10), 0 10px 20px -10px rgba(0,0,0,0.7)",
              }}
              aria-hidden
            >
              <span
                className="absolute inset-0 rounded-[14px] opacity-60"
                style={{
                  background:
                    "linear-gradient(105deg,transparent 20%,rgba(255,255,255,0.06) 38%,transparent 55%)",
                }}
              />
            </div>

            {/* a short glass resting on the table, to the left */}
            <div
              className="absolute bottom-[3.25rem] left-[24%] hidden sm:block"
              aria-hidden
            >
              <span className="absolute -bottom-1 left-1/2 h-2 w-9 -translate-x-1/2 rounded-[50%] bg-black/40 blur-[2px]" />
              <div
                className="h-9 w-7 rounded-b-md rounded-t-sm"
                style={{
                  background:
                    "linear-gradient(180deg,rgba(180,200,220,0.18),rgba(120,140,160,0.10))",
                  boxShadow:
                    "inset 0 -6px 8px rgba(120,90,50,0.35), inset 1px 0 0 rgba(255,255,255,0.25)",
                }}
              >
                <span className="block h-1.5 w-full rounded-t-sm bg-white/15" />
              </div>
            </div>

            {/* the remote, centered, resting on the table */}
            <div className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2">
              <Remote
                onPick={onPick}
                onSurprise={onSurprise}
                busy={busy}
                hasResult={hasResult}
              />
            </div>
          </div>
        </div>

        {/* ---- Couch foreground ---- */}
        <div className="pointer-events-none relative -mx-4 -mb-px h-10 sm:-mx-10 sm:h-14" aria-hidden>
          <div
            className="absolute inset-x-0 bottom-0 h-16 rounded-t-[50%]"
            style={{
              background: "linear-gradient(180deg,#1c1a24 0%,#111019 100%)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.05)",
            }}
          />
          <span className="absolute bottom-0 left-[18%] h-8 w-1/3 rounded-t-[60%] bg-[#201e2a]" />
          <span className="absolute bottom-0 right-[18%] h-8 w-1/3 rounded-t-[60%] bg-[#201e2a]" />
        </div>
      </div>
    </div>
  );
}
