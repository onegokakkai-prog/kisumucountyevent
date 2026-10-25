"use client";

import { useRef, useState } from "react";
import type { Photo } from "@/lib/festival";
import { secondaryButtonClass } from "../admin-ui";
import { uploadFile } from "./upload";

const CAPTION_MAX = 1000;

const inputClass =
  "min-h-11 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3 py-2 text-[15px] focus:border-navy focus:outline-3 focus:outline-offset-1 focus:outline-sun";

export function PhotosField({ name, initial }: { name: string; initial: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [uploading, setUploading] = useState<{ name: string; progress: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (i: number, patch: Partial<Photo>) => setPhotos((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const move = (i: number, delta: number) =>
    setPhotos((ps) => {
      const next = [...ps];
      const [item] = next.splice(i, 1);
      next.splice(i + delta, 0, item);
      return next;
    });

  async function add(files: FileList) {
    setError(null);
    for (const file of Array.from(files)) {
      setUploading((u) => [...u, { name: file.name, progress: 0 }]);
      try {
        const src = await uploadFile("image", file, (progress) =>
          setUploading((u) => u.map((x) => (x.name === file.name ? { ...x, progress } : x))),
        );
        setPhotos((ps) => [...ps, { src, alt: "", caption: "" }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading((u) => u.filter((x) => x.name !== file.name));
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(photos)} />
      {photos.length === 0 ? <p className="rounded-xl bg-mist px-4 py-3 text-[15px] text-muted">No photos. The section is hidden.</p> : null}
      <ol className="flex flex-col gap-3">
        {photos.map((p, i) => (
          <li key={`${p.src}-${i}`} className="flex flex-col gap-3 rounded-2xl border border-line p-3 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary uploaded URL */}
            <img src={p.src} alt="" className="aspect-[4/3] w-full flex-none rounded-xl bg-mist object-cover sm:w-40" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Description for screen readers (required)
                <input value={p.alt} onChange={(e) => update(i, { alt: e.target.value })} required maxLength={600} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                <span className="flex items-baseline justify-between gap-3">
                  Caption
                  <span className={`text-xs font-normal tabular-nums ${p.caption.length > CAPTION_MAX ? "text-rust" : "text-muted"}`}>
                    {p.caption.length.toLocaleString("en-KE")} / {CAPTION_MAX.toLocaleString("en-KE")}
                  </span>
                </span>
                <textarea
                  value={p.caption}
                  onChange={(e) => update(i, { caption: e.target.value })}
                  maxLength={CAPTION_MAX}
                  rows={3}
                  className={`${inputClass} resize-y leading-relaxed`}
                />
              </label>
              {p.credit !== undefined ? (
                <label className="flex flex-col gap-1 text-sm font-semibold">
                  Photo credit
                  <input value={p.credit} onChange={(e) => update(i, { credit: e.target.value })} className={inputClass} />
                </label>
              ) : null}
            </div>
            <div className="flex flex-row gap-1 sm:flex-col">
              <span className="mr-auto self-center text-sm font-bold text-muted sm:mr-0 sm:mb-1">#{i + 1}</span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="min-h-10 rounded-lg px-3 text-sm font-semibold text-navy hover:bg-mist disabled:opacity-30">
                ↑ Up
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === photos.length - 1}
                aria-label="Move down"
                className="min-h-10 rounded-lg px-3 text-sm font-semibold text-navy hover:bg-mist disabled:opacity-30"
              >
                ↓ Down
              </button>
              <button
                type="button"
                onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}
                className="min-h-10 rounded-lg px-3 text-sm font-semibold text-rust hover:bg-rust-soft"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      {uploading.map((u) => (
        <div key={u.name} className="flex items-center gap-3 rounded-xl bg-mist px-4 py-3 text-sm">
          <span className="min-w-0 flex-1 truncate">Uploading {u.name}…</span>
          <span className="h-1.5 w-32 overflow-hidden rounded-full bg-line">
            <span className="block h-full bg-navy" style={{ width: `${Math.round(u.progress * 100)}%` }} />
          </span>
        </div>
      ))}
      {error ? <p className="text-sm font-semibold text-rust">{error}</p> : null}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) void add(e.target.files);
            e.target.value = "";
          }}
        />
        <button type="button" onClick={() => fileRef.current?.click()} className={secondaryButtonClass}>
          + Add photos
        </button>
      </div>
    </div>
  );
}
