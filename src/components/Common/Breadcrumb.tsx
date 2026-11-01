import Link from "next/link";
import React from "react";

type Props = { title: string; pages: string[] };

/** Page title band shown at the top of inner pages. */
const Breadcrumb = ({ title, pages }: Props) => {
  return (
    <div className="relative overflow-hidden bg-gray-1 bg-kolam border-b border-gray-3">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pt-14 pb-9 xl:pt-16 xl:pb-11">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-custom-xs uppercase tracking-[0.18em] text-dark-4">
            <li>
              <Link href="/" className="hover:text-blue ease-out duration-200">
                Home
              </Link>
            </li>
            {pages.map((page, key) => (
              <li key={key} className="flex items-center gap-2 last:text-brass-dark">
                <span aria-hidden="true" className="text-brass">
                  ✦
                </span>
                {page}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="mt-3 text-[32px] sm:text-[40px] leading-[1.1] text-dark">{title}</h1>
      </div>
    </div>
  );
};

export default Breadcrumb;
