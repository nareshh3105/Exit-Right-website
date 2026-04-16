"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { signup } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await signup({ full_name: fullName, email, password });
      window.localStorage.setItem("exit_right_token", data.access_token);
      window.localStorage.setItem("exit_right_user", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="mb-4 text-2xl font-bold text-brand-900">Create Account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button disabled={loading} className="w-full rounded-xl bg-brand-700 px-4 py-3 font-bold text-white disabled:opacity-60">
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
