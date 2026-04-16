import Link from "next/link";

import { AppShell } from "@/components/AppShell";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="ui-card p-5">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#000666]">Settings</h1>
          <p className="text-sm text-slate-600">
            Manage recommendation preferences, safety/time/cost priorities, and account behavior for EXIT RIGHT.
          </p>
        </article>
        <article className="ui-card p-5">
          <h2 className="mb-2 text-lg font-bold text-[#1b1c1c]">Notifications</h2>
          <p className="mb-4 text-sm text-slate-600">Control commute alerts, rain warnings, and disruption updates.</p>
          <Link href="/settings/notifications" className="ui-button-primary">
            Open Notification Preferences
          </Link>
        </article>
      </section>
    </AppShell>
  );
}
