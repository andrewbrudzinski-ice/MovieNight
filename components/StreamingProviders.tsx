"use client";

import Image from "next/image";

import { track } from "@/lib/analytics";
import type {
  StreamingAvailability,
  StreamingProvider,
} from "@/types/streaming";

function ProviderChip({
  provider,
  emphasis = false,
  onClick,
}: {
  provider: StreamingProvider;
  emphasis?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      {provider.logoUrl ? (
        <Image
          src={provider.logoUrl}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 rounded-md object-cover"
        />
      ) : (
        <span className="grid h-7 w-7 place-items-center rounded-md bg-white/10 text-xs" aria-hidden>
          📺
        </span>
      )}
      <span className="font-medium">{provider.name}</span>
    </>
  );

  const classes = emphasis
    ? "flex items-center gap-2 rounded-xl border border-freon/40 bg-freon/10 px-3 py-2 text-sm text-freon transition hover:bg-freon/20"
    : "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10";

  if (provider.link) {
    return (
      <a
        href={provider.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={classes}
      >
        {inner}
      </a>
    );
  }
  return <div className={classes}>{inner}</div>;
}

function Section({
  title,
  providers,
  emphasis = false,
}: {
  title: string;
  providers: StreamingProvider[];
  emphasis?: boolean;
}) {
  if (providers.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <ProviderChip
            key={`${title}-${p.id}`}
            provider={p}
            emphasis={emphasis}
            onClick={() =>
              track("provider_clicked", {
                provider: p.name,
                type: title,
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

export default function StreamingProviders({
  availability,
  unavailable = false,
}: {
  availability: StreamingAvailability | null;
  unavailable?: boolean;
}) {
  if (unavailable) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        Streaming availability couldn&apos;t be verified right now.
      </p>
    );
  }

  const hasAny =
    availability &&
    (availability.free.length > 0 ||
      availability.subscription.length > 0 ||
      availability.rent.length > 0 ||
      availability.buy.length > 0);

  if (!availability || !hasAny) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        <p>No streaming options found for your region right now.</p>
        {availability?.link && (
          <a
            href={availability.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-popcorn underline underline-offset-2"
          >
            Check availability →
          </a>
        )}
      </div>
    );
  }

  const free = availability.free;
  const primaryFree = free[0];

  return (
    <div className="space-y-5">
      {free.length > 0 && primaryFree ? (
        <div className="rounded-2xl border border-freon/40 bg-gradient-to-br from-freon/15 to-freon/5 p-4">
          <div className="flex items-center gap-2 text-freon">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full bg-freon"
              aria-hidden
            />
            <span className="text-sm font-bold uppercase tracking-wider">
              Free to watch
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              {primaryFree.logoUrl ? (
                <Image
                  src={primaryFree.logoUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-lg" aria-hidden>
                  📺
                </span>
              )}
              <span className="text-lg font-semibold text-white">
                {primaryFree.name}
              </span>
            </div>
            {primaryFree.link && (
              <a
                href={primaryFree.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("provider_clicked", {
                    provider: primaryFree.name,
                    type: "free",
                  })
                }
                className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-freon px-4 py-2 text-sm font-bold text-ink-950 transition hover:bg-freon/90 active:scale-95"
              >
                Watch now ▸
              </a>
            )}
          </div>
          {free.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {free.slice(1).map((p) => (
                <ProviderChip
                  key={`free-extra-${p.id}`}
                  provider={p}
                  emphasis
                  onClick={() =>
                    track("provider_clicked", { provider: p.name, type: "free" })
                  }
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <Section title="Subscription" providers={availability.subscription} />
      <Section title="Rent" providers={availability.rent} />
      <Section title="Buy" providers={availability.buy} />

      {availability.link && (
        <a
          href={availability.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-slate-400 underline decoration-dotted underline-offset-2 hover:text-slate-200"
        >
          View all watch options on JustWatch →
        </a>
      )}
    </div>
  );
}
