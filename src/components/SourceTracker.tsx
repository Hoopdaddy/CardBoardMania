"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export const SOURCE_KEY = "cm_src";

/**
 * Remembers the QR source (?src=tablecloth|sticker) for the visit so the
 * contact form can attach it even after the visitor clicks around.
 */
export default function SourceTracker() {
  useEffect(() => {
    const src = new URLSearchParams(window.location.search).get("src");
    if (!src) return;
    try {
      if (!sessionStorage.getItem(SOURCE_KEY)) track("qr_visit", { src });
      sessionStorage.setItem(SOURCE_KEY, src);
    } catch {
      // storage unavailable (private mode); the form falls back to the URL
    }
  }, []);
  return null;
}

export function readSource(): string {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("src");
    return fromUrl || sessionStorage.getItem(SOURCE_KEY) || "direct";
  } catch {
    return "direct";
  }
}
