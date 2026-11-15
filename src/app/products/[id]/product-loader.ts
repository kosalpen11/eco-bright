import "server-only";

import { cache } from "react";

import { getCachedProductBySlugOrId } from "@/lib/db/cached-products";
import { getPublicProductOrNotFound } from "@/lib/public-products";

/**
 * `key` is the URL segment: the public slug, or a legacy product id from old links.
 * React cache dedupes the lookup between the layout, generateMetadata and the page.
 */
export const getPublicProduct = cache(async (key: string) =>
  getPublicProductOrNotFound(await getCachedProductBySlugOrId(decodeURIComponent(key))),
);
