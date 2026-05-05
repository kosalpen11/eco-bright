import { notFound } from "next/navigation";

import { CatalogPage } from "@/components/catalog/CatalogPage";

type Params = Promise<{ brand: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function normalizeBrand(value: string) {
  return value.trim().toLowerCase();
}

function isSafeBrand(value: string) {
  // Keep it simple: slug-like only. Prevents weird values and keeps LIKE performant.
  return /^[a-z0-9-]{1,32}$/.test(value);
}

export default async function BrandCatalogPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { brand } = await params;
  const normalized = normalizeBrand(brand ?? "");

  if (!normalized || !isSafeBrand(normalized)) {
    notFound();
  }

  return <CatalogPage searchParams={searchParams} brand={normalized} />;
}
