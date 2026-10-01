import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SellCta from "@/components/SellCta";
import { alsoBuying, dontBuy, faqs, howItWorks, wrestlingBuys } from "@/content/site";

export const metadata: Metadata = {
  title: "We Buy Wrestling Cards",
  description:
    "What Cardboard Mania buys: WWE, WWF, WCW, AEW and ECW singles, graded slabs, autos, relics and sealed wax. How offers and payment work.",
  alternates: { canonical: "/we-buy" },
};

function Check() {
  return (
    <svg className="mt-0.5 h-5 w-5 shrink-0 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export default function WeBuyPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PageHeader
        eyebrow="We buy"
        title="What I buy"
        intro="Wrestling cards are my main event — singles, graded slabs, autographs and sealed wax."
      />

      <div className="container-x mt-10 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2" aria-labelledby="wrestling">
          <h2 id="wrestling" className="display text-3xl text-gold">Wrestling</h2>
          <ul className="mt-4 space-y-3">
            {wrestlingBuys.map((item) => (
              <li key={item} className="flex gap-3">
                <Check />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6" aria-labelledby="also">
          <h2 id="also" className="display text-3xl">Also buying</h2>
          <ul className="mt-4 space-y-3">
            {alsoBuying.map((item) => (
              <li key={item} className="flex gap-3">
                <Check />
                <span className="text-paper/90">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6 lg:col-span-3" aria-labelledby="dont">
          <h2 id="dont" className="display text-3xl">What I typically don&apos;t buy</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {dontBuy.map((item) => (
              <li key={item} className="flex gap-3 text-paper/85">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Not sure? Send photos anyway — I&apos;ll tell you honestly.</p>
        </section>
      </div>

      <section className="container-x mt-14" aria-labelledby="offers">
        <h2 id="offers" className="display text-4xl">How offers work</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {howItWorks.map((step, i) => (
            <li key={step.title} className="card p-5">
              <p className="display text-gold">Step {i + 1}</p>
              <h3 className="display mt-1 text-2xl">{step.title}</h3>
              <p className="mt-1 text-sm text-paper/80">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-paper/85">
          <strong>Payment options:</strong> cash at a show, PayPal, Venmo, Zelle, or trade credit toward cards at my table.
        </p>
      </section>

      <section className="container-x mt-14" aria-labelledby="faq">
        <h2 id="faq" className="display text-4xl">FAQ</h2>
        <div className="mt-6 divide-y divide-line rounded-xl border border-line bg-ink-2">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold">
                {f.q}
                <span className="faq-icon text-2xl leading-none text-gold transition-transform" aria-hidden>+</span>
              </summary>
              <p className="pb-5 text-paper/85">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Something else?{" "}
          <Link href="/contact?intent=other" className="font-semibold text-gold hover:underline">
            Ask me directly
          </Link>
          .
        </p>
      </section>

      <SellCta title="Ready to sell?" />
    </>
  );
}
