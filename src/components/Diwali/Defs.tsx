/**
 * Shared SVG gradients, clip paths and patterns for the festive motifs.
 * Rendered once per page so every lantern, diya and toran can reference
 * fixed ids (no per-instance ids, which can differ between server and browser).
 */
export const TORAN_SWAG = 96;

const beads = Array.from({ length: 11 }, (_, i) => {
  const t = (i + 0.5) / 11;
  return { x: TORAN_SWAG * t, y: 3 + 2 * (1 - t) * t * 18, alt: i % 2 === 1 };
});

function toranPattern(id: string, leaves: boolean) {
  return (
    <pattern id={id} width={TORAN_SWAG} height="30" patternUnits="userSpaceOnUse">
      <path d={`M0 3 Q${TORAN_SWAG / 2} 21 ${TORAN_SWAG} 3`} stroke="#B8925A" strokeOpacity="0.55" strokeWidth="0.8" fill="none" />
      {beads.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.alt ? 2.3 : 2.7} fill={b.alt ? "#C8642E" : "#E1A23A"} />
      ))}
      {leaves && (
        <g transform={`translate(${TORAN_SWAG / 2} 14)`}>
          <path d="M0 0 C3.5 3 3.8 8 0 13 C-3.8 8 -3.5 3 0 0 Z" fill="#5F7A4C" />
          <path d="M0 1 V12" stroke="#40553A" strokeWidth="0.5" />
        </g>
      )}
      <circle cx="0" cy="3" r="1.6" fill="#8A2432" />
      <circle cx={TORAN_SWAG} cy="3" r="1.6" fill="#8A2432" />
    </pattern>
  );
}

export default function DiwaliDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} focusable="false">
      <defs>
        {/* lanterns */}
        {(["night", "light"] as const).map((tone) => {
          const night = tone === "night";
          return (
            <g key={tone}>
              <radialGradient id={`lantern-halo-${tone}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F4C36A" stopOpacity={night ? 0.55 : 0.28} />
                <stop offset="100%" stopColor="#F4C36A" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`lantern-paper-${tone}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={night ? "#F7D48E" : "#F8E2B4"} />
                <stop offset="55%" stopColor={night ? "#E8A23E" : "#EDBE6E"} />
                <stop offset="100%" stopColor={night ? "#B9652A" : "#D99A4C"} />
              </linearGradient>
              <radialGradient id={`lantern-light-${tone}`} cx="50%" cy="48%" r="45%">
                <stop offset="0%" stopColor="#FFF4D6" stopOpacity={night ? 0.95 : 0.7} />
                <stop offset="100%" stopColor="#FFF4D6" stopOpacity="0" />
              </radialGradient>
            </g>
          );
        })}
        <clipPath id="lantern-clip-kandil" clipPathUnits="userSpaceOnUse">
          <path d="M30 9 L47 22 L52 50 L47 78 L30 91 L13 78 L8 50 L13 22 Z" />
        </clipPath>
        <clipPath id="lantern-clip-round" clipPathUnits="userSpaceOnUse">
          <ellipse cx="30" cy="50" rx="22" ry="31" />
        </clipPath>

        {/* diya */}
        <radialGradient id="diya-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F6C66B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F6C66B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="diya-flame" cx="50%" cy="75%" r="70%">
          <stop offset="0%" stopColor="#FFF8E1" />
          <stop offset="35%" stopColor="#FFD780" />
          <stop offset="75%" stopColor="#F0953A" />
          <stop offset="100%" stopColor="#C9542A" />
        </radialGradient>
        <linearGradient id="diya-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C46A3C" />
          <stop offset="100%" stopColor="#8E3F22" />
        </linearGradient>

        {/* toran garland */}
        {toranPattern("toran-leaves", true)}
        {toranPattern("toran-plain", false)}
      </defs>
    </svg>
  );
}
