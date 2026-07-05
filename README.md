# Cardboard Mania

A mobile-first platform for card dealers and collectors — build a personalized
page from drop-in components (bio, image gallery, want/have lists, show
calendar, social links) and share it anywhere.

**Domain:** cardboardmania.com · **Status:** Phase 0 + 1 (Foundations + Core MVP)

## Stack

- [Next.js 15](https://nextjs.org) (App Router, TypeScript) + Tailwind CSS v4
- [Supabase](https://supabase.com) — auth + Postgres (with Row Level Security)
- [CardSight AI](https://cardsight.ai) — card catalog data (12M+ cards)

## Setup

### 1. Install

```bash
npm install
```

### 2. Create the Supabase project (free)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
   (any name, e.g. `cardboard-mania`; pick a strong DB password and save it).
2. When it finishes provisioning, open **SQL Editor → New query**, paste the
   entire contents of [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql),
   and click **Run**. This creates all tables, security policies, and the
   signup trigger.
3. Go to **Project Settings → API** and copy three values into `.env.local`
   (copy `.env.example` if it doesn't exist):
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, used by the seed script)
4. Optional, recommended while testing: **Authentication → Providers → Email →
   turn OFF "Confirm email"** so signups log in immediately.

### 3. Seed card data from CardSight

```bash
npm run seed:cards -- --query "2023 topps chrome"
npm run seed:cards -- --query "pokemon 151"
```

The script searches CardSight sets, seeds the top match into the shared
`cards` table, and prints alternates you can seed by id:

```bash
npm run seed:cards -- --set-id <uuid> --category sport --subcategory football
```

Re-running is safe — rows are upserted on `(source_vendor, vendor_card_id)`.
Each ~200-card set costs ~3 CardSight API calls (free tier: 750/month).

### 4. Run

```bash
npm run dev
```

- `/` — landing page
- `/signup` → claim a username → `/dashboard` — add/reorder/edit page sections
- `/<username>` — the public, shareable page

## Data model (Phase 0/1)

`profiles` → `pages` → `components` (polymorphic JSON config), plus the shared
`cards` reference table and per-user `want_list_items`, `have_list_items`,
`show_events`, `social_links`. All tables are publicly readable (pages are
meant to be shared) and owner-writable via RLS. See the
[PRD phases](supabase/migrations/001_init.sql) for what's next: marketplace &
reputation (Phase 2), discovery (Phase 3), monetization (Phase 4).

## Secrets

`.env.local` is gitignored and holds all keys. The `service_role` key must
never be imported by app code — only `scripts/seed-cards.mjs` uses it.
