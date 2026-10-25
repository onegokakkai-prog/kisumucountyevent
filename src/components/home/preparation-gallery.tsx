"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/festival";
import { Icon } from "../icons";

const VISIBLE = 5;

// Grid of preparation photos; any photo opens a full-screen viewer that can step through all of them.
export function PreparationGallery({ photos }: { photos: Photo[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const hidden = Math.max(0, photos.length - VISIBLE);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index === null) dialog.close();
    else if (!dialog.open) dialog.showModal();
  }, [index]);

  const step = (delta: number) =>
    setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length));

  const photo = index === null ? null : photos[index];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {photos.slice(0, VISIBLE).map((p, i) => {
          const more = i === VISIBLE - 1 && hidden > 0;
          return (
            <li key={p.src} className={i === 0 ? "col-span-2 lg:row-span-2" : ""}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className={`group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[18px] bg-mist-2 lg:h-full ${
                  i === 0 ? "lg:aspect-auto" : ""
                }`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 600px, 100vw" : "(min-width: 1024px) 300px, 50vw"}
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                {more ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-navy/65 font-display text-[28px] font-extrabold text-white">
                    +{hidden} more
                  </span>
                ) : (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent px-4 pt-10 pb-3.5 text-left text-sm font-semibold text-white sm:text-[15px]">
                    {p.caption}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Preparation photos"
        onClose={() => setIndex(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIndex(null);
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        }}
        className="m-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-navy/92 backdrop:backdrop-blur-sm"
      >
        {photo ? (
          <div className="flex h-full flex-col gap-4 px-4 py-4 sm:px-8 sm:py-6">
            <div className="flex items-center justify-between gap-4 text-white">
              <p className="text-sm font-semibold text-haze tabular-nums" aria-live="polite">
                {index! + 1} / {photos.length}
              </p>
              <button
                type="button"
                onClick={() => setIndex(null)}
                aria-label="Close photos"
                className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <Icon name="close" size={22} strokeWidth={2.2} />
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="flex size-12 flex-none cursor-pointer items-center justify-center rounded-full bg-white text-navy hover:bg-sun"
              >
                <Icon name="chevron-left" size={22} strokeWidth={2.5} />
              </button>
              <div className="min-w-0 text-center">
                <p className="font-semibold text-white">{photo.caption}</p>
                {photo.credit ? <p className="mt-0.5 text-xs text-haze/80">Photo: {photo.credit}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="flex size-12 flex-none cursor-pointer items-center justify-center rounded-full bg-white text-navy hover:bg-sun"
              >
                <Icon name="chevron-right" size={22} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
