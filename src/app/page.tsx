import Link from "next/link";
import ShowCard from "@/components/ShowCard";
import SellCta from "@/components/SellCta";
import { buyTiles, howItWorks, site } from "@/content/site";
import { nextShow } from "@/lib/shows";

// Re-check hourly so finished shows drop off without a redeploy.
export const revalidate = 3600;

export default function HomePage() {
  const show = nextShow();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    address: { "@type": "PostalAddress", addressLocality: "Spring Hill", addressRegion: "TN", addressCountry: "US" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="stripe relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-red/25 blur-3xl" />
        <div className="container-x relative py-14 sm:py-24">
          <p className="eyebrow">Cardboard Mania · {site.homeBase}</p>
          <h1 className="display mt-3 text-6xl sm:text-7xl lg:text-8xl">
            I Buy <span className="text-red">Wrestling</span> Cards
          </h1>
          <p className="mt-5 max-w-xl text-lg text-paper/90 sm:text-xl">
            WWE, WWF, WCW, AEW, ECW and more — singles, collections, sealed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact?intent=sell" className="btn-primary text-lg">
              Sell Your Cards
            </Link>
            <Link href="/shows" className="btn-secondary">
              See Upcoming Shows
            </Link>
          </div>
        </div>
      </section>

      {/* Next show */}
      <section className="container-x mt-12" aria-labelledby="next-show">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 id="next-show" className="display text-3xl sm:text-4xl">
            Find me at my <span className="text-gold">next show</span>
          </h2>
          <Link href="/shows" className="hidden shrink-0 text-sm font-semibold text-gold hover:underline sm:block">
            All shows →
          </Link>
        </div>
        {show ? (
          <ShowCard show={show} featured />
        ) : (
          <div className="card p-6 text-paper/85">
            New shows coming soon — check back or{" "}
            <Link href="/contact?intent=show" className="font-semibold text-gold underline">
              contact me
            </Link>
            .
          </div>
        )}
        <Link href="/shows" className="mt-3 block text-sm font-semibold text-gold sm:hidden">
          All shows →
        </Link>
      </section>

      {/* What I buy */}
      <section className="container-x mt-16" aria-labelledby="what-i-buy">
        <p className="eyebrow">Wrestling first</p>
        <h2 id="what-i-buy" className="display mt-1 text-3xl sm:text-4xl">
          What I buy
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {buyTiles.map((tile, i) => (
            <li key={tile.title} className="card group relative overflow-hidden p-4 sm:p-6">
              <span aria-hidden className="display absolute -right-1 -top-3 text-7xl text-paper/5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="display text-xl text-gold sm:text-2xl">{tile.title}</h3>
              <p className="mt-2 text-sm text-paper/80">{tile.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Also buying sports and non-sports cards.{" "}
          <Link href="/we-buy" className="font-semibold text-gold hover:underline">
            See everything I buy →
          </Link>
        </p>
      </section>

      {/* How it works */}
      <section className="container-x mt-16" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="display text-3xl sm:text-4xl">
          How it works
        </h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {howItWorks.map((step, i) => (
            <li key={step.title} className="card flex gap-4 p-5 sm:flex-col sm:p-6">
              <span className="display grid h-12 w-12 shrink-0 place-items-center rounded-full bg-red text-2xl text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="display text-2xl">{step.title}</h3>
                <p className="mt-1 text-sm text-paper/80">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Coming soon */}
      <section className="container-x mt-16">
        <div className="card flex flex-col items-start gap-4 border-dashed border-gold/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Coming soon</p>
            <h2 className="display mt-1 text-2xl sm:text-3xl">Cards for sale online — coming soon</h2>
            <p className="mt-1 text-sm text-paper/80">Looking for something specific? Send me your want list.</p>
          </div>
          <Link href="/contact?intent=buy" className="btn-secondary shrink-0">
            Send a want list
          </Link>
        </div>
      </section>

      <SellCta />
    </>
  );
}
