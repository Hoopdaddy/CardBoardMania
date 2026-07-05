"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabase";
import {
  COMPONENT_LABELS,
  ComponentType,
  Page,
  PageComponent,
  Profile,
} from "@/lib/types";
import {
  GalleryEditor,
  ProfileEditor,
  ShowsEditor,
  SocialsEditor,
  WantHaveEditor,
} from "./editors";

const ALL_TYPES: ComponentType[] = [
  "profile",
  "gallery",
  "want_list",
  "have_list",
  "shows",
  "socials",
];

export default function Builder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = supabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (!prof) {
      setError("No profile found for this account.");
      setLoading(false);
      return;
    }

    let { data: pg } = await supabase
      .from("pages")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!pg) {
      const { data: created, error: pageErr } = await supabase
        .from("pages")
        .insert({ user_id: user.id, slug: prof.username })
        .select()
        .single();
      if (pageErr) {
        setError(pageErr.message);
        setLoading(false);
        return;
      }
      pg = created;
    }

    const { data: comps } = await supabase
      .from("components")
      .select("*")
      .eq("page_id", pg.id)
      .order("position");

    setProfile(prof);
    setPage(pg);
    setComponents((comps ?? []) as PageComponent[]);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    load();
  }, [load]);

  async function addComponent(type: ComponentType) {
    if (!page) return;
    const position = components.length
      ? Math.max(...components.map((c) => c.position)) + 1
      : 0;
    const { error: err } = await supabaseBrowser()
      .from("components")
      .insert({ page_id: page.id, type, config: {}, position });
    if (err) setError(err.message);
    else load();
  }

  async function removeComponent(id: string) {
    await supabaseBrowser().from("components").delete().eq("id", id);
    load();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= components.length) return;
    const a = components[index];
    const b = components[target];
    const supabase = supabaseBrowser();
    await supabase
      .from("components")
      .update({ position: b.position })
      .eq("id", a.id);
    await supabase
      .from("components")
      .update({ position: a.position })
      .eq("id", b.id);
    load();
  }

  async function updateConfig(id: string, config: object) {
    const { error: err } = await supabaseBrowser()
      .from("components")
      .update({ config })
      .eq("id", id);
    if (err) setError(err.message);
    setComponents((cs) =>
      cs.map((c) =>
        c.id === id ? { ...c, config: config as Record<string, unknown> } : c
      )
    );
  }

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.replace("/");
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-navy">Almost ready</h1>
        <p className="mt-3 text-sm text-gray-600">
          Supabase isn&apos;t configured yet. Add{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code>.env.local</code>, run the migration in{" "}
          <code>supabase/migrations/001_init.sql</code>, and restart the dev
          server.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="pt-24 text-center text-gray-500">Loading…</main>
    );
  }

  const missingTypes = ALL_TYPES.filter(
    (t) => !components.some((c) => c.type === t)
  );

  return (
    <main className="min-h-screen pb-24">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-extrabold">
            Cardboard<span className="text-accent">Mania</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {profile && (
              <Link
                href={`/${profile.username}`}
                className="rounded-md bg-accent px-3 py-1.5 font-bold text-navy hover:brightness-110"
              >
                View my page →
              </Link>
            )}
            <button
              onClick={signOut}
              className="rounded-md px-2 py-1.5 text-white/80 hover:bg-navy-light"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-6">
        {profile && (
          <p className="text-sm text-gray-500">
            Building{" "}
            <span className="font-semibold text-navy">
              cardboardmania.com/{profile.username}
            </span>
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-4 space-y-4">
          {components.map((comp, i) => (
            <section
              key={comp.id}
              className="rounded-xl border border-navy/10 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-navy/10 px-4 py-3">
                <h2 className="font-bold text-navy">
                  {COMPONENT_LABELS[comp.type] ?? comp.type}
                </h2>
                <div className="flex items-center gap-1 text-sm">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === components.length - 1}
                    className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeComponent(comp.id)}
                    className="rounded px-2 py-1 text-red-500 hover:bg-red-50"
                    aria-label="Remove component"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4">
                {comp.type === "profile" && profile && (
                  <ProfileEditor
                    profile={profile}
                    config={comp.config}
                    onSave={(cfg) => updateConfig(comp.id, cfg)}
                  />
                )}
                {comp.type === "gallery" && (
                  <GalleryEditor
                    config={comp.config}
                    onSave={(cfg) => updateConfig(comp.id, cfg)}
                  />
                )}
                {comp.type === "want_list" && profile && (
                  <WantHaveEditor table="want_list_items" userId={profile.id} />
                )}
                {comp.type === "have_list" && profile && (
                  <WantHaveEditor table="have_list_items" userId={profile.id} />
                )}
                {comp.type === "shows" && profile && (
                  <ShowsEditor userId={profile.id} />
                )}
                {comp.type === "socials" && profile && (
                  <SocialsEditor userId={profile.id} />
                )}
              </div>
            </section>
          ))}
        </div>

        {missingTypes.length > 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-navy/30 p-4">
            <p className="text-sm font-semibold text-navy">Add a section</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => addComponent(t)}
                  className="rounded-full border border-navy/20 bg-white px-3 py-1.5 text-sm font-medium text-navy hover:border-accent hover:bg-accent/10"
                >
                  + {COMPONENT_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
