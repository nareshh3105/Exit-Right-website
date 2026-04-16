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
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#fcf9f8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-3xl font-extrabold tracking-tight text-[#0b3f2f]">
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
                      active
                        ? "bg-[#0f7a5b] text-white shadow-sm"
                        : "bg-[#d8f1e5] text-[#19473a] hover:bg-[#bbe6d4]"
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
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
