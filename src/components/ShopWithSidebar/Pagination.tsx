"use client";

type Props = { page: number; pages: number; onChange: (page: number) => void };

// Page numbers shown around the current page, with gaps marked as "…".
function pageList(page: number, pages: number): (number | "gap")[] {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of [...keep].sort((a, b) => a - b)) {
    if (p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;
  const btn = "min-w-[40px] h-10 px-3 rounded-full text-custom-sm font-medium ease-out duration-200";
  return (
    <nav aria-label="Pages" className="flex justify-center mt-15">
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          <button disabled={page <= 1} onClick={() => onChange(page - 1)} className={`${btn} text-dark hover:bg-gray-2 disabled:opacity-40 disabled:hover:bg-transparent`}>
            ← Prev
          </button>
        </li>
        {pageList(page, pages).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} className="px-1 text-dark-4">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`${btn} ${p === page ? "bg-dark text-ivory" : "text-dark hover:bg-gray-2"}`}
              >
                {p}
              </button>
            </li>
          )
        )}
        <li>
          <button disabled={page >= pages} onClick={() => onChange(page + 1)} className={`${btn} text-dark hover:bg-gray-2 disabled:opacity-40 disabled:hover:bg-transparent`}>
            Next →
          </button>
        </li>
      </ul>
    </nav>
  );
}
