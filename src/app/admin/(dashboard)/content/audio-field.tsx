"use client";

import { useRef, useState } from "react";
import { audioAccept } from "@/lib/media-types";
import { secondaryButtonClass } from "../admin-ui";
import { uploadFile } from "./upload";

function formatDuration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Reads a recording's length in the browser so the player can show it before anything loads.
// null means this browser can't play it, so visitors' browsers likely can't either.
function readDuration(file: File) {
  return new Promise<string | null>((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    const done = (value: string | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    audio.preload = "metadata";
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) ? formatDuration(audio.duration) : "");
    audio.onerror = () => done(null);
    audio.src = url;
  });
}

export function AudioField({ name, initial, initialDuration }: { name: string; initial: string; initialDuration: string }) {
  const [src, setSrc] = useState(initial);
  const [duration, setDuration] = useState(initialDuration);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    const length = await readDuration(file);
    if (length === null) {
      setError("This recording can't be played in web browsers. Export or convert it to MP3, then upload it again.");
      return;
    }
    setProgress(0);
    try {
      setSrc(await uploadFile("audio", file, setProgress));
      setDuration(length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={src} />
      <input type="hidden" name="duration" value={duration} />
      {src ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-line p-3">
          <audio controls preload="none" src={src} className="w-full" />
          <p className="truncate text-sm text-muted">
            {src.split("/").pop()}
            {duration ? ` · ${duration}` : ""}
          </p>
        </div>
      ) : (
        <p className="rounded-xl bg-mist px-4 py-3 text-[15px] text-muted">No recording. The player is hidden.</p>
      )}
      {progress !== null ? (
        <div className="flex items-center gap-3 rounded-xl bg-mist px-4 py-3 text-sm">
          <span className="flex-1">Uploading…</span>
          <span className="h-1.5 w-32 overflow-hidden rounded-full bg-line">
            <span className="block h-full bg-navy" style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        </div>
      ) : null}
      {error ? <p className="text-sm font-semibold text-rust">{error}</p> : null}
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Or play from a link
        <input
          type="url"
          inputMode="url"
          placeholder="https://… (an MP3 file or a live audio stream)"
          value={src}
          onChange={(e) => {
            setSrc(e.target.value.trim());
            setDuration("");
          }}
          className="min-h-11 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3 py-2 text-[15px] font-normal focus:border-navy focus:outline-3 focus:outline-offset-1 focus:outline-sun"
        />
        <span className="font-normal text-muted">Uploading fills this in for you. A live stream shows as “Live” with no seek bar.</span>
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={audioAccept}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={progress !== null} className={secondaryButtonClass}>
          {src ? "Replace recording" : "Upload recording"}
        </button>
        {src ? (
          <button type="button" onClick={() => setSrc("")} className="min-h-11 rounded-full px-4 text-[15px] font-semibold text-rust hover:bg-rust-soft">
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
