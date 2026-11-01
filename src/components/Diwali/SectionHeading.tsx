import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  action?: { label: string; href: string };
  className?: string;
  align?: "left" | "center";
};

/** The shared section title: small-caps label, serif heading, optional link. */
export default function SectionHeading({ eyebrow, title, action, className = "", align = "left" }: Props) {
  if (align === "center") {
    return (
      <div className={`text-center mb-10 ${className}`}>
        <p className="eyebrow inline-flex items-center gap-3">
          <span className="h-px w-8 bg-brass/60" />
          {eyebrow}
          <span className="h-px w-8 bg-brass/60" />
        </p>
        <h2 className="mt-3 text-[30px] sm:text-[38px] leading-[1.15] text-dark">{title}</h2>
      </div>
    );
  }
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 mb-9 ${className}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2.5 text-[28px] sm:text-[34px] leading-[1.15] text-dark">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-2 text-custom-sm font-medium text-dark border-b border-dark/30 pb-0.5 hover:text-blue hover:border-blue ease-out duration-200"
        >
          {action.label}
          <span aria-hidden="true" className="ease-out duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </div>
  );
}
