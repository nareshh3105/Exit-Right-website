"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";

export default function NotificationPreferencesPage() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [rainAlerts, setRainAlerts] = useState(true);
  const [saved, setSaved] = useState("");

  function save() {
    setSaved(
      `Saved: email=${email ? "on" : "off"}, push=${push ? "on" : "off"}, rain alerts=${rainAlerts ? "on" : "off"}`,
    );
  }

  return (
    <AppShell>
      <section className="max-w-xl rounded-2xl bg-white p-6 shadow-soft">
        <h1 className="mb-4 text-2xl font-bold text-brand-900">Notification Preferences</h1>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-xl border border-brand-100 px-4 py-3">
            Email notifications
            <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-brand-100 px-4 py-3">
            Push notifications
            <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-brand-100 px-4 py-3">
            Rain impact alerts
            <input type="checkbox" checked={rainAlerts} onChange={(e) => setRainAlerts(e.target.checked)} />
          </label>
        </div>
        <button onClick={save} className="mt-4 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
          Save Preferences
        </button>
        {saved ? <p className="mt-3 text-sm text-slate-700">{saved}</p> : null}
      </section>
    </AppShell>
  );
}
