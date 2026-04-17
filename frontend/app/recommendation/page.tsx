"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { recommendRoute } from "@/lib/api";
import { RecommendationResponse } from "@/lib/types";

const TRANSPORT_UI: Record<string, { icon: string; label: string; price: string; time: string; crowd: string; crowdColor: string }> = {
  walking:     { icon: "🚶", label: "Walk",               price: "₹0",   time: "20 min", crowd: "LOW CROWD",      crowdColor: "#16a34a" },
  shared_auto: { icon: "🛺", label: "Auto Rickshaw",       price: "₹40",  time: "5 min",  crowd: "HIGH CROWD",     crowdColor: "#ef4444" },
  bus:         { icon: "🚌", label: "Metro Feeder Bus",    price: "₹10",  time: "15 min", crowd: "MODERATE CROWD", crowdColor: "#f97316" },
  cab:         { icon: "🚕", label: "Cab",                 price: "₹120", time: "8 min",  crowd: "LOW CROWD",      crowdColor: "#16a34a" },
};

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

  const topMode = result?.transport_ranking?.[0];

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Recommended exit header */}
        <div className="ui-card flex items-center justify-between p-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              RECOMMENDED EXIT
            </p>
            <p className="text-3xl font-extrabold text-slate-900">
              {result ? result.best_exit.gate_code : "GATE 2"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">
              {result ? result.best_exit.gate_name : "Towards Cyber Hub"}
            </p>
            <button
              onClick={generateRecommendation}
              disabled={loading}
              className="mt-2 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              style={{ background: "#1a237e" }}
            >
              {loading ? "Calculating\u2026" : "Get Recommendation"}
            </button>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        {/* Dark map placeholder */}
        <div
          className="flex h-40 items-center justify-center rounded-2xl text-slate-500"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(99,102,241,0.07) 20px,rgba(99,102,241,0.07) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(99,102,241,0.07) 20px,rgba(99,102,241,0.07) 21px)",
          }}
        >
          <p className="text-xs font-semibold text-slate-500">[ Live Station Map ]</p>
        </div>

        {/* Station status */}
        <div className="ui-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                HAUZ KHAS STATUS
              </p>
              <p className="text-xs text-slate-500">Real-time crowd analysis</p>
            </div>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
              BUSY
            </span>
          </div>
          {/* CSS bar chart */}
          <div className="flex items-end gap-1.5" style={{ height: 48 }}>
            {[40, 60, 80, 95, 70, 50, 65].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${h}%`,
                  background: h > 80 ? "#ef4444" : h > 60 ? "#f97316" : "#1a237e",
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        </div>

        {/* Eco score card */}
        <div
          className="flex items-center gap-4 rounded-2xl p-4 text-white"
          style={{ background: "#16a34a" }}
        >
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-200">
              ECO SCORE
            </p>
            <p className="text-3xl font-extrabold">85%</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-green-800">
              <div className="h-full rounded-full bg-white" style={{ width: "85%" }} />
            </div>
          </div>
          <span className="text-4xl">🌿</span>
        </div>

        {/* Transport Options */}
        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            TRANSPORT OPTIONS
          </p>
          <div className="space-y-3">
            {result
              ? result.transport_ranking.map((option, index) => {
                  const ui = TRANSPORT_UI[option.mode] ?? { icon: "🚗", label: option.mode, price: `₹${option.estimated_cost_inr}`, time: `${option.estimated_travel_time_min} min`, crowd: option.crowd_indicator, crowdColor: "#64748b" };
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
                        <span className="text-2xl">{ui.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-bold ${isBest ? "text-white" : "text-slate-800"}`}>{ui.label}</p>
                            {isBest && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#f97316" }}>
                                BEST CHOICE
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex gap-3 text-xs">
                            <span className={isBest ? "text-blue-200" : "text-slate-500"}>
                              ₹{option.estimated_cost_inr} &bull; {option.estimated_travel_time_min} min
                            </span>
                          </div>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: ui.crowdColor + "22", color: ui.crowdColor }}
                        >
                          {option.crowd_indicator}
                        </span>
                      </div>
                    </div>
                  );
                })
              : /* Default UI before fetch */
                [
                  { mode: "shared_auto", label: "Auto Rickshaw", icon: "🛺", price: "₹40", time: "5 min", crowd: "HIGH CROWD", crowdColor: "#ef4444", best: true },
                  { mode: "bus",         label: "Metro Feeder Bus", icon: "🚌", price: "₹10", time: "15 min", crowd: "MODERATE CROWD", crowdColor: "#f97316", best: false },
                  { mode: "walking",     label: "Walk",            icon: "🚶", price: "₹0",  time: "20 min", crowd: "LOW CROWD",      crowdColor: "#16a34a", best: false },
                ].map((t) => (
                  <div
                    key={t.mode}
                    className="rounded-2xl p-4"
                    style={
                      t.best
                        ? { background: "#1a237e", color: "#fff" }
                        : { background: "#fff", border: "1px solid #e2e8f0" }
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold ${t.best ? "text-white" : "text-slate-800"}`}>{t.label}</p>
                          {t.best && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#f97316" }}>
                              BEST CHOICE
                            </span>
                          )}
                          {t.mode === "walking" && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                              AVOID
                            </span>
                          )}
                        </div>
                        <p className={`mt-0.5 text-xs ${t.best ? "text-blue-200" : "text-slate-500"}`}>
                          {t.price} &bull; {t.time}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: t.crowdColor + "22", color: t.crowdColor }}
                      >
                        {t.crowd}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </section>

        {/* Sticky bottom bar */}
        <div
          className="sticky bottom-20 -mx-4 rounded-t-2xl px-4 py-3 text-white"
          style={{ background: "#1e3a8a" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            NEXT AUTO ARRIVING
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Main Gate &ndash; 2 mins</p>
              <p className="text-xs text-blue-300">₹40 estimated fare</p>
            </div>
            <span className="text-2xl">🛺</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
