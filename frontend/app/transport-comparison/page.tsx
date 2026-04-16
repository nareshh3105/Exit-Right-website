"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { TransportCard } from "@/components/TransportCard";
import { recommendRoute } from "@/lib/api";
import { RecommendationResponse } from "@/lib/types";

export default function TransportComparisonPage() {
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [message, setMessage] = useState("");

  async function refreshComparison() {
    setMessage("");
    try {
      const stationRaw = window.localStorage.getItem("exit_right_station");
      const destinationRaw = window.localStorage.getItem("exit_right_destination");
      if (!stationRaw || !destinationRaw) {
        throw new Error("Station and destination are required");
      }
      const station = JSON.parse(stationRaw);
      const destination = JSON.parse(destinationRaw);
      const data = await recommendRoute({
        station_id: station.id,
        destination_name: destination.name,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
      });
      setResult(data);
      setMessage(`Best mode: ${data.recommended_mode.toUpperCase()}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to compare transport");
    }
  }

  return (
    <AppShell>
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-bold text-brand-900">Transport Comparison</h1>
        <button onClick={refreshComparison} className="mt-3 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
          Compare Walking / Shared Auto / Bus / Cab
        </button>
        {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        {result?.transport_ranking.map((option, index) => (
          <TransportCard key={option.mode} option={option} winner={index === 0} />
        ))}
      </section>
    </AppShell>
  );
}
