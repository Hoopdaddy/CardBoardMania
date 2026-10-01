import showsData from "@/content/shows.json";

export type Show = {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  venue: string;
  address: string;
  city: string;
  hours: string;
  table: string;
  notes: string;
  url: string;
};

const TZ = "America/Chicago";
const RECENT_DAYS = 60;

/** Today's date in Central time as YYYY-MM-DD. */
export function todayCentral(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

function shiftDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const allShows = (showsData as Show[])
  .slice()
  .sort((a, b) => a.startDate.localeCompare(b.startDate));

/** Shows that haven't ended yet, soonest first. A show stays listed through its end date. */
export function upcomingShows(): Show[] {
  const today = todayCentral();
  return allShows.filter((s) => s.endDate >= today);
}

export function nextShow(): Show | null {
  return upcomingShows()[0] ?? null;
}

/** Shows that ended in the last 60 days plus upcoming ones, for "Met me at a show?". */
export function recentAndUpcomingShows(): Show[] {
  const cutoff = shiftDays(todayCentral(), -RECENT_DAYS);
  return allShows.filter((s) => s.endDate >= cutoff);
}

export function getShow(id: string): Show | undefined {
  return allShows.find((s) => s.id === id);
}

function fmt(ymd: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(
    new Date(`${ymd}T12:00:00Z`)
  );
}

/** "Sat, Oct 17, 2026" for one day, "Nov 7–8, 2026" for a range. */
export function formatShowDates(show: Pick<Show, "startDate" | "endDate">): string {
  const { startDate: s, endDate: e } = show;
  if (s === e) return fmt(s, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const sameMonth = s.slice(0, 7) === e.slice(0, 7);
  const start = fmt(s, { month: "short", day: "numeric" });
  const end = sameMonth ? fmt(e, { day: "numeric" }) : fmt(e, { month: "short", day: "numeric" });
  return `${start}–${end}, ${e.slice(0, 4)}`;
}

export function mapLink(show: Show): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${show.venue}, ${show.address}`
  )}`;
}

export function showSummary(show: Show): string {
  return `${show.name} — ${formatShowDates(show)} at ${show.venue}, ${show.city}${
    show.table ? ` (Table ${show.table})` : ""
  }`;
}
