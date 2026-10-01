-- Cardboard Mania website — run once in the Supabase SQL editor.

-- Backup copy of every contact-form submission (in case email delivery fails).
create table if not exists public.contact_submissions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  reason       text not null check (reason in ('sell', 'buy', 'show', 'other')),
  name         text not null,
  email        text not null,
  phone        text,
  message      text not null,
  size         text,
  met_show_id  text,
  photo_paths  text[] not null default '{}',
  source       text not null default 'direct',
  page         text,
  referrer     text,
  ip           text,
  user_agent   text
);

create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_source_idx on public.contact_submissions (source);

-- Only the server (service role) touches this table; no public access.
alter table public.contact_submissions enable row level security;

-- Private bucket for uploaded photos (10 MB per file, images only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'contact-photos',
  'contact-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/octet-stream']
)
on conflict (id) do nothing;

-- Handy reporting queries:
--   Submissions per week:      select date_trunc('week', created_at) wk, count(*) from contact_submissions group by 1 order by 1 desc;
--   QR scans that converted:   select source, count(*) from contact_submissions group by 1;
--   Lead quality (has photos): select avg((cardinality(photo_paths) > 0)::int) from contact_submissions where reason = 'sell';
