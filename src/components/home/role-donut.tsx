"use client";

import { useState } from "react";

// Who's registering, as a donut. Colours are a fixed, colour-blind-checked order (largest
// group first); anything past the fifth group is folded into a neutral "Other". Hovering or
// focusing a slice or its legend entry shows its numbers in the centre.

const COLORS = ["#3b82c4", "#e0603f", "#12a08a", "#9b4f9e", "#c98a0a"];
const OTHER = "#8a99a8";

type Slice = { label: string; count: number; color: string };

export function toSlices(counts: { label: string; count: number }[]): Slice[] {
  const present = counts.filter((c) => c.count > 0);
  const top = present.slice(0, COLORS.length).map((c, i) => ({ ...c, color: COLORS[i] }));
  const rest = present.slice(COLORS.length).reduce((sum, c) => sum + c.count, 0);
  return rest ? [...top, { label: "Other", count: rest, color: OTHER }] : top;
}

const SIZE = 240;
const R = 112;
const r = 74;

function arc(start: number, end: number) {
  const point = (angle: number, radius: number) => {
    const a = angle - Math.PI / 2;
    return `${SIZE / 2 + radius * Math.cos(a)} ${SIZE / 2 + radius * Math.sin(a)}`;
  };
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${point(start, R)} A ${R} ${R} 0 ${large} 1 ${point(end, R)} L ${point(end, r)} A ${r} ${r} 0 ${large} 0 ${point(start, r)} Z`;
}

export function RoleDonut({ counts, total, totalLabel }: { counts: { label: string; count: number }[]; total: number; totalLabel: string }) {
  const slices = toSlices(counts);
  const sum = slices.reduce((s, c) => s + c.count, 0);
  const [active, setActive] = useState<number | null>(null);
  const pct = (n: number) => (sum ? Math.round((n / sum) * 100) : 0);
  const current = active === null ? null : slices[active];

  // Each slice runs from the end of the previous one; a lone slice is drawn as a full ring.
  const sweeps = slices.map((s) => (sum ? (s.count / sum) * Math.PI * 2 : 0));
  const starts = sweeps.map((_, i) => sweeps.slice(0, i).reduce((a, b) => a + b, 0));
  const paths = sweeps.map((sweep, i) => (sweep >= Math.PI * 2 - 1e-6 ? null : arc(starts[i], starts[i] + sweep)));

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative flex-none" onMouseLeave={() => setActive(null)}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`${totalLabel}: ${slices.map((s) => `${s.label} ${s.count}`).join(", ")}`}
          className="size-[200px]"
        >
          {slices.map((s, i) =>
            paths[i] === null ? (
              <circle
                key={s.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={(R + r) / 2}
                fill="none"
                stroke={s.color}
                strokeWidth={R - r}
                onMouseEnter={() => setActive(i)}
              />
            ) : (
              <path
                key={s.label}
                d={paths[i]!}
                fill={s.color}
                stroke="#fff"
                strokeWidth={2}
                strokeLinejoin="round"
                opacity={active === null || active === i ? 1 : 0.35}
                onMouseEnter={() => setActive(i)}
                className="transition-opacity duration-150"
              />
            ),
          )}
        </svg>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
          <span className="font-display text-4xl leading-none font-extrabold text-navy tabular-nums">
            {current ? `${pct(current.count)}%` : total.toLocaleString("en-KE")}
          </span>
          <span className="mt-1.5 text-[13px] leading-tight font-semibold text-muted">{current ? current.label : totalLabel}</span>
        </div>
      </div>
      <ul className="flex w-full min-w-0 flex-col">
        {slices.map((s, i) => (
          <li key={s.label}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors ${active === i ? "bg-mist" : ""}`}
            >
              <span aria-hidden="true" className="size-3.5 flex-none rounded-[4px]" style={{ background: s.color }} />
              <span className="min-w-0 flex-1 text-[15px] leading-snug text-ink">{s.label}</span>
              <span className="text-[15px] font-bold text-ink tabular-nums">{s.count.toLocaleString("en-KE")}</span>
              <span className="w-11 text-right text-sm text-muted tabular-nums">{pct(s.count)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
