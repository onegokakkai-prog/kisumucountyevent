"use client";

import { useState } from "react";
import { ImageInput } from "./list-field";

// A single uploaded image, submitted with the section form as its URL.
export function ImageField({ name, initial }: { name: string; initial: string }) {
  const [src, setSrc] = useState(initial);
  return (
    <>
      <input type="hidden" name={name} value={src} />
      <ImageInput value={src} onChange={setSrc} />
    </>
  );
}
