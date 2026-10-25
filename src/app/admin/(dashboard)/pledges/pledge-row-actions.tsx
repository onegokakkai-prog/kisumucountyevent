"use client";

import { useTransition } from "react";
import type { PledgeStatus } from "@/lib/pledges";
import { removePledge, updatePledgeStatus } from "./actions";

export function PledgeRowActions({ id, status, name }: { id: string; status: PledgeStatus; name: string }) {
  const [pending, start] = useTransition();
  const received = status === "received";

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => updatePledgeStatus(id, received ? "pledged" : "received"))}
        className={`inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-sm font-bold whitespace-nowrap transition-colors disabled:cursor-wait disabled:opacity-60 ${
          received ? "border-[1.5px] border-line-strong bg-white text-navy hover:border-navy" : "bg-navy text-white hover:bg-lake"
        }`}
      >
        {received ? "Undo received" : "Mark received"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm(`Delete the pledge from ${name}? This can't be undone.`)) start(() => removePledge(id));
        }}
        className="inline-flex min-h-10 cursor-pointer items-center rounded-full px-3 text-sm font-semibold text-rust hover:bg-rust-soft disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
