import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isSupabaseConfigured, supabaseServer } from "@/lib/supabase";
import {
  Card,
  GalleryImage,
  PageComponent,
  Profile,
  ProfileConfig,
  ShowEvent,
  SocialLink,
  WantHaveItem,
} from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ username: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} — Cardboard Mania`,
    description: `${username}'s card page on Cardboard Mania: want list, have list, shows, and more.`,
  };
}

function cardLabel(card: Card): string {
  return [
    card.year,
    card.set_name,
    card.card_number ? `#${card.card_number}` : null,
    card.name,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PublicPage({ params }: { params: Params }) {
  const { username } = await params;

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-navy">Not configured</h1>
        <p className="mt-3 text-sm text-gray-600">
          Supabase keys are missing from <code>.env.local</code>.
        </p>
      </main>
    );
  }

  const supabase = supabaseServer();
  const { data: profile } = (await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle()) as { data: Profile | null };
  if (!profile) notFound();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  const { data: componentsData } = page
    ? await supabase
        .from("components")
        .select("*")
        .eq("page_id", page.id)
        .order("position")
    : { data: [] };
  const components = (componentsData ?? []) as PageComponent[];
  const types = new Set(components.map((c) => c.type));

  const [wantRes, haveRes, showsRes, socialsRes] = await Promise.all([
    types.has("want_list")
      ? supabase
          .from("want_list_items")
          .select("*, cards(*)")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    types.has("have_list")
      ? supabase
          .from("have_list_items")
          .select("*, cards(*)")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    types.has("shows")
      ? supabase
          .from("show_events")
          .select("*")
          .eq("user_id", profile.id)
          .order("date")
      : Promise.resolve({ data: [] }),
    types.has("socials")
      ? supabase
          .from("social_links")
          .select("*")
          .eq("user_id", profile.id)
          .order("platform")
      : Promise.resolve({ data: [] }),
  ]);
  const wantItems = (wantRes.data ?? []) as WantHaveItem[];
  const haveItems = (haveRes.data ?? []) as WantHaveItem[];
  const shows = (showsRes.data ?? []) as ShowEvent[];
  const socials = (socialsRes.data ?? []) as SocialLink[];

  const profileCfg = (components.find((c) => c.type === "profile")?.config ??
    {}) as ProfileConfig;
  const displayName = profileCfg.displayName || profile.username;

  function renderList(title: string, items: WantHaveItem[], accent: boolean) {
    return (
      <section className="rounded-xl border border-navy/10 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
          {accent ? "🎯" : "📦"} {title}
          <span className="rounded-full bg-navy/5 px-2 py-0.5 text-xs font-semibold text-navy/60">
            {items.length}
          </span>
        </h2>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">Nothing here yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="py-2">
                <p className="text-sm font-medium text-navy">
                  {item.cards ? cardLabel(item.cards) : "Unknown card"}
                </p>
                {(item.grade_preference || item.notes) && (
                  <p className="text-xs text-gray-500">
                    {[item.grade_preference, item.notes]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <div className="space-y-4">
          {components.map((comp) => {
            switch (comp.type) {
              case "profile": {
                return (
                  <section
                    key={comp.id}
                    className="rounded-xl bg-navy p-6 text-center text-white shadow-sm"
                  >
                    {profileCfg.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileCfg.avatarUrl}
                        alt={displayName}
                        className="mx-auto h-20 w-20 rounded-full border-2 border-accent object-cover"
                      />
                    ) : (
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent bg-navy-light text-3xl font-bold text-accent">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h1 className="mt-3 text-2xl font-extrabold">{displayName}</h1>
                    <p className="text-sm text-white/60">@{profile.username}</p>
                    {profile.location && (
                      <p className="mt-1 text-sm text-white/80">
                        📍 {profile.location}
                      </p>
                    )}
                    {profileCfg.bio && (
                      <p className="mx-auto mt-3 max-w-md text-sm text-white/90">
                        {profileCfg.bio}
                      </p>
                    )}
                  </section>
                );
              }
              case "gallery": {
                const images =
                  ((comp.config.images as GalleryImage[] | undefined) ?? []);
                if (images.length === 0) return null;
                return (
                  <section
                    key={comp.id}
                    className="rounded-xl border border-navy/10 bg-white p-5 shadow-sm"
                  >
                    <h2 className="text-lg font-bold text-navy">🖼️ Gallery</h2>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {images.map((img, i) => (
                        <figure key={i}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.caption || `Image ${i + 1}`}
                            className="aspect-square w-full rounded-md object-cover"
                          />
                          {img.caption && (
                            <figcaption className="mt-1 text-xs text-gray-500">
                              {img.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </section>
                );
              }
              case "want_list":
                return (
                  <div key={comp.id}>
                    {renderList("Want List", wantItems, true)}
                  </div>
                );
              case "have_list":
                return (
                  <div key={comp.id}>
                    {renderList("Have List", haveItems, false)}
                  </div>
                );
              case "shows": {
                if (shows.length === 0) return null;
                return (
                  <section
                    key={comp.id}
                    className="rounded-xl border border-navy/10 bg-white p-5 shadow-sm"
                  >
                    <h2 className="text-lg font-bold text-navy">
                      📅 Where to find me
                    </h2>
                    <ul className="mt-3 divide-y divide-gray-100">
                      {shows.map((s) => (
                        <li key={s.id} className="py-2">
                          <p className="text-sm font-medium text-navy">{s.name}</p>
                          <p className="text-xs text-gray-500">
                            {[formatDate(s.date), s.location, s.notes]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              }
              case "socials": {
                if (socials.length === 0) return null;
                return (
                  <section
                    key={comp.id}
                    className="rounded-xl border border-navy/10 bg-white p-5 shadow-sm"
                  >
                    <h2 className="text-lg font-bold text-navy">🔗 Find me online</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {socials.map((l) => (
                        <a
                          key={l.id}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-navy/20 bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-accent hover:bg-accent/10"
                        >
                          {l.platform}
                        </a>
                      ))}
                    </div>
                  </section>
                );
              }
              default:
                return null;
            }
          })}
        </div>

        <footer className="mt-10 text-center text-xs text-gray-400">
          <Link href="/" className="hover:underline">
            Built with <span className="font-semibold">CardboardMania</span> —
            claim your own page free
          </Link>
        </footer>
      </div>
    </main>
  );
}
