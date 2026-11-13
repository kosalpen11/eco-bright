import type { NextConfig } from "next";

import { PRODUCTS as CLEANUP_PRODUCTS } from "./scripts/catalog-cleanup-2026-11/mapping";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.1.81"],
  turbopack: {
    root: process.cwd(),
  },
  // Old product URLs used the internal id (/products/V_star_audio). Since the Nov 2026
  // cleanup they live at a public slug; real 308s keep shared links and search results working.
  async redirects() {
    return CLEANUP_PRODUCTS.filter((product) => product.id !== product.slug).map((product) => ({
      source: `/products/${encodeURIComponent(product.id)}`,
      destination: `/products/${product.slug}`,
      permanent: true,
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Admin-controlled product images come from many supplier domains.
      // We allow http/https here; for untrusted input consider adding a proxy
      // route with a strict allowlist.
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
