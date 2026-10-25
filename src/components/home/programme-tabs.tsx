"use client";

import { useRef, useState } from "react";
import type { FestivalDay } from "@/lib/festival";

export function ProgrammeTabs({ days }: { days: FestivalDay[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const day = days[active];

  function onKeyDown(e: React.KeyboardEvent) {
    let next = active;
    if (e.key === "ArrowRight") next = (active + 1) % days.length;
    else if (e.key === "ArrowLeft") next = (active - 1 + days.length) % days.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = days.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[17px] text-body">
          <strong className="font-bold text-ink">{day.label}</strong> — {day.intro}
        </p>
        <div
          role="tablist"
          aria-label="Festival day"
          onKeyDown={onKeyDown}
          className="inline-flex gap-1 rounded-full bg-mist-2 p-1.5"
        >
          {days.map((d, i) => {
            const selected = i === active;
            return (
              <button
                key={d.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`tab-${d.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`panel-${d.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                className={`min-h-11 cursor-pointer rounded-full px-[26px] text-base font-bold transition-colors ${
                  selected ? "bg-navy text-white" : "bg-transparent text-navy hover:bg-mist-3"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div id={`panel-${day.id}`} role="tabpanel" aria-labelledby={`tab-${day.id}`} className="flex flex-col gap-4">
        <div
          aria-hidden="true"
          className="hidden grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] gap-6 px-[29px] text-[13px] font-bold tracking-[0.06em] text-muted uppercase md:grid"
        >
          <span>Time</span>
          <span>Main stage &amp; plenary</span>
          <span>Experiential hubs &amp; clinics</span>
        </div>
        {day.slots.map((slot) => (
          <article
            key={slot.label}
            className="grid gap-6 rounded-[20px] border border-line bg-white p-6 sm:p-7 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)]"
          >
            <header className="flex flex-col gap-1.5">
              <h3 className="font-display text-2xl font-extrabold text-navy">{slot.label}</h3>
              <p className="text-base font-semibold text-muted">
                <time>{slot.time}</time>
              </p>
            </header>
            <div className="flex flex-col gap-3">
              <h4 className="text-[13px] font-bold tracking-[0.06em] text-muted uppercase md:sr-only">Main stage</h4>
              <ul className="flex flex-col gap-3.5">
                {slot.main.map((s) => (
                  <li key={s.title} className="flex flex-col items-start gap-1">
                    <span className="rounded-full bg-mist-3 px-2.5 py-0.5 text-xs font-bold tracking-[0.04em] text-lake">
                      {s.track}
                    </span>
                    <span className="text-[17px] leading-snug font-semibold text-ink">{s.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[13px] font-bold tracking-[0.06em] text-muted uppercase md:sr-only">
                Hubs &amp; clinics
              </h4>
              <ul className="flex flex-col gap-3.5">
                {slot.hubs.map((s) => (
                  <li key={s.title} className="flex flex-col items-start gap-1">
                    <span className="rounded-full bg-rust-soft px-2.5 py-0.5 text-xs font-bold tracking-[0.04em] text-rust-ink">
                      {s.track}
                    </span>
                    <span className="text-base leading-snug text-body">{s.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
