"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { TransportCard } from "@/components/TransportCard";
import { recommendRoute } from "@/lib/api";
import { RecommendationResponse } from "@/lib/types";

export default function RecommendationPage() {
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateRecommendation() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const stationRaw = window.localStorage.getItem("exit_right_station");
      const destinationRaw = window.localStorage.getItem("exit_right_destination");
      if (!stationRaw || !destinationRaw) {
        throw new Error("Select station and destination first");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate recommendation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="space-y-5">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <h1 className="mb-3 text-2xl font-bold text-brand-900">Recommendation</h1>
          <button onClick={generateRecommendation} className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
            {loading ? "Calculating..." : "Run Exit + Route Recommendation"}
          </button>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>

        {result ? (
          <>
            <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-bold text-brand-900">Best Exit Gate</h2>
              <p className="mt-1 text-sm text-slate-700">
                {result.best_exit.gate_code} - {result.best_exit.gate_name}
              </p>
              <p className="text-sm text-slate-700">Distance to destination: {result.best_exit.distance_km} km</p>
            </article>

            <section className="grid gap-4 md:grid-cols-2">
              {result.transport_ranking.map((option, index) => (
                <TransportCard key={option.mode} option={option} winner={index === 0} />
              ))}
            </section>
          </>
        ) : null}
      </section>
    </AppShell>
  );
}
