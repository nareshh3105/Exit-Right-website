"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { CabCard } from "@/components/CabCard";
import { compareCabs } from "@/lib/api";
import { CabComparisonResponse, CabOption } from "@/lib/types";

export default function CabComparisonPage() {
  const [distanceKm, setDistanceKm] = useState("5");
  const [result, setResult] = useState<CabComparisonResponse | null>(null);
  const [error, setError] = useState("");

  async function runComparison() {
    setError("");
    try {
      const stationRaw = window.localStorage.getItem("exit_right_station");
      const destinationRaw = window.localStorage.getItem("exit_right_destination");
      if (!stationRaw || !destinationRaw) {
        throw new Error("Select station and destination first");
      }
      const station = JSON.parse(stationRaw);
      const destination = JSON.parse(destinationRaw);
      const data = await compareCabs({
        pickup_lat: station.latitude,
        pickup_lng: station.longitude,
        drop_lat: destination.lat,
        drop_lng: destination.lng,
        distance_km: Number(distanceKm),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compare cabs");
    }
  }

  function openProvider(option: CabOption) {
    window.location.href = option.deep_link;
    window.setTimeout(() => {
      window.location.href = option.fallback_link;
    }, 1200);
  }

  return (
    <AppShell>
      <section className="space-y-4">
        <div className="ui-card p-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#000666]">Cab Comparison</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="ui-input w-48"
              placeholder="Distance (km)"
            />
            <button onClick={runComparison} className="ui-button-primary">
              Compare Providers
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {result?.options.map((option) => (
            <CabCard key={option.provider} option={option} onGo={openProvider} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
