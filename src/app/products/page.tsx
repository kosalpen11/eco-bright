import type { Metadata } from "next";

import { CatalogPage } from "@/components/catalog/CatalogPage";
import {
  CATALOG_DESCRIPTION_KM,
  DEFAULT_OG_IMAGE,
  SITE_ALTERNATE_LOCALE,
  SITE_LOCALE,
  SITE_NAME,
} from "@/lib/seo";

const TITLE = "ទំនិញទាំងអស់ — អំពូល LED កង្ហារ ខ្សែភ្លើង សូឡា";

export const metadata: Metadata = {
  title: TITLE,
  description: CATALOG_DESCRIPTION_KM,
  alternates: { canonical: "/products" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    alternateLocale: [SITE_ALTERNATE_LOCALE],
    url: "/products",
    title: `${TITLE} | ${SITE_NAME}`,
    description: CATALOG_DESCRIPTION_KM,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ${SITE_NAME}`,
    description: CATALOG_DESCRIPTION_KM,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return <CatalogPage searchParams={searchParams} />;
}
