// The festival accent colours. Each track has its own, reused wherever the track appears
// (its card, programme tags), and the set cycles through other lists for variety.
// Class names are written out in full so Tailwind can find them.

const palette = [
  { solid: "bg-sun", soft: "bg-sun-soft", ink: "text-sun-ink", border: "border-sun", onSolid: "text-navy" },
  { solid: "bg-coral", soft: "bg-coral-soft", ink: "text-coral-ink", border: "border-coral", onSolid: "text-white" },
  { solid: "bg-teal", soft: "bg-teal-soft", ink: "text-teal-ink", border: "border-teal", onSolid: "text-white" },
  { solid: "bg-azure", soft: "bg-azure-soft", ink: "text-azure-ink", border: "border-azure", onSolid: "text-white" },
  { solid: "bg-leaf", soft: "bg-leaf-soft", ink: "text-leaf-ink", border: "border-leaf", onSolid: "text-white" },
  { solid: "bg-plum", soft: "bg-plum-soft", ink: "text-plum-ink", border: "border-plum", onSolid: "text-white" },
] as const;

export type FestivalColor = (typeof palette)[number];

export function festivalColor(index: number): FestivalColor {
  return palette[((index % palette.length) + palette.length) % palette.length];
}

// "Track 3", "Tracks 5 & 6", "3" -> the colour of the first track named. Null for labels
// like "All hubs".
export function trackColor(label: string): FestivalColor | null {
  const n = Number(label.match(/\d+/)?.[0]);
  return n ? festivalColor(n - 1) : null;
}

// A thin multicoloured stripe, like festival bunting.
export function FestivalBand({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`grid h-1.5 grid-cols-6 ${className}`}>
      {palette.map((c) => (
        <span key={c.solid} className={c.solid} />
      ))}
    </div>
  );
}
