"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/festival";
import { Icon } from "../icons";

const SMALL = 4;

// Grid placement of the large photos, by how many there are.
const layout: Record<number, string> = {
  1: "col-span-2 lg:row-span-2",
  2: "col-span-2 lg:col-span-6",
  3: "col-span-2 lg:col-span-4",
};

// Grid of preparation photos: the first one to three are shown large, with up to four smaller
// ones under them. Any photo opens a full-screen viewer that can step through all of them.
export function PreparationGallery({ photos, large: largeSetting }: { photos: Photo[]; large: number }) {
  const large = Math.min(3, Math.max(1, Math.round(largeSetting) || 1));
  const visible = large + SMALL;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const hidden = Math.max(0, photos.length - visible);

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
      <ul className={`grid grid-cols-2 gap-3 sm:gap-4 ${large === 1 ? "lg:grid-cols-4 lg:grid-rows-2" : "lg:grid-cols-12"}`}>
        {photos.slice(0, visible).map((p, i) => {
          const isLarge = i < large;
          const more = i === visible - 1 && hidden > 0;
          return (
            <li key={p.src} className={isLarge ? layout[large] : "lg:col-span-3"}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className={`group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[18px] bg-mist-2 lg:h-full ${
                  isLarge && large === 1 ? "lg:aspect-auto" : ""
                }`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes={isLarge ? `(min-width: 1024px) ${large === 3 ? 400 : 600}px, 100vw` : "(min-width: 1024px) 300px, 50vw"}
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                {more ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-navy/65 font-display text-[28px] font-extrabold text-white">
                    +{hidden} more
                  </span>
                ) : (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 via-navy/60 to-transparent px-4 pt-12 pb-3.5 text-left text-sm font-semibold text-white sm:text-[15px]">
                    <span className={`${isLarge ? "line-clamp-3" : "line-clamp-2"} leading-snug`}>{p.caption}</span>
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
              <div className="max-h-[30dvh] max-w-[70ch] min-w-0 overflow-y-auto text-center">
                <p className="leading-relaxed font-semibold whitespace-pre-line text-white">{photo.caption}</p>
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
