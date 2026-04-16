"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { recommendationHistory } from "@/lib/api";

type HistoryItem = {
  id: string;
  destination_name: string;
  recommended_mode: string;
  created_at: string;
};

export default function RecommendationHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [message, setMessage] = useState("");

  async function loadHistory() {
    setMessage("");
    try {
      const data = await recommendationHistory();
      setItems(data);
      if (!data.length) {
        setMessage("No recommendation history yet");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to load history");
    }
  }

  return (
    <AppShell>
      <section className="space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <h1 className="text-2xl font-bold text-brand-900">Recommendation History</h1>
          <button onClick={loadHistory} className="mt-3 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
            Refresh History
          </button>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
              <p className="font-semibold text-brand-900">{item.destination_name}</p>
              <p className="text-sm text-slate-700">Mode: {item.recommended_mode}</p>
              <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
