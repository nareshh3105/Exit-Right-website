"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { compareCabs } from "@/lib/api";
import { CabComparisonResponse, CabOption } from "@/lib/types";

export default function CabComparisonPage() {
  const router = useRouter();
  const [result, setResult] = useState<CabComparisonResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runComparison() {
    setError("");
    setLoading(true);
    try {
      const stationRaw = window.localStorage.getItem("exit_right_station");
      const destinationRaw = window.localStorage.getItem("exit_right_destination");
      if (!stationRaw || !destinationRaw) {
        throw new Error("Please select station and destination first");
      }
      const station = JSON.parse(stationRaw);
      const destination = JSON.parse(destinationRaw);

      const data = await compareCabs({
        pickup_lat: station.latitude,
        pickup_lng: station.longitude,
        drop_lat: destination.lat,
        drop_lng: destination.lng,
        distance_km: 5, // default; improved once Maps API distance is real
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compare cabs");
    } finally {
      setLoading(false);
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
      <div className="space-y-4">
        {/* Header */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            ROUTE COMPARISON
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">Choose your ride</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Live fare estimates from available providers
          </p>
        </div>

        {/* Compare button */}
        <button
          onClick={runComparison}
          disabled={loading}
          className="w-full rounded-xl py-3.5 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "#1a237e" }}
        >
          {loading ? "Fetching prices…" : "Compare Cabs"}
        </button>

        {error && (
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-1 text-xs font-bold text-red-600 underline"
            >
              ← Set station &amp; destination
            </button>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-10">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200"
              style={{ borderTopColor: "#1a237e" }}
            />
            <p className="text-sm text-slate-500">Getting live prices…</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-3">
            {result.options.map((option) => (
              <div
                key={option.provider}
                className="rounded-2xl p-4"
                style={
                  option.recommended
                    ? { background: "#fff", border: "2px solid #1a237e" }
                    : { background: "#fff", border: "1px solid #e2e8f0" }
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl text-white"
                    style={{ background: "#1a237e" }}
                  >
                    🚗
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-800">{option.provider}</p>
                      {option.recommended && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          RECOMMENDED
                        </span>
                      )}
                      {option.cheapest && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                          CHEAPEST
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      ₹{option.estimated_price_inr} &bull; {option.eta_min} min ETA
                    </p>
                  </div>
                  <button
                    onClick={() => openProvider(option)}
                    className="rounded-xl px-3 py-2 text-xs font-bold text-white"
                    style={{ background: "#f97316" }}
                  >
                    BOOK
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center gap-4 py-14 text-center">
            <span className="text-5xl">🛺</span>
            <div>
              <p className="font-bold text-slate-800">Compare live cab prices</p>
              <p className="mt-1 text-sm text-slate-500">
                Tap &ldquo;Compare Cabs&rdquo; above to see Uber, Ola and more
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
