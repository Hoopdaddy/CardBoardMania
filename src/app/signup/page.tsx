"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabase";
import { validateUsername } from "@/lib/reserved";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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

    const uname = username.toLowerCase().trim();
    const invalid = validateUsername(uname);
    if (invalid) {
      setError(invalid);
      return;
    }

    setBusy(true);
    const supabase = supabaseBrowser();

    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", uname)
      .maybeSingle();
    if (taken) {
      setError("That username is taken.");
      setBusy(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: uname } },
    });
    setBusy(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.replace("/dashboard");
    } else {
      setNotice(
        "Almost there — check your email for a confirmation link, then log in."
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-navy px-4 pt-16">
      <Link href="/" className="text-2xl font-extrabold text-white">
        Cardboard<span className="text-accent">Mania</span>
      </Link>
      <div className="mt-8 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-xl font-bold text-navy">Claim your page</h1>
        {notice ? (
          <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            {notice}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="flex items-center rounded-md border border-gray-300 focus-within:border-accent">
                <span className="pl-3 text-sm text-gray-400">
                  cardboardmania.com/
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md px-1 py-2 text-sm outline-none"
                  placeholder="yourname"
                  required
                  autoFocus
                />
              </div>
            </div>
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
                minLength={8}
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
              className="w-full rounded-md bg-accent py-2.5 font-bold text-navy hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create my page"}
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have a page?{" "}
          <Link href="/login" className="font-semibold text-navy underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
