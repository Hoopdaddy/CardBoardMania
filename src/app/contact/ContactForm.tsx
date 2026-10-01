"use client";

import Script from "next/script";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { readSource } from "@/components/SourceTracker";
import {
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  PHOTO_ACCEPT,
  REASONS,
  SIZES,
  photoExtension,
  type Reason,
} from "@/lib/contact";

type Props = {
  initialReason: Reason;
  shows: { id: string; label: string }[];
  nextShowLabel: string | null;
  photosEnabled: boolean;
  turnstileSiteKey: string;
};

type Errors = Partial<Record<"name" | "email" | "message" | "photos" | "form", string>>;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: { name: string; email: string; message: string }): Errors {
  const e: Errors = {};
  if (!values.name.trim()) e.name = "Please enter your name.";
  if (!values.email.trim()) e.email = "Please enter your email.";
  else if (!EMAIL_RE.test(values.email.trim())) e.email = "That email doesn't look right.";
  if (!values.message.trim()) e.message = "Tell me a little about what you have or need.";
  return e;
}

function checkFiles(files: File[]): string | undefined {
  if (files.length > MAX_PHOTOS) return `Up to ${MAX_PHOTOS} photos, please.`;
  for (const f of files) {
    if (!photoExtension(f.name)) return `${f.name}: use JPG, PNG or HEIC.`;
    if (f.size > MAX_PHOTO_BYTES) return `${f.name} is over 10 MB.`;
  }
}

export default function ContactForm({ initialReason, shows, nextShowLabel, photosEnabled, turnstileSiteKey }: Props) {
  const [reason, setReason] = useState<Reason>(initialReason);
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "", size: "", showId: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [progress, setProgress] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileId = useRef<string | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Keep the reason in sync when navigating between ?intent= links on the same page.
  useEffect(() => setReason(initialReason), [initialReason]);

  const renderTurnstile = useCallback(() => {
    if (!turnstileSiteKey || !turnstileRef.current || !window.turnstile || turnstileId.current) return;
    turnstileId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: turnstileSiteKey,
      size: "flexible",
      theme: "dark",
      callback: (token: string) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(""),
    });
  }, [turnstileSiteKey]);

  useEffect(renderTurnstile, [renderTurnstile]);

  const set = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validate(next)[field as keyof Errors] }));
  };

  const blur = (field: "name" | "email" | "message") => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(values)[field] }));
  };

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = [...files, ...Array.from(e.target.files ?? [])].slice(0, MAX_PHOTOS + 1);
    e.target.value = "";
    const problem = checkFiles(picked);
    setErrors((prev) => ({ ...prev, photos: problem }));
    if (!problem) setFiles(picked);
  };

  async function uploadPhotos(): Promise<string[]> {
    if (!files.length) return [];
    setProgress("Uploading photos…");
    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: files.map((f) => ({ name: f.name, size: f.size })) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Photo upload failed.");
    const uploads = data.uploads as { path: string; signedUrl: string }[];
    await Promise.all(
      uploads.map(async (u, i) => {
        const put = await fetch(u.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": files[i].type || "application/octet-stream" },
          body: files[i],
        });
        if (!put.ok) throw new Error(`Couldn't upload ${files[i].name}.`);
      })
    );
    return uploads.map((u) => u.path);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate(values);
    setTouched({ name: true, email: true, message: true });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setErrors({ form: "Please wait a moment for the spam check to finish, then try again." });
      return;
    }

    setStatus("sending");
    try {
      const photoPaths = await uploadPhotos();
      setProgress("Sending…");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          ...values,
          size: reason === "sell" ? values.size : "",
          photoPaths,
          source: readSource(),
          page: window.location.pathname + window.location.search,
          referrer: document.referrer,
          website: honeypotRef.current?.value ?? "",
          turnstileToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      track("contact_submit", { reason, photos: photoPaths.length > 0 });
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("idle");
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong." });
      if (turnstileId.current) window.turnstile?.reset(turnstileId.current);
      setTurnstileToken("");
    } finally {
      setProgress("");
    }
  }

  if (status === "done") {
    return (
      <div className="card border-gold/60 p-6 sm:p-8" role="status">
        <p className="eyebrow">Message sent</p>
        <h2 className="display mt-2 text-4xl">Thanks, {values.name.split(" ")[0]}!</h2>
        <p className="mt-3 text-lg text-paper/90">
          I got your message and will reply to <strong>{values.email}</strong> soon. A confirmation is on its way to your inbox.
        </p>
        <div className="mt-6 rounded-lg bg-ink p-4">
          <p className="eyebrow">Catch me in person</p>
          {nextShowLabel ? (
            <p className="mt-1 font-semibold">{nextShowLabel}</p>
          ) : (
            <p className="mt-1 text-paper/85">New shows coming soon.</p>
          )}
          <Link href="/shows" className="mt-2 inline-block text-sm font-semibold text-gold hover:underline">
            See all shows →
          </Link>
        </div>
      </div>
    );
  }

  const fieldError = (name: keyof Errors) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1.5 text-sm font-medium text-red">
        {errors[name]}
      </p>
    ) : null;

  const invalid = (name: keyof Errors) =>
    errors[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error`, className: "field border-red" } : { className: "field" };

  const sending = status === "sending";

  return (
    <div ref={formTopRef} className="scroll-mt-24">
      {turnstileSiteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={renderTurnstile}
        />
      )}
      <form onSubmit={onSubmit} noValidate className="card space-y-5 p-5 sm:p-8">
        <div>
          <label htmlFor="reason" className="label">
            Reason <span className="text-red">*</span>
          </label>
          <select id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value as Reason)} className="field">
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">
              Name <span className="text-red">*</span>
            </label>
            <input id="name" name="name" autoComplete="name" value={values.name} onChange={set("name")} onBlur={blur("name")} {...invalid("name")} />
            {fieldError("name")}
          </div>
          <div>
            <label htmlFor="email" className="label">
              Email <span className="text-red">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={set("email")}
              onBlur={blur("email")}
              {...invalid("email")}
            />
            {fieldError("email")}
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Phone <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} className="field" />
        </div>

        <div>
          <label htmlFor="message" className="label">
            What do you have / need? <span className="text-red">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="e.g. 1990s WWF binder, ~300 cards, some PSA slabs"
            value={values.message}
            onChange={set("message")}
            onBlur={blur("message")}
            maxLength={5000}
            {...invalid("message")}
          />
          {fieldError("message")}
        </div>

        {reason === "sell" && (
          <div>
            <label htmlFor="size" className="label">
              Approximate size <span className="font-normal text-muted">(optional)</span>
            </label>
            <select id="size" name="size" value={values.size} onChange={set("size")} className="field">
              <option value="">Choose one…</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {photosEnabled && (
          <div>
            <span className="label">
              Photos <span className="font-normal text-muted">(optional — up to {MAX_PHOTOS}, 10 MB each, JPG/PNG/HEIC)</span>
            </span>
            {files.length > 0 && (
              <ul className="mb-3 space-y-2">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-md border border-line bg-ink px-3 py-2 text-sm">
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="shrink-0 font-semibold text-muted hover:text-red"
                      aria-label={`Remove ${f.name}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {files.length < MAX_PHOTOS && (
              <label className="btn-secondary w-full cursor-pointer border-dashed sm:w-auto">
                <input type="file" accept={PHOTO_ACCEPT} multiple onChange={onFiles} className="sr-only" aria-describedby={errors.photos ? "photos-error" : undefined} />
                + Add photos
              </label>
            )}
            {fieldError("photos")}
          </div>
        )}

        {shows.length > 0 && (
          <div>
            <label htmlFor="showId" className="label">
              Met me at a show? <span className="font-normal text-muted">(optional)</span>
            </label>
            <select id="showId" name="showId" value={values.showId} onChange={set("showId")} className="field">
              <option value="">No / not sure</option>
              {shows.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Honeypot: hidden from people, tempting to bots */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {turnstileSiteKey && <div ref={turnstileRef} />}

        {errors.form && (
          <p role="alert" className="rounded-md border border-red bg-red/10 px-4 py-3 text-sm font-medium">
            {errors.form}
          </p>
        )}

        <button type="submit" disabled={sending} className="btn-primary w-full text-lg disabled:opacity-60 sm:w-auto">
          {sending ? progress || "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
