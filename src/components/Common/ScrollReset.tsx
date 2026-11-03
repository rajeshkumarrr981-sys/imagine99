"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Opens every new page at the top. Next.js sometimes keeps the old scroll position
 * (for example, tapping a category halfway down the home page opened the shop near
 * its footer). Back/forward is left alone so the browser can restore the old position.
 */
export default function ScrollReset() {
  const pathname = usePathname();
  const first = useRef(true);
  const fromHistory = useRef(false);

  useEffect(() => {
    const onPop = () => (fromHistory.current = true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
