import Link from "next/link";
import Logo from "./Logo";
import SocialIcon, { type SocialName } from "./SocialIcon";
import { resources, site } from "@/content/site";
import { formatShowDates, nextShow } from "@/lib/shows";

export default function Footer() {
  const show = nextShow();
  const socials = Object.entries(site.socials).filter(([, url]) => url) as [SocialName, string][];

  return (
    <footer className="mt-16 border-t border-line bg-ink-2">
      <div className="container-x grid gap-8 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo size={64} />
          <p className="text-sm text-muted">Buying and selling wrestling cards out of {site.homeBase}.</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="eyebrow">Next show</p>
          {show ? (
            <Link href="/shows" className="block hover:text-gold">
              <span className="font-semibold">{formatShowDates(show)}</span>
              <br />
              <span className="text-muted">{show.city}</span>
            </Link>
          ) : (
            <p className="text-muted">New shows coming soon.</p>
          )}
          <p className="eyebrow pt-4">Resources</p>
          <a href={resources.suplex.url} target="_blank" rel="noopener" className="block font-semibold hover:text-gold">
            {resources.suplex.name} ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <span className="block text-muted">Wrestling card checklists &amp; history</span>
        </div>

        <div className="space-y-3 text-sm">
          <p className="eyebrow">Get in touch</p>
          <a href={`mailto:${site.email}`} className="block break-all font-semibold hover:text-gold">
            {site.email}
          </a>
          {socials.length > 0 && (
            <ul className="flex gap-2">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="grid h-10 w-10 place-items-center rounded-md border border-line hover:border-gold hover:text-gold"
                  >
                    <SocialIcon name={name} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-x py-4 text-xs text-muted">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
