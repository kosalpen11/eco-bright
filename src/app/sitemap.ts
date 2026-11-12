import type { MetadataRoute } from "next";

import { getBrands, getSitemapProducts } from "@/lib/db/products";
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
    const [products, brands] = await Promise.all([getSitemapProducts(), getBrands()]);

    return [
      ...staticEntries,
      ...brands
        .filter((brand) => /^[a-z0-9-]{1,32}$/.test(brand.id)) // same rule as catalog/[brand]
        .map((brand) => ({
          url: `${SITE_URL}/catalog/${brand.id}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ...products.map((product) => ({
        url: `${SITE_URL}/products/${encodeURIComponent(product.id)}`,
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
