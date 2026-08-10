"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Logo from "@/components/Logo";
import { getWatchlist, subscribe } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getWatchlist().length);
    update();
    return subscribe(update);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <ul className="flex items-center gap-1 sm:gap-2">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3 py-2 text-sm font-medium transition sm:px-4",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                  {item.href === "/watchlist" && count > 0 && (
                    <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-popcorn px-1.5 text-xs font-bold text-ink-950">
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
