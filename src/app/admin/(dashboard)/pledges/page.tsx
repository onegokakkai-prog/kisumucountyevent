import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { getContent } from "@/lib/content";
import { listPledges } from "@/lib/pledges";
import { formatPhone } from "@/lib/registrations";
import { kes, LoadingPanel, nairobiDate, PageHeader, Panel, Stats } from "../admin-ui";
import { PledgeRowActions } from "./pledge-row-actions";

export const metadata: Metadata = { title: "Pledges" };

export default function PledgesPage() {
  return (
    <>
      <PageHeader
        title="Pledges"
        description="Buy-a-Brick pledges from the website. Mark a pledge as received once the money arrives; it then counts towards the progress bar on the site."
        actions={
          <>
            <Link
              href="/admin/content#brick"
              className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-line-strong bg-white px-5 text-[15px] font-semibold text-navy hover:border-navy"
            >
              Edit pledge instructions
            </Link>
            <a
              href="/admin/pledges.csv"
              className="inline-flex min-h-11 items-center rounded-full bg-sun px-5 text-[15px] font-bold text-navy hover:brightness-105"
            >
              Download CSV
            </a>
          </>
        }
      />
      <Container className="flex flex-col gap-6">
        <Suspense fallback={<LoadingPanel label="Loading pledges…" />}>
          <Pledges />
        </Suspense>
      </Container>
    </>
  );
}

async function Pledges() {
  await connection();
  const [rows, { brick }] = await Promise.all([listPledges(), getContent()]);
  const received = rows.filter((r) => r.status === "received");
  const receivedTotal = received.reduce((sum, r) => sum + r.amount, 0);
  const pledgedTotal = rows.reduce((sum, r) => sum + r.amount, 0);
  const raised = receivedTotal + brick.raisedOffline;

  return (
    <>
      <Stats
        items={[
          { label: "Pledges", value: rows.length.toLocaleString("en-KE") },
          { label: "Total pledged", value: kes.format(pledgedTotal) },
          { label: "Received", value: `${kes.format(receivedTotal)} · ${received.length}` },
          { label: "Shown as raised on site", value: kes.format(raised) },
          { label: "Goal", value: brick.target ? kes.format(brick.target) : "Not set" },
        ]}
      />
      <Panel title="All pledges">
        {rows.length === 0 ? (
          <p className="text-muted">No pledges yet. Pledges made with the Buy-a-Brick form on the website appear here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-line text-[13px] tracking-[0.06em] text-muted uppercase">
                  <th className="py-3 pr-4 font-bold">Name</th>
                  <th className="py-3 pr-4 font-bold">Phone</th>
                  <th className="py-3 pr-4 text-right font-bold">Amount</th>
                  <th className="py-3 pr-4 font-bold">Status</th>
                  <th className="py-3 pr-4 font-bold">Pledged</th>
                  <th className="py-3 text-right font-bold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line align-top last:border-0">
                    <td className="py-3 pr-4">
                      <span className="font-semibold">{r.name}</span>
                      {r.email ? <span className="block text-sm text-muted">{r.email}</span> : null}
                      {r.message ? <span className="mt-1 block max-w-[320px] text-sm text-body italic">“{r.message}”</span> : null}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <a href={`tel:+${r.phone}`} className="underline-offset-4 hover:underline">
                        {formatPhone(r.phone)}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                      <span className="font-semibold">{kes.format(r.amount)}</span>
                      {r.bricks ? (
                        <span className="block text-sm text-muted">
                          {r.bricks} brick{r.bricks === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[13px] font-bold ${
                          r.status === "received" ? "bg-[#dcf3e3] text-[#17603a]" : "bg-sun/25 text-[#7a5300]"
                        }`}
                      >
                        {r.status === "received" ? "Received" : "Pledged"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted">{nairobiDate(r.createdAt)}</td>
                    <td className="py-2 text-right">
                      <PledgeRowActions id={r.id} status={r.status} name={r.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
