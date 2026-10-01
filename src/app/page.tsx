import Link from "next/link";
import ShowCard from "@/components/ShowCard";
import SellCta from "@/components/SellCta";
import CardCarousel from "@/components/CardCarousel";
import { buyTiles, carouselSlides, howItWorks, site } from "@/content/site";
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
    areaServed: { "@type": "AdministrativeArea", name: "Middle Tennessee" },
    address: { "@type": "PostalAddress", addressRegion: "TN", addressCountry: "US" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="stripe relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-red/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-x relative grid grid-cols-1 items-center gap-10 py-12 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <p className="eyebrow">Wrestling cards · {site.homeBase}</p>
            <h1 className="display mt-3 text-7xl sm:text-8xl xl:text-9xl">
              Cardboard
              <br />
              <span className="text-red [text-shadow:4px_4px_0_var(--color-gold)]">Mania</span>
            </h1>
            <p className="mt-6 max-w-xl text-xl font-semibold text-paper sm:text-2xl">
              Buying, selling and trading wrestling cards.
            </p>
            <p className="mt-2 max-w-xl text-lg text-paper/80">
              WWE, WWF, WCW, AEW, ECW and more — graded slabs, autographs and sealed wax. Find me at card shows across{" "}
              {site.homeBase}.
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
          <div className="mx-auto w-full min-w-0 max-w-md lg:max-w-none">
            <CardCarousel slides={carouselSlides} />
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
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-6 lg:grid-cols-5">
          {buyTiles.map((tile, i) => (
            <li key={tile.title} className="card group relative overflow-hidden p-4 last:col-span-2 sm:col-span-2 sm:p-6 sm:nth-[n+4]:col-span-3 lg:col-span-1 lg:last:col-span-1 lg:nth-[n+4]:col-span-1">
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
