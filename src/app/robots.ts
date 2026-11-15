import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Search, price and sort URLs are blocked from crawling (they only re-order the same products).
 * Pagination (?page=) and category paths stay crawlable; those pages carry their own
 * noindex,follow / canonical tags (lib/listing-metadata.ts).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cart", "/feeds/skipped", "/*?*q=", "/*?*sort=", "/*?*min=", "/*?*max="],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
