import Link from "next/link";

import { AppShell } from "@/components/AppShell";

export default function NotificationPreferencesAliasPage() {
  return (
    <AppShell>
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h1 className="mb-2 text-2xl font-bold text-brand-900">Notification Preferences</h1>
        <p className="mb-4 text-sm text-slate-700">Manage commute alerts and update channels in your settings panel.</p>
        <Link href="/settings/notifications" className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
          Open Preferences
        </Link>
      </section>
    </AppShell>
  );
}
