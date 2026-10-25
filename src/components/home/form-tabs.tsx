"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Tab = "visitor" | "professional";

// Switches between the visitor and professionals' forms. Only the open form is rendered, so
// the two never clash over field ids. /#professionals (and /professionals) open the second.
export function FormTabs({
  labels,
  visitor,
  professional,
}: {
  labels: { visitor: string; professional: string };
  visitor: ReactNode;
  professional: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("visitor");
  const tabs = useRef<Record<Tab, HTMLButtonElement | null>>({ visitor: null, professional: null });

  useEffect(() => {
    const open = () => {
      if (window.location.hash !== "#professionals") return;
      setTab("professional");
      document.getElementById("register")?.scrollIntoView();
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  const order: Tab[] = ["visitor", "professional"];
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = order[(order.indexOf(tab) + 1) % 2];
    setTab(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label="Registration forms" className="grid grid-cols-2 gap-1.5 rounded-full bg-mist p-1.5">
        {order.map((t) => (
          <button
            key={t}
            ref={(el) => {
              tabs.current[t] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={onKeyDown}
            className="min-h-12 cursor-pointer rounded-full px-4 text-[15px] font-bold text-navy transition-colors hover:bg-white/70 aria-selected:bg-navy aria-selected:text-white sm:text-base"
          >
            {labels[t]}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "visitor" ? visitor : professional}
      </div>
    </div>
  );
}
