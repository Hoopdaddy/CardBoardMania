#!/usr/bin/env node
/**
 * Seed the shared `cards` table from the CardSight AI catalog.
 *
 * Usage:
 *   npm run seed:cards -- --query "2023 topps chrome"
 *   npm run seed:cards -- --set-id <uuid> [--category sport --subcategory football]
 *
 * Finds sets via CardSight search, pulls every card in the chosen set
 * (paginated with skip/take), and upserts into Supabase keyed on
 * (source_vendor, vendor_card_id) so re-runs are idempotent.
 *
 * Uses the Supabase service-role key: cards is read-only for users (RLS),
 * so seeding must bypass RLS. Never expose that key client-side.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CARDSIGHT_BASE = "https://api.cardsight.ai/v1";
const PAGE_SIZE = 100;

// ---------- env ----------

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !line.trim().startsWith("#")) env[m[1]] = m[2];
    }
  } catch {
    // fall through to process.env
  }
  return { ...env, ...process.env };
}

const env = loadEnv();
const missing = [
  "CARDSIGHT_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
].filter((k) => !env[k]);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------- args ----------

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--")
        ? argv[++i]
        : true;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.query && !args["set-id"]) {
  console.log(`Usage:
  npm run seed:cards -- --query "2023 topps chrome"
  npm run seed:cards -- --set-id <uuid> [--category sport|tcg|non-sport] [--subcategory football]`);
  process.exit(0);
}

// ---------- cardsight ----------

async function cardsight(path) {
  const res = await fetch(`${CARDSIGHT_BASE}${path}`, {
    headers: { "x-api-key": env.CARDSIGHT_API_KEY },
  });
  if (!res.ok) {
    throw new Error(`CardSight ${res.status} on ${path}: ${await res.text()}`);
  }
  return res.json();
}

const SPORT_PREFIXES = {
  NFL: "football",
  MLB: "baseball",
  NBA: "basketball",
  NHL: "hockey",
  MLS: "soccer",
};

function classify(card, overrides) {
  if (overrides.category) {
    return {
      category: overrides.category,
      subcategory: overrides.subcategory ?? null,
    };
  }
  const attrs = card.attributes ?? [];
  for (const [prefix, sport] of Object.entries(SPORT_PREFIXES)) {
    if (attrs.some((a) => a.startsWith(`${prefix}-`) || a === prefix)) {
      return { category: "sport", subcategory: sport };
    }
  }
  if (attrs.some((a) => a.startsWith("pokemon"))) {
    return { category: "tcg", subcategory: "pokemon" };
  }
  return { category: "non-sport", subcategory: overrides.subcategory ?? null };
}

function isBaseSetName(setName) {
  if (!setName) return true;
  const s = setName.toLowerCase();
  return s === "checklist" || s === "base set" || s.startsWith("base ");
}

function toRow(card, overrides) {
  const { category, subcategory } = classify(card, overrides);
  return {
    category,
    subcategory,
    set_name: card.releaseName ?? null,
    year: card.releaseYear ?? null,
    card_number: card.number ?? null,
    name: card.name,
    variant: isBaseSetName(card.setName) ? null : card.setName,
    image_url: null,
    source_vendor: "cardsight",
    vendor_card_id: card.id,
  };
}

async function seedSet(setId, overrides) {
  let skip = 0;
  let total = Infinity;
  let upserted = 0;

  while (skip < total) {
    const data = await cardsight(
      `/catalog/cards?setId=${setId}&take=${PAGE_SIZE}&skip=${skip}`
    );
    const cards = data.cards ?? [];
    total = data.total_count ?? cards.length;
    if (cards.length === 0) break;

    const rows = cards.map((c) => toRow(c, overrides));
    const { error } = await supabase
      .from("cards")
      .upsert(rows, { onConflict: "source_vendor,vendor_card_id" });
    if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

    upserted += rows.length;
    skip += cards.length;
    console.log(`  ${upserted}/${total} cards…`);
  }
  return upserted;
}

// ---------- main ----------

async function main() {
  const overrides = {
    category: args.category,
    subcategory: args.subcategory,
  };

  let setId = args["set-id"];
  if (!setId) {
    console.log(`Searching CardSight sets for "${args.query}"…`);
    const data = await cardsight(
      `/catalog/search?q=${encodeURIComponent(args.query)}&type=set`
    );
    const sets = (data.results ?? []).filter((r) => r.type === "set");
    if (sets.length === 0) {
      console.error("No sets found for that query.");
      process.exit(1);
    }
    console.log("Top matches:");
    sets.slice(0, 8).forEach((s, i) => {
      console.log(
        `  ${i === 0 ? "→" : " "} ${s.name} (${s.year ?? "?"}, ${
          s.releaseName ?? s.manufacturerName ?? "?"
        }) — id: ${s.id}`
      );
    });
    setId = sets[0].id;
    console.log(
      `\nSeeding the top match. To seed a different one:\n  npm run seed:cards -- --set-id <id>\n`
    );
  }

  const count = await seedSet(setId, overrides);
  console.log(`\nDone — ${count} cards upserted into the cards table.`);

  const { count: totalCards } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true });
  console.log(`cards table now holds ${totalCards} rows total.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
