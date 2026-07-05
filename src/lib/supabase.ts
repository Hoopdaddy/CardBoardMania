import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let browserClient: SupabaseClient | null = null;

/** Singleton client for use in "use client" components (session in localStorage). */
export function supabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(url!, anonKey!);
  }
  return browserClient;
}

/** Per-request anon client for server components / route handlers (public reads only). */
export function supabaseServer(): SupabaseClient {
  return createClient(url!, anonKey!, {
    auth: { persistSession: false },
  });
}
