import "server-only";

import { getCachedFeedProducts } from "@/lib/db/cached-products";
import { mapProductToPublicProduct, type PublicProduct } from "@/lib/public-products";
import { SITE_NAME, SITE_URL, CATALOG_DESCRIPTION_KM } from "@/lib/seo";
import {
  buildMerchantFeedItem,
  getFeedSkipReasons,
  getFeedWarnings,
  productName,
  productPath,
  type MerchantFeedItem,
} from "@/lib/structured-data";

export async function loadFeedProducts(): Promise<PublicProduct[]> {
  const products = await getCachedFeedProducts();
  return products.filter((product) => product.isActive).map(mapProductToPublicProduct);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Strip control characters XML 1.0 does not allow.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function tag(name: string, value: string | null | undefined) {
  return value ? `      <${name}>${escapeXml(value)}</${name}>\n` : "";
}

function itemXml(item: MerchantFeedItem) {
  return (
    "    <item>\n" +
    tag("g:id", item.id) +
    tag("g:title", item.title) +
    tag("g:description", item.description) +
    tag("g:link", item.link) +
    tag("g:image_link", item.imageLink) +
    item.additionalImageLinks.map((link) => tag("g:additional_image_link", link)).join("") +
    tag("g:availability", item.availability) +
    tag("g:price", item.price) +
    tag("g:brand", item.brand) +
    tag("g:condition", item.condition) +
    tag("g:product_type", item.productType) +
    tag("g:identifier_exists", item.identifierExists) +
    "    </item>\n"
  );
}

/** RSS 2.0 feed with the Google `g:` namespace. */
export function renderMerchantFeed(products: PublicProduct[]) {
  const items = products
    .map(buildMerchantFeedItem)
    .filter((item): item is MerchantFeedItem => item !== null);

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    "  <channel>\n" +
    `    <title>${escapeXml(SITE_NAME)}</title>\n` +
    `    <link>${escapeXml(`${SITE_URL}/products`)}</link>\n` +
    `    <description>${escapeXml(CATALOG_DESCRIPTION_KM)}</description>\n` +
    items.map(itemXml).join("") +
    "  </channel>\n" +
    "</rss>\n"
  );
}

export function buildSkippedReport(products: PublicProduct[]) {
  const rows = products.map((product) => ({
    id: product.id,
    title: productName(product),
    url: `${SITE_URL}${productPath(product)}`,
    skipReasons: getFeedSkipReasons(product),
    warnings: getFeedWarnings(product),
  }));
  const skipped = rows.filter((row) => row.skipReasons.length > 0);
  const warned = rows.filter((row) => row.skipReasons.length === 0 && row.warnings.length > 0);

  return {
    generatedAt: new Date().toISOString(),
    totalActive: rows.length,
    inFeed: rows.length - skipped.length,
    skippedCount: skipped.length,
    skipped,
    warningCount: warned.length,
    warnings: warned,
  };
}
