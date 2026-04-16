"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { getStations } from "@/lib/api";
import { Station } from "@/lib/types";

export default function StationSelectorPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    getStations()
      .then(setStations)
      .catch(() => setStatus("Unable to fetch stations"));
  }, []);

  function saveSelection() {
    const station = stations.find((s) => s.id === selected);
    if (!station) {
      setStatus("Pick a station first");
      setIsSaved(false);
      return;
    }
    window.localStorage.setItem("exit_right_station", JSON.stringify(station));
    setStatus(`Selected ${station.name}`);
    setIsSaved(true);
  }

  return (
    <AppShell>
      <section className="max-w-xl rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="mb-4 text-2xl font-bold text-brand-900">Select Metro Station</h1>
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setIsSaved(false);
          }}
          className="mb-4 w-full rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
        >
          <option value="">Choose a station</option>
          {stations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.name} ({station.line_code})
            </option>
          ))}
        </select>
        <button onClick={saveSelection} className="rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white">
          Save Station
        </button>
        {status ? <p className="mt-3 text-sm text-slate-700">{status}</p> : null}
        {isSaved ? (
          <Link
            href="/destination-input"
            className="mt-4 inline-flex rounded-xl bg-brand-900 px-4 py-2 font-semibold text-white"
          >
            Next
          </Link>
        ) : null}
      </section>
    </AppShell>
  );
}
