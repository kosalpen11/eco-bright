import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "EcoBright Product Catalog",
  description:
    "Browse EcoBright products with category filtering, search, sorting, and price range filtering.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return <CatalogPage searchParams={searchParams} />;
}
