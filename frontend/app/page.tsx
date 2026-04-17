"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in, skip the splash and go straight to dashboard
    const token = window.localStorage.getItem("exit_right_token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0d1562" }}
    >
      {/* Cities breadcrumb at top */}
      <p className="absolute top-10 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
        CHENNAI &bull; MUMBAI &bull; BENGALURU
      </p>

      {/* Center content */}
      <div className="flex flex-col items-center gap-5 px-8 text-center">
        {/* Rupee icon in orange square */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-extrabold text-white shadow-lg"
          style={{ background: "#f97316" }}
        >
          ₹
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-white">EXIT RIGHT</h1>

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          THE SMARTER WAY OUT
        </p>

        <div className="mt-4 flex gap-3">
          <Link
            href="/signup"
            className="rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "#f97316" }}
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-500 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
