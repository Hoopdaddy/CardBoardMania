"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import {
  Card,
  GalleryImage,
  Profile,
  ProfileConfig,
  ShowEvent,
  SOCIAL_PLATFORMS,
  SocialLink,
  WantHaveItem,
} from "@/lib/types";

export function cardLabel(card: Card): string {
  const parts = [
    card.year,
    card.set_name,
    card.card_number ? `#${card.card_number}` : null,
    card.name,
  ].filter(Boolean);
  return parts.join(" ");
}

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-accent";
const btnCls =
  "rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-50";

/* ---------------- Profile ---------------- */

export function ProfileEditor({
  profile,
  config,
  onSave,
}: {
  profile: Profile;
  config: Record<string, unknown>;
  onSave: (cfg: ProfileConfig) => void;
}) {
  const cfg = config as ProfileConfig;
  const [displayName, setDisplayName] = useState(cfg.displayName ?? "");
  const [bio, setBio] = useState(cfg.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(cfg.avatarUrl ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [saved, setSaved] = useState(false);

  async function save() {
    onSave({ displayName, bio, avatarUrl });
    await supabaseBrowser()
      .from("profiles")
      .update({ location: location || null })
      .eq("id", profile.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Display name (e.g. Bird Dog Sports Cards)"
        className={inputCls}
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio — what you collect, what you sell, how long you've been in the hobby…"
        rows={3}
        className={inputCls}
      />
      <input
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        placeholder="Avatar image URL (optional)"
        className={inputCls}
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location (e.g. Columbus, OH)"
        className={inputCls}
      />
      <button onClick={save} className={btnCls}>
        {saved ? "Saved ✓" : "Save profile"}
      </button>
    </div>
  );
}

/* ---------------- Gallery ---------------- */

export function GalleryEditor({
  config,
  onSave,
}: {
  config: Record<string, unknown>;
  onSave: (cfg: { images: GalleryImage[] }) => void;
}) {
  const images = (config.images as GalleryImage[] | undefined) ?? [];
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  function add() {
    if (!url.trim()) return;
    onSave({ images: [...images, { url: url.trim(), caption: caption.trim() }] });
    setUrl("");
    setCaption("");
  }

  function remove(index: number) {
    onSave({ images: images.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption || `Gallery image ${i + 1}`}
                className="aspect-square w-full rounded-md object-cover"
              />
              <button
                onClick={() => remove(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Image URL (paste a link to your photo)"
        className={inputCls}
      />
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (optional)"
        className={inputCls}
      />
      <button onClick={add} disabled={!url.trim()} className={btnCls}>
        Add image
      </button>
      <p className="text-xs text-gray-400">
        Tip: paste image links for now — direct photo uploads are coming.
      </p>
    </div>
  );
}

/* ---------------- Want / Have lists ---------------- */

export function WantHaveEditor({
  table,
  userId,
}: {
  table: "want_list_items" | "have_list_items";
  userId: string;
}) {
  const [items, setItems] = useState<WantHaveItem[]>([]);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Card[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Card | null>(null);
  const [grade, setGrade] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabaseBrowser()
      .from(table)
      .select("*, cards(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as WantHaveItem[]);
  }, [table, userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setResults(json.cards ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function addItem() {
    if (!selected) return;
    const { error } = await supabaseBrowser().from(table).insert({
      user_id: userId,
      card_id: selected.id,
      grade_preference: grade.trim() || null,
      notes: notes.trim() || null,
    });
    if (error) {
      setErr(error.message);
      return;
    }
    setSelected(null);
    setGrade("");
    setNotes("");
    setQ("");
    setResults([]);
    load();
  }

  async function removeItem(id: string) {
    await supabaseBrowser().from(table).delete().eq("id", id);
    load();
  }

  return (
    <div className="space-y-3">
      {!selected && (
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cards by name or set…"
            className={inputCls}
          />
          {q.trim().length >= 2 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
              {searching && (
                <p className="p-3 text-sm text-gray-400">Searching…</p>
              )}
              {!searching && results.length === 0 && (
                <p className="p-3 text-sm text-gray-400">
                  No cards found — try another search, or seed more sets.
                </p>
              )}
              {results.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelected(card)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-accent/10"
                >
                  <span className="font-medium text-navy">{card.name}</span>
                  <span className="block text-xs text-gray-500">
                    {[card.year, card.set_name, card.card_number && `#${card.card_number}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="rounded-md border border-accent/50 bg-accent/5 p-3">
          <p className="text-sm font-semibold text-navy">{cardLabel(selected)}</p>
          <div className="mt-2 space-y-2">
            <input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Grade preference (optional — e.g. PSA 9+, raw ok)"
              className={inputCls}
            />
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className={inputCls}
            />
            <div className="flex gap-2">
              <button onClick={addItem} className={btnCls}>
                Add to list
              </button>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}

      {items.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between py-2">
              <div>
                <p className="text-sm font-medium text-navy">
                  {item.cards ? cardLabel(item.cards) : "Unknown card"}
                </p>
                {(item.grade_preference || item.notes) && (
                  <p className="text-xs text-gray-500">
                    {[item.grade_preference, item.notes].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-2 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">No cards yet — search above to add one.</p>
      )}
    </div>
  );
}

/* ---------------- Shows ---------------- */

export function ShowsEditor({ userId }: { userId: string }) {
  const [shows, setShows] = useState<ShowEvent[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabaseBrowser()
      .from("show_events")
      .select("*")
      .eq("user_id", userId)
      .order("date");
    setShows((data ?? []) as ShowEvent[]);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!name.trim() || !date) return;
    await supabaseBrowser().from("show_events").insert({
      user_id: userId,
      name: name.trim(),
      date,
      location: location.trim() || null,
      notes: notes.trim() || null,
    });
    setName("");
    setDate("");
    setLocation("");
    setNotes("");
    load();
  }

  async function remove(id: string) {
    await supabaseBrowser().from("show_events").delete().eq("id", id);
    load();
  }

  return (
    <div className="space-y-3">
      {shows.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {shows.map((s) => (
            <li key={s.id} className="flex items-start justify-between py-2">
              <div>
                <p className="text-sm font-medium text-navy">{s.name}</p>
                <p className="text-xs text-gray-500">
                  {[s.date, s.location, s.notes].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                onClick={() => remove(s.id)}
                className="ml-2 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Show name"
          className={inputCls}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (venue, city)"
          className={inputCls}
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (table #, hours…)"
          className={inputCls}
        />
      </div>
      <button onClick={add} disabled={!name.trim() || !date} className={btnCls}>
        Add show
      </button>
    </div>
  );
}

/* ---------------- Socials ---------------- */

export function SocialsEditor({ userId }: { userId: string }) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [platform, setPlatform] = useState<string>(SOCIAL_PLATFORMS[0]);
  const [url, setUrl] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabaseBrowser()
      .from("social_links")
      .select("*")
      .eq("user_id", userId)
      .order("platform");
    setLinks((data ?? []) as SocialLink[]);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!url.trim()) return;
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    await supabaseBrowser()
      .from("social_links")
      .insert({ user_id: userId, platform, url: u });
    setUrl("");
    load();
  }

  async function remove(id: string) {
    await supabaseBrowser().from("social_links").delete().eq("id", id);
    load();
  }

  return (
    <div className="space-y-3">
      {links.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {links.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy">{l.platform}</p>
                <p className="truncate text-xs text-gray-500">{l.url}</p>
              </div>
              <button
                onClick={() => remove(l.id)}
                className="ml-2 shrink-0 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:border-accent"
        >
          {SOCIAL_PLATFORMS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Profile URL"
          className={inputCls}
        />
      </div>
      <button onClick={add} disabled={!url.trim()} className={btnCls}>
        Add link
      </button>
    </div>
  );
}
