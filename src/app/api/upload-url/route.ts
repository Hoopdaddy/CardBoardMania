import { NextResponse } from "next/server";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, photoExtension } from "@/lib/contact";
import { PHOTO_BUCKET, clientIp, rateLimit, supabaseAdmin } from "@/lib/server";

/**
 * Issues one-time signed upload URLs so photos go straight from the browser to
 * Supabase Storage (avoids serverless request-size limits).
 */
export async function POST(req: Request) {
  const supabase = supabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Photo uploads aren't available right now." }, { status: 503 });

  if (!rateLimit(`upload:${clientIp(req)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many uploads. Please try again in a few minutes." }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { files?: { name?: string; size?: number }[] } | null;
  const files = body?.files;
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `Send between 1 and ${MAX_PHOTOS} photos.` }, { status: 400 });
  }

  const folder = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
  const uploads: { path: string; signedUrl: string }[] = [];

  for (const [i, f] of files.entries()) {
    const ext = photoExtension(String(f.name ?? ""));
    if (!ext) return NextResponse.json({ error: "Photos must be JPG, PNG or HEIC." }, { status: 400 });
    if (typeof f.size !== "number" || f.size <= 0 || f.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "Each photo must be under 10 MB." }, { status: 400 });
    }
    const path = `${folder}/${i + 1}.${ext}`;
    const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[upload-url]", error);
      return NextResponse.json({ error: "Photo upload failed. You can still send without photos." }, { status: 500 });
    }
    uploads.push({ path: data.path, signedUrl: data.signedUrl });
  }

  return NextResponse.json({ uploads });
}
