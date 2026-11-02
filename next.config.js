/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product photos come from Shopify's CDN, which resizes them itself.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};

module.exports = nextConfig;
