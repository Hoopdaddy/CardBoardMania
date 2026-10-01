import Image from "next/image";
import Link from "next/link";
import ShowCard from "@/components/ShowCard";
import SellCta from "@/components/SellCta";
import CardCarousel from "@/components/CardCarousel";
import { buyTiles, carouselSlides, howItWorks, resources, site } from "@/content/site";
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
          <div className="text-center lg:text-left">
            <h1>
              <span className="sr-only">Cardboard Mania — wrestling, sports and non-sport cards</span>
              <Image
                src="/cardboard-mania-logo.webp"
                alt=""
                width={640}
                height={640}
                priority
                sizes="(min-width: 1024px) 360px, 280px"
                className="mx-auto h-auto w-[280px] drop-shadow-[0_12px_30px_rgba(227,38,47,0.35)] sm:w-[320px] lg:mx-0 lg:w-[360px]"
              />
            </h1>
            <p className="eyebrow mt-4">Wrestling cards · {site.homeBase}</p>
            <p className="mx-auto mt-3 max-w-xl text-xl font-semibold text-paper sm:text-2xl lg:mx-0">
              Buying, selling and trading wrestling cards.
            </p>
            <p className="mx-auto mt-2 max-w-xl text-lg text-paper/80 lg:mx-0">
              WWE, WWF, WCW, AEW, ECW and more — graded slabs, autographs and sealed wax. Find me at card shows across{" "}
              {site.homeBase}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
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

      {/* Free resource: Suplex Cards */}
      <section className="container-x mt-16" aria-labelledby="suplex">
        <a
          href={resources.suplex.url}
          target="_blank"
          rel="noopener"
          className="group stripe relative block overflow-hidden rounded-2xl border-2 border-gold/60 bg-ink-2 p-6 transition-colors hover:border-gold sm:p-10"
        >
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Free collector resource</p>
              <h2 id="suplex" className="display mt-2 text-4xl sm:text-5xl">
                {resources.suplex.name}
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-paper/85">{resources.suplex.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {resources.suplex.features.map((f) => (
                  <li key={f} className="rounded-full border border-line bg-ink px-3 py-1 text-sm font-semibold text-paper/90">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <span className="btn-primary w-full whitespace-nowrap group-hover:bg-red-dark lg:w-auto">
              Explore Suplex Cards
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
              <span className="sr-only">(opens in a new tab)</span>
            </span>
          </div>
        </a>
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
