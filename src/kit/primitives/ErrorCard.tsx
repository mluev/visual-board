/** Shown instead of a block when its props are invalid or it crashes. Lists every problem. */
export function ErrorCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <section role="alert" className="flex h-full flex-col gap-3 rounded-card border-2 border-dashed border-bad bg-bad-soft p-6 text-ink">
      <span className="self-start rounded-full bg-bad px-3 py-[5px] text-[13px] font-bold text-white">Block error</span>
      <h3 className="m-0 font-display text-[19px] font-bold">{title}</h3>
      <ul className="m-0 flex flex-col gap-1 pl-5 font-mono text-[13px] leading-relaxed text-ink-2">
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </section>
  );
}
