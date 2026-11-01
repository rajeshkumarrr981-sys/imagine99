type Props = {
  size?: number;
  className?: string;
  /** Seconds to offset the flicker. */
  delay?: number;
};

/** A small clay oil lamp with a softly flickering flame. Decorative. Needs <DiwaliDefs /> on the page. */
export default function Diya({ size = 48, className = "", delay = 0 }: Props) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={(size / 64) * 52}
      viewBox="0 0 64 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible ${className}`}
    >
      <circle cx="32" cy="18" r="18" fill="url(#diya-halo)" className="animate-glow" style={{ animationDelay: `${delay}s` }} />

      <g className="animate-flicker" style={{ transformOrigin: "32px 30px", transformBox: "view-box", animationDelay: `${delay}s` }}>
        <path d="M32 4 C35.5 11 38.5 15.5 38.5 20.5 C38.5 25 35.6 28 32 28 C28.4 28 25.5 25 25.5 20.5 C25.5 15.5 28.5 11 32 4 Z" fill="url(#diya-flame)" />
        <path d="M32 14 C33.6 17.5 34.6 19.5 34.6 22 C34.6 24.2 33.4 25.6 32 25.6 C30.6 25.6 29.4 24.2 29.4 22 C29.4 19.5 30.4 17.5 32 14 Z" fill="#FFFBEF" fillOpacity="0.9" />
      </g>

      {/* wick */}
      <path d="M32 27.5 V30" stroke="#3B2418" strokeWidth="1.2" strokeLinecap="round" />

      {/* bowl with a pinched spout on the right */}
      <path d="M4 31 C10 29.5 22 28.8 32 28.8 C42 28.8 52 29.5 60 31 C59 42 47 48 32 48 C17 48 5 42 4 31 Z" fill="url(#diya-clay)" />
      <path d="M4 31 C10 29.5 22 28.8 32 28.8 C42 28.8 52 29.5 60 31 C52 33.5 42 34.4 32 34.4 C22 34.4 12 33.5 4 31 Z" fill="#6E2E17" />
      <path d="M4 31 C10 29.5 22 28.8 32 28.8 C42 28.8 52 29.5 60 31" stroke="#E7A56B" strokeOpacity="0.7" strokeWidth="0.8" />
      {/* painted dots */}
      <g fill="#F2C46E">
        <circle cx="16" cy="40" r="1.1" />
        <circle cx="24" cy="42.5" r="1.1" />
        <circle cx="32" cy="43.3" r="1.1" />
        <circle cx="40" cy="42.5" r="1.1" />
        <circle cx="48" cy="40" r="1.1" />
      </g>
    </svg>
  );
}
