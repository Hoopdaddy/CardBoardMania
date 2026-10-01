import Link from "next/link";

export default function SellCta({
  title = "Got wrestling cards?",
  text = "Send a few photos and I'll get back to you with a fair offer. No pressure, no obligation.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="container-x mt-16">
      <div className="stripe relative overflow-hidden rounded-2xl border-2 border-red bg-ink-2 px-6 py-10 text-center sm:px-10 sm:py-14">
        <h2 className="display text-4xl sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-paper/85">{text}</p>
        <Link href="/contact?intent=sell" className="btn-primary mt-6 w-full sm:w-auto">
          Sell Your Cards
        </Link>
      </div>
    </section>
  );
}
