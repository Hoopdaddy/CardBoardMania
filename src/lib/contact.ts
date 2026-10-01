// Shared between the contact form (client) and the API routes (server).

export const REASONS = [
  { value: "sell", label: "I want to sell" },
  { value: "buy", label: "I want to buy" },
  { value: "show", label: "Card show question" },
  { value: "other", label: "Other" },
] as const;

export type Reason = (typeof REASONS)[number]["value"];

export const SIZES = ["A few cards", "Under 100", "100–1,000", "1,000+", "Sealed product"] as const;

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "heic", "heif"];
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif";

export function isReason(value: string | null | undefined): value is Reason {
  return REASONS.some((r) => r.value === value);
}

export function reasonLabel(value: string): string {
  return REASONS.find((r) => r.value === value)?.label ?? "Other";
}

/** Known QR sources pass through; anything else unknown is "other", missing is "direct". */
export function normalizeSource(src: string | null | undefined): string {
  const s = (src || "").toLowerCase().trim().slice(0, 40);
  if (!s) return "direct";
  return ["tablecloth", "sticker", "direct"].includes(s) ? s : `other:${s.replace(/[^a-z0-9_-]/g, "")}`;
}

export function photoExtension(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return PHOTO_EXTENSIONS.includes(ext) ? ext : null;
}
