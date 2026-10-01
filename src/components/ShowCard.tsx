import { formatShowDates, mapLink, type Show } from "@/lib/shows";

export default function ShowCard({ show, featured = false }: { show: Show; featured?: boolean }) {
  return (
    <article className={`card overflow-hidden ${featured ? "border-gold/60" : ""}`}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
        <div className="shrink-0 rounded-lg bg-red px-4 py-3 text-center text-white sm:w-36">
          <p className="display text-2xl">{formatShowDates(show)}</p>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="display text-2xl sm:text-3xl">{show.name}</h3>
          <p className="font-semibold">
            {show.venue} · {show.city}
          </p>
          <dl className="grid gap-x-6 gap-y-1 text-sm text-muted sm:grid-cols-2">
            {show.hours && (
              <div>
                <dt className="inline font-semibold text-paper">Hours: </dt>
                <dd className="inline">{show.hours}</dd>
              </div>
            )}
            <div>
              <dt className="inline font-semibold text-paper">Table: </dt>
              <dd className="inline">{show.table ? <span className="font-bold text-gold">#{show.table}</span> : "TBA"}</dd>
            </div>
            {show.address && (
              <div className="sm:col-span-2">
                <dt className="sr-only">Address</dt>
                <dd>{show.address}</dd>
              </div>
            )}
          </dl>
          {show.notes && <p className="text-sm">{show.notes}</p>}

          <div className="flex flex-wrap gap-2 pt-2">
            <a href={mapLink(show)} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-10 px-4 text-sm">
              Map &amp; directions
            </a>
            {show.url && (
              <a href={show.url} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-10 px-4 text-sm">
                Event page
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
