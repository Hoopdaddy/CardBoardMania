import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: `Cardboard Mania is a wrestling card dealer based in ${site.homeBase}, buying and selling at card shows across Middle Tennessee.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="Cardboard Mania" />
      <div className="container-x mt-10 grid items-start gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          {site.aboutPhoto ? (
            <Image
              src={site.aboutPhoto}
              alt="Cardboard Mania table at a card show"
              width={800}
              height={1000}
              className="aspect-[4/5] w-full rounded-xl border border-line object-cover"
            />
          ) : (
            <div className="stripe grid aspect-[4/5] w-full place-items-center rounded-xl border-2 border-dashed border-line text-center text-muted">
              <p className="px-6">
                <span className="display block text-3xl text-paper/60">Photo coming soon</span>
                <span className="text-sm">Me and the Cardboard Mania table</span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5 text-lg text-paper/90 md:col-span-3">
          {/* Placeholder story — edit to make it yours. */}
          <p>
            I grew up watching Saturday morning wrestling and trading cards on the playground. Somewhere along the way the
            hobby turned into Cardboard Mania.
          </p>
          <p>
            Today I buy and sell wrestling cards — from 80s WWF and WCW to the latest AEW and WWE releases — out of{" "}
            <strong className="text-gold">{site.homeBase}</strong>. You&apos;ll find me set up at card shows across Middle
            Tennessee, and I&apos;m always happy to talk shop.
          </p>
          <p>
            Whether you&apos;ve got one card or a closet full, I&apos;ll give you a straight answer and a fair offer.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link href="/contact" className="btn-primary">
              Contact me
            </Link>
            <Link href="/shows" className="btn-secondary">
              See upcoming shows
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
