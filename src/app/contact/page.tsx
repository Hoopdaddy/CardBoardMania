import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "./ContactForm";
import { site } from "@/content/site";
import { isReason } from "@/lib/contact";
import { formatShowDates, nextShow, recentAndUpcomingShows } from "@/lib/shows";
import { photosEnabled } from "@/lib/server";

export const metadata: Metadata = {
  title: "Contact — Sell Your Cards",
  description: "Sell your wrestling cards to Cardboard Mania. Send photos and a description and get a fair, no-obligation offer.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ intent?: string }> }) {
  const { intent } = await searchParams;
  const show = nextShow();

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        intro="Selling, buying, or have a question about a show? Fill this out and I'll reply by email — usually within a day or two."
      />
      <div className="container-x mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm
            initialReason={isReason(intent) ? intent : "sell"}
            shows={recentAndUpcomingShows().map((s) => ({ id: s.id, label: `${s.name} (${formatShowDates(s)})` }))}
            nextShowLabel={show ? `${show.name} — ${formatShowDates(show)}, ${show.city}` : null}
            photosEnabled={photosEnabled()}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
          />
        </div>
        <aside className="space-y-4">
          <div className="card p-5">
            <p className="eyebrow">Prefer email?</p>
            <a href={`mailto:${site.email}`} className="mt-2 block break-all text-lg font-semibold hover:text-gold">
              {site.email}
            </a>
          </div>
          <div className="card p-5 text-sm text-paper/85">
            <p className="eyebrow">Tips for a fast offer</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Photograph the fronts of key cards in good light</li>
              <li>For big lots, a photo of the boxes or binders is fine</li>
              <li>Mention any graded cards and their grades</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
