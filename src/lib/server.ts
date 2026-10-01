import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------- Supabase (submission backup + photo storage) ----------

let client: SupabaseClient | null | undefined;

export const PHOTO_BUCKET = process.env.SUPABASE_PHOTO_BUCKET || "contact-photos";

/** Service-role Supabase client, or null when not configured. */
export function supabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export function photosEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// ---------- Rate limiting ----------

// In-memory sliding window, per server instance. Backs up the honeypot and Turnstile.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  const allowed = recent.length < limit;
  if (allowed) recent.push(now);
  hits.set(key, recent);
  return allowed;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

// ---------- Turnstile ----------

/** Verifies a Turnstile token. Passes automatically when Turnstile isn't configured. */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

// ---------- Email (Resend) ----------

type Email = { to: string; subject: string; html: string; text: string; replyTo?: string };

/** Sends via Resend. Without RESEND_API_KEY, logs the email instead (local dev). */
export async function sendEmail(email: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL || "Cardboard Mania <no-reply@cardboardmania.com>";
  if (!key) {
    console.log(
      `\n[email:dev] To: ${email.to}\nSubject: ${email.subject}\nReply-To: ${email.replyTo ?? "-"}\n\n${email.text}\n`
    );
    return true;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: email.replyTo,
      }),
    });
    if (!res.ok) console.error("[email] Resend error", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function centralTimestamp(d = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d) + " CT";
}
