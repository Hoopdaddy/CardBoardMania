import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { MAX_PHOTOS, SIZES, isReason, normalizeSource, reasonLabel } from "@/lib/contact";
import { formatShowDates, getShow, nextShow, showSummary } from "@/lib/shows";
import {
  PHOTO_BUCKET,
  centralTimestamp,
  clientIp,
  escapeHtml,
  rateLimit,
  sendEmail,
  supabaseAdmin,
  verifyTurnstile,
} from "@/lib/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHOTO_PATH_RE = /^\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\/\d\.(jpg|jpeg|png|heic|heif)$/;
const PHOTO_LINK_TTL = 60 * 60 * 24 * 365; // 1 year

type Body = Record<string, unknown>;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = clientIp(req);
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Honeypot: pretend success so bots don't retry.
  if (str(body.website, 200)) return NextResponse.json({ ok: true });

  if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }

  if (!(await verifyTurnstile(str(body.turnstileToken, 2048), ip))) {
    return NextResponse.json({ error: "Spam check failed. Please refresh and try again." }, { status: 400 });
  }

  const reasonValue = str(body.reason, 20);
  const reason = isReason(reasonValue) ? reasonValue : "other";
  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const message = str(body.message, 5000);
  const sizeValue = str(body.size, 40);
  const size = reason === "sell" && (SIZES as readonly string[]).includes(sizeValue) ? sizeValue : "";
  const metShow = getShow(str(body.showId, 100));
  const source = normalizeSource(str(body.source, 60));
  const page = str(body.page, 300);
  const referrer = str(body.referrer, 300);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";
  if (!message) errors.message = "Please tell me what you have or need.";
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
  }

  const photoPaths = (Array.isArray(body.photoPaths) ? body.photoPaths : [])
    .filter((p): p is string => typeof p === "string" && PHOTO_PATH_RE.test(p))
    .slice(0, MAX_PHOTOS);

  const supabase = supabaseAdmin();
  let photoLinks: string[] = [];
  if (supabase && photoPaths.length) {
    const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(photoPaths, PHOTO_LINK_TTL);
    if (error) console.error("[contact] signed urls", error);
    photoLinks = (data ?? []).flatMap((d) => (d.signedUrl ? [d.signedUrl] : []));
  }

  const timestamp = centralTimestamp();
  const label = reasonLabel(reason);

  // 1) Store a backup copy first so nothing is lost if email fails.
  let stored = false;
  if (supabase) {
    const { error } = await supabase.from("contact_submissions").insert({
      reason,
      name,
      email,
      phone: phone || null,
      message,
      size: size || null,
      met_show_id: metShow?.id ?? null,
      photo_paths: photoPaths,
      source,
      page,
      referrer: referrer || null,
      ip,
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    });
    if (error) console.error("[contact] db insert", error);
    else stored = true;
  }

  // 2) Email to Cardboard Mania
  const rows: [string, string][] = [
    ["Reason", label],
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "—"],
    ...(reason === "sell" ? ([["Approximate size", size || "—"]] as [string, string][]) : []),
    ["Met at show", metShow ? showSummary(metShow) : "—"],
    ["Source", source],
    ["Submitted from", page || "—"],
    ["Referrer", referrer || "—"],
    ["Time", timestamp],
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
      <h2 style="margin:0 0 12px">${escapeHtml(label)} — ${escapeHtml(name)}</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="color:#666;vertical-align:top;white-space:nowrap"><b>${escapeHtml(k)}</b></td><td>${escapeHtml(v)}</td></tr>`
          )
          .join("")}
      </table>
      <h3 style="margin:18px 0 6px">Message</h3>
      <p style="white-space:pre-wrap;margin:0;padding:12px;background:#f4f4f4;border-radius:6px">${escapeHtml(message)}</p>
      ${
        photoLinks.length
          ? `<h3 style="margin:18px 0 6px">Photos (${photoLinks.length})</h3>${photoLinks
              .map(
                (u, i) =>
                  `<a href="${escapeHtml(u)}"><img src="${escapeHtml(u)}" alt="Photo ${i + 1}" width="180" style="margin:0 8px 8px 0;border-radius:6px;border:1px solid #ddd"></a>`
              )
              .join("")}<p style="color:#666;font-size:12px">Photo links expire in 1 year. HEIC photos may need to be opened to view.</p>`
          : ""
      }
      <p style="color:#888;font-size:12px;margin-top:18px">Reply to this email to answer ${escapeHtml(name)} directly.</p>
    </div>`;

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    message,
    ...(photoLinks.length ? ["", "Photos:", ...photoLinks] : []),
  ].join("\n");

  const emailed = await sendEmail({
    to: process.env.CONTACT_TO_EMAIL || site.email,
    subject: `[Cardboard Mania] ${label} — ${name}`,
    html,
    text,
    replyTo: email,
  });

  if (!emailed && !stored) {
    return NextResponse.json(
      { error: `Sorry, your message couldn't be sent. Please email me at ${site.email}.` },
      { status: 502 }
    );
  }

  // 3) Auto-reply to the visitor (best effort)
  const show = nextShow();
  const showLine = show
    ? `My next show: ${show.name} — ${formatShowDates(show)} at ${show.venue}, ${show.city}${show.table ? `, Table ${show.table}` : ""}.`
    : "New shows are coming soon — check the Shows page.";
  const first = name.split(" ")[0];

  await sendEmail({
    to: email,
    subject: "Thanks for contacting Cardboard Mania",
    replyTo: site.email,
    text: `Hi ${first},\n\nThanks for reaching out — I got your message and will get back to you soon.\n\n${showLine}\n${site.url}/shows\n\n— Cardboard Mania\n${site.email}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
      <p>Hi ${escapeHtml(first)},</p>
      <p>Thanks for reaching out — I got your message and will get back to you soon.</p>
      <p><b>${escapeHtml(showLine)}</b><br><a href="${site.url}/shows">See all upcoming shows</a></p>
      <p>— Cardboard Mania<br><a href="mailto:${site.email}">${site.email}</a></p>
    </div>`,
  });

  return NextResponse.json({ ok: true });
}
