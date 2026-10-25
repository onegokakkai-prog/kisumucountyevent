"use client";

import { useRef, useState } from "react";
import { secondaryButtonClass } from "../admin-ui";
import type { ItemField } from "./fields";
import { uploadFile } from "./upload";

const inputClass =
  "min-h-11 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3 py-2 text-[15px] text-ink focus:border-navy focus:outline-3 focus:outline-offset-1 focus:outline-sun";

type Row = Record<string, string>;
type Session = { track: string; title: string };

// Items are edited as plain text and converted back to their real shape when saved, so
// typing in a "one per line" box never loses a blank line mid-edit.
function toRow(item: Record<string, unknown>, fields: ItemField[]): Row {
  const row: Row = {};
  for (const f of fields) {
    const v = item[f.key];
    if (f.type === "lines") row[f.key] = Array.isArray(v) ? v.join("\n") : "";
    else if (f.type === "sessions")
      row[f.key] = Array.isArray(v) ? (v as Session[]).map((s) => (s.track ? `${s.track} | ${s.title}` : s.title)).join("\n") : "";
    else row[f.key] = typeof v === "string" ? v : "";
  }
  return row;
}

function newItemId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyRow(fields: ItemField[]): Row {
  return Object.fromEntries(
    fields.map((f) => [f.key, f.type === "select" ? (f.options?.[0]?.value ?? "") : f.type === "id" ? newItemId() : ""]),
  );
}

export function ListField({
  name,
  fields,
  initial,
  itemName,
  max,
}: {
  name: string;
  fields: ItemField[];
  initial: Record<string, unknown>[];
  itemName: string;
  max: number;
}) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((item) => toRow(item, fields)));
  const update = (i: number, key: string, value: string) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const move = (i: number, delta: number) =>
    setRows((rs) => {
      const next = [...rs];
      const [row] = next.splice(i, 1);
      next.splice(i + delta, 0, row);
      return next;
    });
  const title = fields.find((f) => f.key === "title")?.key ?? fields.find((f) => f.type === "text")?.key;

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.length === 0 ? <p className="rounded-xl bg-mist px-4 py-3 text-[15px] text-muted">None yet.</p> : null}
      <ol className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <li key={i} className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <div className="flex items-center gap-2">
              <span className="mr-auto min-w-0 truncate text-[15px] font-bold text-navy">
                {i + 1}. {(title && row[title]) || `New ${itemName}`}
              </span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="min-h-9 rounded-lg px-2.5 text-sm font-semibold text-navy hover:bg-mist disabled:opacity-30">
                ↑<span className="sr-only"> Move up</span>
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === rows.length - 1}
                className="min-h-9 rounded-lg px-2.5 text-sm font-semibold text-navy hover:bg-mist disabled:opacity-30"
              >
                ↓<span className="sr-only"> Move down</span>
              </button>
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                className="min-h-9 rounded-lg px-2.5 text-sm font-semibold text-rust hover:bg-rust-soft"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <ItemInput key={f.key} field={f} value={row[f.key] ?? ""} onChange={(v) => update(i, f.key, v)} />
              ))}
            </div>
          </li>
        ))}
      </ol>
      {rows.length < max ? (
        <div>
          <button type="button" onClick={() => setRows((rs) => [...rs, emptyRow(fields)])} className={secondaryButtonClass}>
            + Add {itemName}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ItemInput({ field, value, onChange }: { field: ItemField; value: string; onChange: (v: string) => void }) {
  if (field.type === "id") return null;
  const wide = field.type === "textarea" || field.type === "lines" || field.type === "sessions" || field.type === "image";
  const label = (
    <span>
      {field.label}
      {field.required ? null : <span className="font-normal text-muted"> (optional)</span>}
    </span>
  );
  const help = field.help ? <span className="text-[13px] font-normal text-muted">{field.help}</span> : null;

  if (field.type === "image") {
    return (
      <div className={`flex flex-col gap-1.5 text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
        <span>{field.label}</span>
        <ImageInput value={value} onChange={onChange} />
      </div>
    );
  }

  return (
    <label className={`flex flex-col gap-1.5 text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {field.type === "select" ? field.label : label}
      {field.type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "text" ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.type === "textarea" ? 2 : Math.max(3, value.split("\n").length + 1)}
          className={inputClass}
        />
      )}
      {help}
    </label>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    setProgress(0);
    try {
      onChange(await uploadFile("image", file, setProgress));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary uploaded URL
        <img src={value} alt="" className="h-20 w-28 rounded-xl border border-line bg-white object-contain" />
      ) : (
        <span className="flex h-20 w-28 items-center justify-center rounded-xl border border-dashed border-line-strong text-[13px] font-normal text-muted">
          No image
        </span>
      )}
      <div className="flex flex-col items-start gap-1">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
        <div className="flex gap-1">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={progress !== null} className={secondaryButtonClass}>
            {progress !== null ? `Uploading ${Math.round(progress * 100)}%` : value ? "Replace" : "Upload"}
          </button>
          {value ? (
            <button type="button" onClick={() => onChange("")} className="min-h-11 rounded-full px-3 text-[15px] font-semibold text-rust hover:bg-rust-soft">
              Remove
            </button>
          ) : null}
        </div>
        {error ? <span className="text-[13px] font-semibold text-rust">{error}</span> : null}
      </div>
    </div>
  );
}
