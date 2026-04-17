"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { getStations } from "@/lib/api";
import { Station } from "@/lib/types";

export default function StationSelectorPage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Station | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("exit_right_station");
    if (saved) {
      try { setSelected(JSON.parse(saved)); } catch { /* ignore */ }
    }
    getStations()
      .then(setStations)
      .catch(() => setError("Unable to load stations"));
  }, []);

  function handleSelect(station: Station) {
    setSelected(station);
    setError("");
    window.localStorage.setItem("exit_right_station", JSON.stringify(station));
  }

  function handleNext() {
    if (!selected) { setError("Please select a station first"); return; }
    router.push("/destination-input");
  }

  const filteredStations = stations.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-6">
        {/* Search header */}
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
        </div>

        {/* Selected station banner */}
        {selected && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#003909]/20 bg-[#d8f1e5] px-5 py-4">
            <span className="text-xl">🚇</span>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[#003909]">Selected Station</p>
              <p className="font-bold text-[#1b1c1c]">
                {selected.name}{" "}
                <span className="font-normal text-slate-500">({selected.line_code} Line)</span>
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-slate-500 hover:text-red-500">✕</button>
          </div>
        )}

        {/* All stations list */}
        <section>
          <h2 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
            {query ? `Results for "${query}"` : "All Stations"}
          </h2>
          {filteredStations.length === 0 && (
            <p className="text-sm text-slate-500">
              {error || (query ? "No stations match your search" : "Loading stations…")}
            </p>
          )}
          <div className="space-y-2">
            {filteredStations.map((station) => {
              const isSelected = selected?.id === station.id;
              return (
                <button
                  key={station.id}
                  onClick={() => handleSelect(station)}
                  className={`ui-card flex w-full items-center justify-between p-4 text-left transition ${
                    isSelected ? "border-2 border-[#003909] bg-[#d8f1e5]" : "hover:border-[#003909]/30"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-[#1b1c1c]">{station.name}</p>
                    <p className="text-xs text-slate-500">{station.line_code} Line</p>
                  </div>
                  {isSelected ? (
                    <span className="text-lg text-[#003909]">✓</span>
                  ) : (
                    <span className="text-slate-400">›</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Next button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selected}
            className="flex items-center gap-2 rounded-2xl bg-[#003909] px-8 py-3 font-bold text-white transition hover:bg-[#005514] disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </section>
    </AppShell>
  );
}
