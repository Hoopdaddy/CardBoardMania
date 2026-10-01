import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ShowCard from "@/components/ShowCard";
import { site } from "@/content/site";
import { upcomingShows } from "@/lib/shows";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Upcoming Card Shows",
  description: "Where to find Cardboard Mania next — upcoming card shows, dates, venues and table numbers around Middle Tennessee.",
  alternates: { canonical: "/shows" },
};

export default function ShowsPage() {
  const shows = upcomingShows();

  const eventsLd = shows.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: s.name,
    startDate: s.startDate,
    endDate: s.endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: s.venue, address: s.address },
    organizer: { "@type": "Organization", name: site.name, url: site.url },
  }));

  return (
    <>
      {shows.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsLd) }} />
      )}
      <PageHeader
        eyebrow="Shows"
        title="Upcoming shows"
        intro="Come see me in person. Bring your cards — I buy at the table, or just stop by to dig through what I've got."
      />
      <div className="container-x mt-10">
        {shows.length > 0 ? (
          <ul className="space-y-4">
            {shows.map((show, i) => (
              <li key={show.id}>
                <ShowCard show={show} featured={i === 0} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card p-8 text-center">
            <p className="display text-3xl">New shows coming soon</p>
            <p className="mt-2 text-paper/85">
              Check back or{" "}
              <Link href="/contact?intent=show" className="font-semibold text-gold underline">
                contact me
              </Link>
              .
            </p>
          </div>
        )}
        <p className="mt-8 text-sm text-muted">
          Promoter or dealer?{" "}
          <Link href="/contact?intent=show" className="font-semibold text-gold hover:underline">
            Get in touch about tables and trades
          </Link>
          .
        </p>
      </div>
    </>
  );
}
