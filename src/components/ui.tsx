export function Eyebrow({ children, className = "text-rust" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm font-bold tracking-[0.08em] uppercase ${className}`}>{children}</p>;
}

export function SectionTitle({
  children,
  id,
  className = "text-navy",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={`font-display text-[clamp(32px,4.4vw,52px)] leading-[1.04] font-extrabold tracking-[-0.025em] text-balance ${className}`}
    >
      {children}
    </h2>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1240px] px-4 sm:px-8 ${className}`}>{children}</div>;
}
