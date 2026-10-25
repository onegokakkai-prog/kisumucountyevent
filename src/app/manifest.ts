import type { MetadataRoute } from "next";
import { festival } from "@/lib/festival";

// Lets visitors add the festival to their home screen. Icons are rendered from app/icon.svg.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${festival.name} ${festival.year}`,
    short_name: "Kisumu EduFest",
    description: festival.theme,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b2440",
    theme_color: "#0b2440",
    lang: "en-KE",
    categories: ["education", "events"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
