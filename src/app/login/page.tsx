"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the dev server."
      );
      return;
    }

    setBusy(true);
    const supabase = supabaseBrowser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-navy px-4 pt-16">
      <Link href="/" className="text-2xl font-extrabold text-white">
        Cardboard<span className="text-accent">Mania</span>
      </Link>
      <div className="mt-8 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-xl font-bold text-navy">Log in</h1>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-accent"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-accent"
              required
            />
          </div>
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-navy py-2.5 font-bold text-white hover:bg-navy-light disabled:opacity-50"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-navy underline">
            Claim your page
          </Link>
        </p>
      </div>
    </main>
  );
}
