import type { MetadataRoute } from "next";

import { getSitemapProducts } from "@/lib/db/products";
import { SITE_URL } from "@/lib/seo";

// Regenerate at most hourly so new products show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const products = await getSitemapProducts();

    return [
      ...staticEntries,
      ...products.map((product) => ({
        url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
        lastModified: product.updatedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    // Never fail the build or the request because the DB is unreachable.
    console.error("[sitemap] failed to load products", error);
    return staticEntries;
  }
}
