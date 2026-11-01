type Props = {
  /** Length of the hanging string in px. */
  drop?: number;
  /** Lantern width in px (height scales with it). */
  size?: number;
  variant?: "kandil" | "round";
  /** "night" glows brighter, for dark backgrounds. */
  tone?: "night" | "light";
  /** Seconds to offset the sway so lanterns don't move in step. */
  delay?: number;
  className?: string;
};

/**
 * A hanging paper lantern on a string. Purely decorative.
 * It sways gently from the top; the motion stops when reduced motion is preferred.
 * Needs <DiwaliDefs /> on the page.
 */
export default function Lantern({ drop = 60, size = 56, variant = "kandil", tone = "night", delay = 0, className = "" }: Props) {
  const night = tone === "night";
  const height = (size / 60) * 112;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex flex-col items-center origin-top animate-sway ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${6 + (delay % 3)}s` }}
    >
      <span className={`block w-px ${night ? "bg-brass/50" : "bg-brass/40"}`} style={{ height: drop }} />
      <svg width={size} height={height} viewBox="0 0 60 112" fill="none" xmlns="http://www.w3.org/2000/svg" className="-mt-px overflow-visible">
        <circle cx="30" cy="50" r="46" fill={`url(#lantern-halo-${tone})`} className="animate-glow" />

        {/* top cap and ring */}
        <circle cx="30" cy="1.5" r="1.5" stroke="#B8925A" strokeWidth="0.8" />
        <path d="M24 9 L25.5 3.5 H34.5 L36 9 Z" fill="#B8925A" />

        {variant === "kandil" ? (
          <g>
            <path d="M30 9 L47 22 L52 50 L47 78 L30 91 L13 78 L8 50 L13 22 Z" fill={`url(#lantern-paper-${tone})`} />
            <g clipPath={`url(#lantern-clip-${variant})`}>
              <rect x="0" y="0" width="60" height="100" fill={`url(#lantern-light-${tone})`} />
              {/* paper ribs */}
              <path d="M30 9 Q19 50 30 91 M30 9 Q41 50 30 91 M13 22 Q22 50 13 78 M47 22 Q38 50 47 78" stroke="#7A2430" strokeOpacity="0.28" strokeWidth="0.7" />
              {/* patterned band */}
              <rect x="0" y="45" width="60" height="10" fill="#7A2430" fillOpacity="0.72" />
              <g fill="#F4D79E">
                <circle cx="12" cy="50" r="1.1" />
                <circle cx="19" cy="50" r="1.1" />
                <circle cx="26" cy="50" r="1.1" />
                <circle cx="34" cy="50" r="1.1" />
                <circle cx="41" cy="50" r="1.1" />
                <circle cx="48" cy="50" r="1.1" />
              </g>
              <path d="M8 45 H52 M8 55 H52" stroke="#E1A23A" strokeWidth="0.6" />
            </g>
            <path d="M30 9 L47 22 L52 50 L47 78 L30 91 L13 78 L8 50 L13 22 Z" stroke="#8C6B3C" strokeOpacity="0.7" strokeWidth="0.8" />
          </g>
        ) : (
          <g>
            <ellipse cx="30" cy="50" rx="22" ry="31" fill={`url(#lantern-paper-${tone})`} />
            <g clipPath={`url(#lantern-clip-${variant})`}>
              <rect x="0" y="0" width="60" height="100" fill={`url(#lantern-light-${tone})`} />
              {/* horizontal ribs of a folded paper lantern */}
              <g stroke="#7A2430" strokeOpacity="0.25" strokeWidth="0.7">
                <path d="M8 30 Q30 35 52 30" />
                <path d="M8 40 Q30 45 52 40" />
                <path d="M8 60 Q30 65 52 60" />
                <path d="M8 70 Q30 75 52 70" />
              </g>
              <path d="M8 49 Q30 55 52 49 L52 52 Q30 58 8 52 Z" fill="#7A2430" fillOpacity="0.7" />
            </g>
            <ellipse cx="30" cy="50" rx="22" ry="31" stroke="#8C6B3C" strokeOpacity="0.7" strokeWidth="0.8" />
          </g>
        )}

        {/* bottom cap, bead and tassel */}
        <path d="M25 91 H35 L33.5 95 H26.5 Z" fill="#B8925A" />
        <circle cx="30" cy="98" r="1.8" fill="#8A2432" />
        <g stroke="#8A2432" strokeWidth="0.8" strokeLinecap="round">
          <path d="M28 100 L27 111" />
          <path d="M30 100 V112" />
          <path d="M32 100 L33 111" />
        </g>
      </svg>
    </div>
  );
}
