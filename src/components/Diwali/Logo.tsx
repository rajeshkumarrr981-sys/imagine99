import Link from "next/link";

/** Small diya-flame mark used in the logo and favicon. */
export function FlameMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 3 C19 8.5 21.5 12 21.5 15.8 C21.5 19.2 19.1 21.6 16 21.6 C12.9 21.6 10.5 19.2 10.5 15.8 C10.5 12 13 8.5 16 3 Z" fill="#E1A23A" />
      <path d="M16 10.5 C17.4 13.2 18.2 14.8 18.2 16.6 C18.2 18.3 17.2 19.4 16 19.4 C14.8 19.4 13.8 18.3 13.8 16.6 C13.8 14.8 14.6 13.2 16 10.5 Z" fill="#FFF4DA" />
      <path d="M3.5 22.5 C8 21.6 12 21.3 16 21.3 C20 21.3 24 21.6 28.5 22.5 C27.5 27 22.5 29.5 16 29.5 C9.5 29.5 4.5 27 3.5 22.5 Z" fill="#8A2432" />
    </svg>
  );
}

type Props = { tone?: "ink" | "ivory"; className?: string; href?: string | null };

/** Imagine99 wordmark with the flame mark. */
export default function Logo({ tone = "ink", className = "", href = "/" }: Props) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <FlameMark />
      <span className={`font-display text-[26px] leading-none font-medium tracking-[-0.02em] ${tone === "ink" ? "text-dark" : "text-ivory"}`}>
        Imagine<span className={`italic ${tone === "ink" ? "text-blue" : "text-marigold"}`}>99</span>
      </span>
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} aria-label="Imagine99 home" className="shrink-0">
      {content}
    </Link>
  );
}
