"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { recommendRoute } from "@/lib/api";
import { RecommendationResponse } from "@/lib/types";

const MODE_META: Record<string, { icon: string; label: string }> = {
  walking:      { icon: "🚶", label: "Walk" },
  shared_auto:  { icon: "🛺", label: "Auto Rickshaw" },
  bus:          { icon: "🚌", label: "Metro Feeder Bus" },
  cab:          { icon: "🚕", label: "Cab" },
};

export default function RecommendationPage() {
  const router = useRouter();
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stationName, setStationName] = useState("");
  const [destName, setDestName] = useState("");

  useEffect(() => {
    const stationRaw = window.localStorage.getItem("exit_right_station");
    const destRaw = window.localStorage.getItem("exit_right_destination");
    if (stationRaw) {
      try { setStationName(JSON.parse(stationRaw).name ?? ""); } catch { /* ignore */ }
    }
    if (destRaw) {
      try { setDestName(JSON.parse(destRaw).name ?? ""); } catch { /* ignore */ }
    }
    // Auto-fetch if both are set
    if (stationRaw && destRaw) {
      void generateRecommendation(JSON.parse(stationRaw), JSON.parse(destRaw));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateRecommendation(
    station?: { id: string; name: string },
    destination?: { name: string; lat: number; lng: number }
  ) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const stationData = station ?? JSON.parse(window.localStorage.getItem("exit_right_station") ?? "null");
      const destData = destination ?? JSON.parse(window.localStorage.getItem("exit_right_destination") ?? "null");

      if (!stationData || !destData) {
        throw new Error("Please select station and destination first");
      }
      const data = await recommendRoute({
        station_id: stationData.id,
        destination_name: destData.name,
        destination_lat: destData.lat,
        destination_lng: destData.lng,
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
      <div className="space-y-4">
        {/* Trip summary header */}
        <div className="ui-card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            YOUR TRIP
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="font-bold text-slate-800 truncate">{stationName || "—"}</span>
            <span className="text-slate-400">→</span>
            <span className="font-bold text-slate-800 truncate">{destName || "—"}</span>
          </div>
          {(!stationName || !destName) && (
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-2 text-xs font-semibold underline"
              style={{ color: "#1a237e" }}
            >
              ← Set station &amp; destination
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200"
              style={{ borderTopColor: "#1a237e" }}
            />
            <p className="text-sm text-slate-500">Calculating best route…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => generateRecommendation()}
              className="mt-2 text-xs font-bold underline text-red-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Recommended exit */}
            <div
              className="flex items-center gap-4 rounded-2xl p-5 text-white"
              style={{ background: "#1a237e" }}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                  RECOMMENDED EXIT
                </p>
                <p className="text-4xl font-extrabold">{result.best_exit.gate_code}</p>
                <p className="mt-0.5 text-sm text-blue-200">{result.best_exit.gate_name}</p>
              </div>
              <div className="ml-auto text-right">
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                  BEST ROUTE
                </span>
              </div>
            </div>

            {/* Transport options */}
            <section>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                TRANSPORT OPTIONS
              </p>
              <div className="space-y-3">
                {result.transport_ranking.map((option, index) => {
                  const meta = MODE_META[option.mode] ?? { icon: "🚗", label: option.mode };
                  const isBest = index === 0;
                  return (
                    <div
                      key={option.mode}
                      className="rounded-2xl p-4"
                      style={
                        isBest
                          ? { background: "#1a237e", color: "#fff" }
                          : { background: "#fff", border: "1px solid #e2e8f0" }
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meta.icon}</span>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`font-bold ${isBest ? "text-white" : "text-slate-800"}`}>
                              {meta.label}
                            </p>
                            {isBest && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#f97316" }}>
                                BEST CHOICE
                              </span>
                            )}
                          </div>
                          <p className={`mt-0.5 text-xs ${isBest ? "text-blue-200" : "text-slate-500"}`}>
                            ₹{option.estimated_cost_inr} &bull; {option.estimated_travel_time_min} min
                          </p>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={
                            isBest
                              ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                              : { background: "#f1f5f9", color: "#64748b" }
                          }
                        >
                          {option.crowd_indicator}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Refresh button */}
            <button
              onClick={() => generateRecommendation()}
              className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              ↻ Recalculate
            </button>
          </>
        )}

        {/* Empty state — no result yet and not loading */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="text-5xl">🚇</span>
            <div>
              <p className="font-bold text-slate-800">Ready to plan your trip</p>
              <p className="mt-1 text-sm text-slate-500">
                Select a station and destination on the home screen
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl px-6 py-3 font-bold text-white"
              style={{ background: "#1a237e" }}
            >
              ← Go to Home
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
