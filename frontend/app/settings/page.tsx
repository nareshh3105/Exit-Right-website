import Link from "next/link";

import { AppShell } from "@/components/AppShell";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h1 className="mb-2 text-2xl font-bold text-brand-900">Settings</h1>
          <p className="text-sm text-slate-700">
            Manage recommendation preferences, safety/time/cost priorities, and account behavior for EXIT RIGHT.
          </p>
        </article>
        <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h2 className="mb-2 text-lg font-bold text-brand-900">Notifications</h2>
          <p className="mb-4 text-sm text-slate-700">Control commute alerts, rain warnings, and disruption updates.</p>
          <Link href="/settings/notifications" className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
            Open Notification Preferences
          </Link>
        </article>
      </section>
    </AppShell>
  );
}
