-- Cardboard Mania — Phase 0/1 schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).

create extension if not exists pg_trgm;

-- ---------- Tables ----------

-- Public profile for each auth user (auth.users is managed by Supabase).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9-]{3,20}$'),
  tier text not null default 'free',
  location text,
  created_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  slug text unique not null,
  theme text not null default 'classic',
  created_at timestamptz not null default now()
);

create table public.components (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  type text not null,
  config jsonb not null default '{}'::jsonb,
  position int not null default 0
);

-- Shared card reference table, normalized across vendors (see PRD cross-phase notes).
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- sport | non-sport | tcg
  subcategory text,       -- e.g. baseball, pokemon, garbage-pail-kids
  set_name text,
  year text,
  card_number text,
  name text not null,
  variant text,
  image_url text,
  source_vendor text,
  vendor_card_id text,
  created_at timestamptz not null default now(),
  unique (source_vendor, vendor_card_id)
);

create index cards_name_trgm_idx on public.cards using gin (name gin_trgm_ops);
create index cards_set_trgm_idx on public.cards using gin (set_name gin_trgm_ops);
create index cards_category_idx on public.cards (category, subcategory);

create table public.want_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  notes text,
  grade_preference text,
  created_at timestamptz not null default now()
);

create table public.have_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  notes text,
  grade_preference text,
  created_at timestamptz not null default now()
);

create index want_list_user_idx on public.want_list_items (user_id);
create index want_list_card_idx on public.want_list_items (card_id);
create index have_list_user_idx on public.have_list_items (user_id);
create index have_list_card_idx on public.have_list_items (card_id);

create table public.show_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  date date not null,
  location text,
  notes text
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null,
  url text not null
);

-- ---------- Signup trigger: auto-create profile + page + starter component ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  new_page_id uuid;
begin
  uname := coalesce(
    nullif(lower(new.raw_user_meta_data ->> 'username'), ''),
    'user-' || left(new.id::text, 8)
  );
  insert into public.profiles (id, username) values (new.id, uname);
  insert into public.pages (user_id, slug) values (new.id, uname)
    returning id into new_page_id;
  insert into public.components (page_id, type, config, position)
    values (new_page_id, 'profile', '{}'::jsonb, 0);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
-- Everything is publicly readable (pages are meant to be shared);
-- writes are restricted to the owning user. Cards are read-only to
-- users; the seed script writes with the service-role key, which
-- bypasses RLS.

alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.components enable row level security;
alter table public.cards enable row level security;
alter table public.want_list_items enable row level security;
alter table public.have_list_items enable row level security;
alter table public.show_events enable row level security;
alter table public.social_links enable row level security;

create policy "profiles are public" on public.profiles
  for select using (true);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "pages are public" on public.pages
  for select using (true);
create policy "users manage own pages" on public.pages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "components are public" on public.components
  for select using (true);
create policy "users manage own components" on public.components
  for all using (
    exists (
      select 1 from public.pages p
      where p.id = page_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.pages p
      where p.id = page_id and p.user_id = auth.uid()
    )
  );

create policy "cards are public" on public.cards
  for select using (true);

create policy "want lists are public" on public.want_list_items
  for select using (true);
create policy "users manage own want list" on public.want_list_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "have lists are public" on public.have_list_items
  for select using (true);
create policy "users manage own have list" on public.have_list_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "shows are public" on public.show_events
  for select using (true);
create policy "users manage own shows" on public.show_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "social links are public" on public.social_links
  for select using (true);
create policy "users manage own social links" on public.social_links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
