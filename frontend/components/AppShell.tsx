"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { BottomNav } from "@/components/BottomNav";

// Pages where the nav should be hidden (unauthenticated screens)
const AUTH_PATHS = ["/login", "/signup"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-screen" style={{ background: "#f5f7fa" }}>
      {/* Sticky top header */}
      <header
        className="sticky top-0 z-30 border-b border-slate-200/80"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)" }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          {/* Hamburger left */}
          {!isAuthPage ? (
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-600 hover:bg-slate-100">
              ☰
            </button>
          ) : (
            <div className="w-9" />
          )}

          {/* Brand center */}
          <Link
            href={isAuthPage ? "/" : "/dashboard"}
            className="text-lg font-extrabold tracking-tight"
            style={{ color: "#1a237e" }}
          >
            EXIT RIGHT
          </Link>

          {/* Avatar right */}
          {!isAuthPage ? (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "#f97316" }}
            >
              U
            </div>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className={`mx-auto max-w-2xl px-4 py-4 ${!isAuthPage ? "pb-24" : "pb-8"}`}>
        {children}
      </main>

      {/* Bottom nav — not shown on auth pages */}
      {!isAuthPage && <BottomNav />}
    </div>
  );
}
