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
        <div className="ui-card p-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#000666]">Recommendation History</h1>
          <button onClick={loadHistory} className="ui-button-primary mt-3">
            Refresh History
          </button>
          {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="ui-card p-4">
              <p className="font-semibold text-[#1b1c1c]">{item.destination_name}</p>
              <p className="text-sm text-slate-600">Mode: {item.recommended_mode}</p>
              <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
