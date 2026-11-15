import type { MetadataRoute } from "next";

import { categoryPath } from "@/lib/catalog-url";
import { getSitemapProducts } from "@/lib/db/products";
import { SITE_URL } from "@/lib/seo";

// Regenerate at most hourly so new products show up without a redeploy.
export const revalidate = 3600;

function latest(dates: Array<Date | null>, fallback: Date) {
  const times = dates.filter((date): date is Date => date !== null).map((date) => date.getTime());
  return times.length ? new Date(Math.max(...times)) : fallback;
}

/** /products (home), every non-empty /category/{slug}, every active product. "/" only redirects. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const home = (lastModified: Date): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}/products`,
    lastModified,
    changeFrequency: "daily",
    priority: 1,
  });

  try {
    const products = await getSitemapProducts();

    const byCategory = new Map<string, Array<Date | null>>();
    for (const product of products) {
      if (!product.category) continue;
      byCategory.set(product.category, [...(byCategory.get(product.category) ?? []), product.updatedAt]);
    }

    return [
      home(latest(products.map((product) => product.updatedAt), now)),
      ...[...byCategory.entries()].map(([category, dates]) => ({
        url: `${SITE_URL}${categoryPath(category)}`,
        lastModified: latest(dates, now),
        changeFrequency: "daily" as const,
        priority: 0.9,
      })),
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
    return [home(now)];
  }
}
