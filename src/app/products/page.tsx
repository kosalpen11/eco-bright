import type { Metadata } from "next";

import { CatalogPage } from "@/components/catalog/CatalogPage";
import type { CatalogSearchParams } from "@/lib/catalog-params";
import { buildListingMetadata } from "@/lib/listing-metadata";

export async function generateMetadata({ searchParams }: { searchParams: CatalogSearchParams }): Promise<Metadata> {
  return buildListingMetadata(await searchParams, null);
}

export default async function ProductsPage({ searchParams }: { searchParams: CatalogSearchParams }) {
  return <CatalogPage searchParams={searchParams} />;
}
