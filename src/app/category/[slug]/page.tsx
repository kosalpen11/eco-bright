import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { CatalogPage } from "@/components/catalog/CatalogPage";
import { LEGACY_CATEGORY_SLUGS, type CatalogSearchParams } from "@/lib/catalog-params";
import { buildCatalogHref } from "@/lib/catalog-url";
import { getCachedCategories } from "@/lib/db/cached-products";
import { buildListingMetadata } from "@/lib/listing-metadata";

type Params = Promise<{ slug: string }>;

/** Known, non-empty category for this slug; 404 for anything else, 308 for pre-cleanup slugs. */
const resolveCategory = cache(async (rawSlug: string, query: string) => {
  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug).trim().toLowerCase();
  } catch {
    notFound();
  }
  if (!/^[a-z0-9-]{1,48}$/.test(slug)) notFound();

  const legacy = LEGACY_CATEGORY_SLUGS[slug];
  if (legacy) {
    const params = new URLSearchParams(query);
    params.set("category", legacy);
    permanentRedirect(buildCatalogHref(params));
  }

  const categories = await getCachedCategories();
  const category = categories.find((item) => item.id === slug);
  if (!category) notFound();
  return { id: category.id, label: category.label, labelKm: category.labelKm ?? null };
});

function toQueryString(sp: Awaited<CatalogSearchParams>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }
  return params.toString();
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: CatalogSearchParams;
}): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await resolveCategory(slug, toQueryString(sp));
  return buildListingMetadata(sp, category);
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: CatalogSearchParams;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await resolveCategory(slug, toQueryString(sp));
  return <CatalogPage searchParams={searchParams} category={category.id} />;
}
