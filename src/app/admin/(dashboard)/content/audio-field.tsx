"use client";

import { useRef, useState } from "react";
import { secondaryButtonClass } from "../admin-ui";
import { uploadFile } from "./upload";

function formatDuration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Reads a recording's length in the browser so the player can show it before anything loads.
function readDuration(file: File) {
  return new Promise<string>((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(Number.isFinite(audio.duration) ? formatDuration(audio.duration) : "");
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => resolve("");
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
    setProgress(0);
    try {
      const [url, length] = await Promise.all([uploadFile("audio", file, setProgress), readDuration(file)]);
      setSrc(url);
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
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
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
