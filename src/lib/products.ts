import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { products as fallbackProducts } from "@/data/products";
import { getActiveProducts } from "@/db/queries/products";
import type { Product } from "@/types/product";

export interface StorefrontCatalogResult {
  products: Product[];
  catalogError: string | null;
  isFallback: boolean;
}

function getCatalogFallbackMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Using the local fallback catalog because the Neon catalog is currently unavailable.";
  }

  if (error.message.includes("Missing required env: DATABASE_URL")) {
    return "Using the local fallback catalog because DATABASE_URL is not configured.";
  }

  return "Using the local fallback catalog because the Neon catalog is currently unreachable.";
}

export async function getStorefrontProducts(): Promise<StorefrontCatalogResult> {
  noStore();

  try {
    return {
      products: await getActiveProducts(),
      catalogError: null,
      isFallback: false,
    };
  } catch (error) {
    console.error("Failed to load storefront products", error);

    return {
      products: fallbackProducts,
      catalogError: getCatalogFallbackMessage(error),
      isFallback: true,
    };
  }
}
