# Cardboard Mania — cardboardmania.com

Mobile-first landing site for Cardboard Mania (Phase 1 MVP from the PRD): Home, We Buy, Shows, About and Contact.
Built with Next.js 15, Tailwind CSS v4 and TypeScript.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything is optional locally
npm run dev
```

With no environment variables set, the site works fully except:
- Contact emails are **printed to the terminal** instead of sent.
- The photo upload field is hidden (needs Supabase).
- Turnstile is skipped.

## Editing content (no code needed)

| What | File |
| --- | --- |
| Card shows | `src/content/shows.json` |
| Copy: what I buy, don't buy, FAQ, how it works, socials, About photo | `src/content/site.ts` |
| About page story | `src/app/about/page.tsx` |

**Shows:** add an entry with `startDate` / `endDate` as `YYYY-MM-DD`. Shows are sorted automatically and disappear
the day after `endDate` (Central time; pages refresh hourly). Leave `table` or `url` as `""` if unknown.
Replace the three `(sample)` shows before launch.

**Socials:** paste a URL into `site.socials` to show its icon in the footer; empty ones stay hidden.

## QR codes

Point the printed QR codes at:

- Tablecloth: `https://cardboardmania.com/?src=tablecloth`
- Stickers: `https://cardboardmania.com/?src=sticker`

The source is remembered for the visit and attached to any contact-form submission, and a `qr_visit` analytics event fires.

## Production setup

1. **Supabase** (submission backup + photos): create a project, run `supabase/schema.sql` in the SQL editor,
   then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. **Resend** (email): add and verify `cardboardmania.com` in Resend, set `RESEND_API_KEY` and
   `CONTACT_FROM_EMAIL="Cardboard Mania <no-reply@cardboardmania.com>"`.
3. **Cloudflare Turnstile** (optional): create a widget for the domain and set
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
4. **Deploy to Vercel**: import the repo, add the env vars, and enable Web Analytics in the project
   (custom events `qr_visit` and `contact_submit` need a Vercel plan that includes them).
5. Point the `cardboardmania.com` DNS at Vercel.

## How the contact form works

- Photos upload directly from the browser to a private Supabase bucket using one-time signed URLs
  (`/api/upload-url`), so large phone photos don't hit serverless size limits.
- `/api/contact` validates input, checks the honeypot, rate-limits by IP and verifies Turnstile, then
  saves a backup row in `contact_submissions`, emails `cardboardmania33@gmail.com` (reply-to = visitor,
  photos linked for 1 year), and sends the visitor an auto-reply with the next show.
- The visitor sees an error only if **both** the database save and the email fail.

## Future phases

- **Phase 2 — Showcase:** add a `featured_cards` table and a `/cards` gallery; "Ask about this card"
  can link to `/contact?intent=buy` (extend the form to accept a `card` param that pre-fills the message).
- **Phase 3 — Shop:** inventory, filters, cart and checkout (e.g. Stripe). The header, layout and content
  structure are already set up to add a Shop nav item.
