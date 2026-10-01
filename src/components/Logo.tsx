import Image from "next/image";
import Link from "next/link";

/** Header/footer logo: the sticker mark plus the wordmark (the mark's own text is too small to read at this size). */
export default function Logo({ className = "", size = 44 }: { className?: string; size?: number }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label="Cardboard Mania home">
      <Image
        src="/cardboard-mania-logo.webp"
        alt=""
        width={size}
        height={size}
        className="shrink-0 transition-transform group-hover:-rotate-3 group-hover:scale-105"
        priority
      />
      <span className="display text-xl sm:text-2xl">
        Cardboard <span className="text-red">Mania</span>
      </span>
    </Link>
  );
}
