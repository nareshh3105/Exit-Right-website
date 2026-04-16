import Link from "next/link";

import { AppShell } from "@/components/AppShell";

const recentJourneys = [
  { title: "India Gate", subtitle: "Kartavya Path, New Delhi" },
  { title: "Lotus Temple", subtitle: "Kalkaji, New Delhi" },
  { title: "DLF Promenade", subtitle: "Vasant Kunj, New Delhi" },
];

export default function DestinationInputPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#e6e3e2] bg-[#fcf9f8] p-6 shadow-soft">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fcf9f8]/30 to-[#fcf9f8]" />
          <div className="relative">
            <h1 className="mb-5 text-5xl font-extrabold tracking-tight text-[#000666]">Where to?</h1>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔎</span>
              <input placeholder="Enter destination or station" className="ui-input pl-11 text-base font-medium" />
            </div>
          </div>
        </div>

        <article className="ui-card flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a237e] text-white">💡</div>
          <div>
            <p className="text-sm font-bold text-[#000666]">Pro Tip</p>
            <p className="text-xs text-slate-600">Sync your calendar for smarter route planning.</p>
          </div>
        </article>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1b1c1c]">Saved Places</h2>
            <button className="text-xs font-bold uppercase tracking-wider text-[#000666]">Manage</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="ui-card border-l-4 border-l-[#003909] p-5">
              <p className="text-lg font-bold">Home</p>
              <p className="text-sm text-slate-600">Dwarka Sector 10</p>
            </div>
            <div className="ui-card border-l-4 border-l-[#003909] p-5">
              <p className="text-lg font-bold">Office</p>
              <p className="text-sm text-slate-600">Cyber City</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-[#1b1c1c]">Recent Journeys</h2>
          <div className="space-y-3">
            {recentJourneys.map((item) => (
              <div key={item.title} className="ui-card flex items-center justify-between p-4">
                <div>
                  <p className="font-bold text-[#1b1c1c]">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
                <span className="text-slate-400">↗</span>
              </div>
            ))}
          </div>
        </section>

        <div className="ui-card relative overflow-hidden bg-[#003909] p-6 text-white">
          <h3 className="text-2xl font-bold">Go Green today?</h3>
          <p className="mb-4 mt-1 max-w-sm text-sm text-[#d8f1e5]">E-rickshaws and Metro links are faster during peak hours.</p>
          <Link href="/recommendation" className="inline-flex rounded-xl bg-[#a3f69c] px-5 py-2 text-sm font-bold text-[#002204]">
            Find Electric Routes
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
