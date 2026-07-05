import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ cards: [] });
  }

  // Strip characters that would break the PostgREST or() filter syntax.
  const safe = q.replace(/[,%()]/g, " ").trim();
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("cards")
    .select(
      "id, category, subcategory, set_name, year, card_number, name, variant, image_url"
    )
    .or(`name.ilike.%${safe}%,set_name.ilike.%${safe}%`)
    .limit(25);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ cards: data });
}
