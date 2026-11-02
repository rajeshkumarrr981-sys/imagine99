// next/image loader. Shopify's CDN resizes images itself (via the `width` query
// parameter), so remote product photos are served straight from it instead of
// through Vercel's image optimisation, which has a monthly quota.
type LoaderProps = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width }: LoaderProps): string {
  if (src.startsWith("https://cdn.shopify.com/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    return url.toString();
  }
  // Local files under /public are already sized for the page.
  return src.startsWith("/") ? `${src}${src.includes("?") ? "&" : "?"}w=${width}` : src;
}
