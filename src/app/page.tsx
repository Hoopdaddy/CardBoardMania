import Link from "next/link";

const FEATURES = [
  {
    title: "Want & Have Lists",
    desc: "Search a real card database and build the lists that do the talking at every show.",
    icon: "🃏",
  },
  {
    title: "Show Calendar",
    desc: "Post where you'll be set up next so buyers and traders can find your table.",
    icon: "📅",
  },
  {
    title: "Image Gallery",
    desc: "Show off your best cards, your case setup, or your latest mailday.",
    icon: "🖼️",
  },
  {
    title: "Social Links",
    desc: "One link that points to your eBay, Whatnot, Instagram, and everywhere else you sell.",
    icon: "🔗",
  },
  {
    title: "Every Category",
    desc: "Sports, TCGs, and non-sports — one page covers your whole collection.",
    icon: "⚾",
  },
  {
    title: "Discovery (coming soon)",
    desc: "Collectors will find you by the exact cards on your lists.",
    icon: "🔍",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-extrabold tracking-tight">
            Cardboard<span className="text-accent">Mania</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-navy-light"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-navy hover:brightness-110"
            >
              Claim your page
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-14 text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Your card business card.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            One page with your want list, have list, show schedule, and links —
            built for dealers and collectors, shareable anywhere.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-accent px-6 py-3 font-bold text-navy hover:brightness-110 sm:w-auto"
            >
              Claim cardboardmania.com/you
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-white/30 px-6 py-3 font-semibold text-white hover:bg-navy-light sm:w-auto"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold text-navy">
          Everything a table setup says about you — online
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-navy/10 bg-white p-5 shadow-sm"
            >
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-2 font-bold text-navy">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-navy/10 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Cardboard Mania · cardboardmania.com
      </footer>
    </main>
  );
}
