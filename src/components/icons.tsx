import type { SVGProps } from "react";

export type IconName =
  | "medal"
  | "speech"
  | "pathways"
  | "clipboard"
  | "star"
  | "cap"
  | "person"
  | "card"
  | "arrow-right"
  | "chevron-right"
  | "chevron-left"
  | "play"
  | "pause"
  | "check"
  | "menu"
  | "close"
  | "phone";

const paths: Record<IconName, React.ReactNode> = {
  medal: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
    </>
  ),
  speech: (
    <>
      <path d="M4 5h16v10H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  pathways: <path d="M4 19V9M12 19V5M20 19v-7M2 19h20" />,
  clipboard: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  star: <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z" />,
  cap: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="12" r="2.5" />
      <path d="M14 10h4M14 14h4" />
    </>
  ),
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  "chevron-right": <path d="M9 6l6 6-6 6" />,
  "chevron-left": <path d="M15 6l-6 6 6 6" />,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  phone: (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  ),
};

export function Icon({
  name,
  size = 24,
  strokeWidth = 2,
  ...props
}: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true" focusable="false">
      <circle cx="22" cy="20" r="10" className="fill-sun" />
      <path
        d="M4 28c4.5-3.5 9-3.5 13.5 0s9 3.5 13.5 0 9-3.5 9 0"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M4 35c4.5-3.5 9-3.5 13.5 0s9 3.5 13.5 0 9-3.5 9 0"
        className="stroke-wave"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
