"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/station-selector", label: "Stations" },
  { href: "/destination-input", label: "Destination" },
  { href: "/recommendation", label: "Recommendation" },
  { href: "/cab-comparison", label: "Cabs" },
  { href: "/saved-locations", label: "Saved" },
  { href: "/recommendation-history", label: "History" },
  { href: "/settings", label: "Settings" },
];

// Pages where the nav links should be hidden (unauthenticated screens)
const AUTH_PATHS = ["/login", "/signup"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-green-50">
      <header className="border-b border-brand-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-brand-900">
            EXIT RIGHT
          </Link>
          {!isAuthPage && (
            <nav className="flex flex-wrap gap-2 text-sm font-semibold">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1.5 transition ${
                      active ? "bg-brand-700 text-white" : "bg-brand-100 text-brand-900 hover:bg-brand-500 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
