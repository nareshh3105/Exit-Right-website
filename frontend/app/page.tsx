import Link from "next/link";

import { AppShell } from "@/components/AppShell";

export default function LandingPage() {
  return (
    <AppShell>
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-900">
            Chennai Metro Intelligence Platform
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-brand-900 md:text-5xl">
            EXIT RIGHT
          </h1>
          <p className="mb-6 text-base text-slate-700 md:text-lg">
            Choose the best metro exit gate and last-mile travel mode using adaptive time, cost, crowd, weather, and safety scoring.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-900">
              Get Started
            </Link>
            <Link href="/login" className="rounded-xl border border-brand-700 px-5 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50">
              Login
            </Link>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-xl font-bold text-brand-900">What EXIT RIGHT Optimizes</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>Best exit gate by destination direction and distance</li>
            <li>Transport ranking: Walking, Shared Auto, Bus, Cab</li>
            <li>Live weather penalty adaptation for rain conditions</li>
            <li>Crowd level and time-of-day safety weighting</li>
            <li>Cab comparison for Uber, Ola, Rapido, Namma Yatri</li>
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
