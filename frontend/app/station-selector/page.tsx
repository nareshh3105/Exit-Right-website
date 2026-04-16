"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { getStations } from "@/lib/api";
import { Station } from "@/lib/types";

export default function StationSelectorPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getStations()
      .then(setStations)
      .catch(() => setStations([]));
  }, []);

  const filteredStations = stations.filter((station) => station.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#e6e3e2] bg-[#fcf9f8] p-6 shadow-soft">
          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-[#000666]">Station Selection</h1>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for Metro Station"
              className="ui-input pl-11 text-base"
            />
          </div>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Open Network Map</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="ui-card p-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Stations</p>
            <div className="space-y-3">
              <p className="font-bold text-[#1b1c1c]">Hauz Khas</p>
              <p className="font-bold text-[#1b1c1c]">Rajiv Chowk</p>
            </div>
          </article>
          <article className="ui-card p-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Favorites</p>
            <div className="space-y-3">
              <p className="font-bold text-[#1b1c1c]">Cyber City</p>
              <p className="font-bold text-[#1b1c1c]">Green Park</p>
            </div>
          </article>
        </div>

        <section>
          <h2 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">All Stations</h2>
          <div className="space-y-2">
            {filteredStations.slice(0, 10).map((station) => (
              <article key={station.id} className="ui-card flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-[#1b1c1c]">{station.name}</p>
                  <p className="text-xs text-slate-500">{station.line_code} Line</p>
                </div>
                <span className="text-slate-400">›</span>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
