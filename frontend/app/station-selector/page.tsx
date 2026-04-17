"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { getStations } from "@/lib/api";
import { Station } from "@/lib/types";

const LINE_COLORS: Record<string, string> = {
  Yellow: "#eab308",
  Blue: "#3b82f6",
  Magenta: "#ec4899",
  Red: "#ef4444",
  Violet: "#7c3aed",
  Green: "#16a34a",
};

function LineBadge({ line }: { line: string }) {
  const color = LINE_COLORS[line] ?? "#64748b";
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
      style={{ background: color }}
    >
      {line} LINE
    </span>
  );
}

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

  // Recent: first 2 stations from list for display
  const recentStations = stations.slice(0, 2);
  const favoriteStations = stations.slice(2, 4);

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Search bar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search metro station&hellip;"
            className="ui-input pl-11 pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🗺️</span>
        </div>
        <button className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a237e" }}>
          OPEN NETWORK MAP
        </button>

        {/* Recent Stations */}
        {!query && recentStations.length > 0 && (
          <section>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              RECENT STATIONS
            </p>
            <div className="space-y-2">
              {recentStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handleSelect(station)}
                  className={`ui-card flex w-full items-center justify-between p-3 text-left transition ${
                    selected?.id === station.id ? "border-2" : ""
                  }`}
                  style={selected?.id === station.id ? { borderColor: "#1a237e" } : {}}
                >
                  <div>
                    <p className="font-semibold text-slate-800">{station.name}</p>
                    <div className="mt-1 flex gap-1.5">
                      <LineBadge line={station.line_code} />
                    </div>
                  </div>
                  <span className="text-slate-300">›</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Favorites */}
        {!query && favoriteStations.length > 0 && (
          <section>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              FAVOURITES
            </p>
            <div className="space-y-2">
              {favoriteStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handleSelect(station)}
                  className={`ui-card flex w-full items-center justify-between p-3 text-left transition ${
                    selected?.id === station.id ? "border-2" : ""
                  }`}
                  style={selected?.id === station.id ? { borderColor: "#1a237e" } : {}}
                >
                  <div>
                    <p className="font-semibold text-slate-800">{station.name}</p>
                    <div className="mt-1 flex gap-1.5">
                      <LineBadge line={station.line_code} />
                    </div>
                  </div>
                  <span className="text-slate-300">›</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* All Stations */}
        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {query ? `RESULTS FOR "${query.toUpperCase()}"` : "ALL STATIONS"}
          </p>
          {filteredStations.length === 0 && (
            <p className="text-sm text-slate-400">
              {error || (query ? "No stations match your search" : "Loading stations\u2026")}
            </p>
          )}
          <div className="space-y-2">
            {filteredStations.map((station) => {
              const isSelected = selected?.id === station.id;
              return (
                <button
                  key={station.id}
                  onClick={() => handleSelect(station)}
                  className="ui-card flex w-full items-center gap-3 p-3 text-left transition hover:border-slate-300"
                  style={isSelected ? { border: "2px solid #1a237e", background: "#eef2ff" } : {}}
                >
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-slate-300" />
                  <p className="flex-1 font-semibold text-slate-800">{station.name}</p>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    {station.line_code}
                  </span>
                  {isSelected ? (
                    <span className="font-bold text-blue-900">✓</span>
                  ) : (
                    <span className="text-slate-300">›</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Network explorer card */}
        <div
          className="flex items-center justify-between rounded-2xl p-4 text-white"
          style={{ background: "#1e3a8a" }}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
              EXPLORE THE ENTIRE NETWORK
            </p>
            <p className="mt-0.5 text-sm font-bold">LAUNCH VIEWER</p>
          </div>
          <span className="text-2xl">🗺️</span>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Next button */}
        <div className="flex items-center justify-between">
          <div />
          <button
            onClick={handleNext}
            disabled={!selected}
            className="flex items-center gap-2 rounded-xl px-8 py-3 font-bold text-white transition disabled:opacity-40"
            style={{ background: "#1a237e" }}
          >
            Next &rarr;
          </button>
        </div>

        {/* Orange FAB */}
        <button
          className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg"
          style={{ background: "#f97316" }}
        >
          📍
        </button>
      </div>
    </AppShell>
  );
}
