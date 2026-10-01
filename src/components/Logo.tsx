import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label="Cardboard Mania home">
      <span
        aria-hidden
        className="grid h-9 w-7 -rotate-6 place-items-center rounded-[3px] border-2 border-gold bg-red font-display text-lg text-white shadow-[3px_3px_0_0_var(--color-gold)] transition-transform group-hover:rotate-0"
      >
        CM
      </span>
      <span className="display text-xl sm:text-2xl">
        Cardboard <span className="text-red">Mania</span>
      </span>
    </Link>
  );
}
