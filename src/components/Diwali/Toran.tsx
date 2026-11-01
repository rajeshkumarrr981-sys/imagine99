/**
 * A marigold garland (toran) that repeats across its width.
 * Used as a thin festive divider. Decorative. Needs <DiwaliDefs /> on the page.
 */
export default function Toran({ className = "", leaves = true }: { className?: string; leaves?: boolean }) {
  return (
    <svg aria-hidden="true" className={`block w-full ${className}`} height="30" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="30" fill={`url(#${leaves ? "toran-leaves" : "toran-plain"})`} />
    </svg>
  );
}
