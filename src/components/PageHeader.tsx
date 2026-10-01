export default function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="stripe border-b border-line">
      <div className="container-x py-10 sm:py-14">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-2 text-5xl sm:text-6xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-paper/85">{intro}</p>}
      </div>
    </section>
  );
}
