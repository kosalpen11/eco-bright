import type { Metadata } from "next";

import { categoryPath, LISTING_PATH } from "@/lib/catalog-url";
import { parseCatalogSearchParams } from "@/lib/catalog-params";
import {
  CATALOG_DESCRIPTION_KM,
  DEFAULT_OG_IMAGE,
  SITE_ALTERNATE_LOCALE,
  SITE_LOCALE,
  SITE_NAME,
  getCategoryDescription,
  getCategoryTitle,
} from "@/lib/seo";

export const CATALOG_TITLE_KM = "ទំនិញទាំងអស់ — អំពូល LED កង្ហារ ខ្សែភ្លើង សូឡា";

type RawSearchParams = Parameters<typeof parseCatalogSearchParams>[0];

/**
 * Metadata for /products and /category/{slug}.
 * - Plain first page: indexable, canonical to itself.
 * - Page 2+: noindex,follow, canonical to itself (links stay crawlable).
 * - Search / brand / price / sort: noindex,follow, canonical to the unfiltered listing.
 */
export function buildListingMetadata(
  sp: RawSearchParams,
  category: { id: string; label: string; labelKm: string | null } | null,
): Metadata {
  const parsed = parseCatalogSearchParams(sp, { routeCategory: category?.id ?? null });
  const basePath = category ? categoryPath(category.id) : LISTING_PATH;

  let title = category ? getCategoryTitle(category) : CATALOG_TITLE_KM;
  if (parsed.q) title = `ស្វែងរក “${parsed.q}” — ${title}`;
  if (parsed.page > 1) title = `${title} — ទំព័រ ${parsed.page}`;

  const description = category ? getCategoryDescription(category) : CATALOG_DESCRIPTION_KM;
  const canonical = parsed.hasFilters || parsed.page === 1 ? basePath : `${basePath}?page=${parsed.page}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical },
    ...(parsed.isIndexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      alternateLocale: [SITE_ALTERNATE_LOCALE],
      url: canonical,
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}
