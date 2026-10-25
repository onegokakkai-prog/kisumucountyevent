import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { getContent } from "@/lib/content";
import { festival } from "@/lib/festival";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { festival: f } = await getContent();
  return {
    title: {
      default: `${f.name} ${festival.year}`,
      template: `%s · ${f.name} ${festival.year}`,
    },
    description: `${f.theme} ${f.dateLabel} at ${f.venue}, Kisumu County, Kenya.`,
    openGraph: {
      title: `${f.name} ${festival.year}`,
      description: f.theme,
      type: "website",
      locale: "en_KE",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b2440",
};

const hex = /^#[0-9a-f]{6}$/i;

// Colours chosen in /admin/content override the theme tokens from globals.css.
async function ThemeColors() {
  const { colors } = await getContent();
  const vars = Object.entries(colors)
    .filter(([, value]) => hex.test(value))
    .map(([name, value]) => `--color-${name}:${value};`)
    .join("");
  return vars ? <style>{`:root{${vars}}`}</style> : null;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} antialiased`}>
      <head>
        <ThemeColors />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
