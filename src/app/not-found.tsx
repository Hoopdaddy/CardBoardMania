import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-2 text-6xl">Count&apos;s out</h1>
      <p className="mt-3 text-paper/85">That page doesn&apos;t exist.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className="btn-secondary">
          Back home
        </Link>
        <Link href="/contact?intent=sell" className="btn-primary">
          Sell Your Cards
        </Link>
      </div>
    </section>
  );
}
