import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { parseCatalogSearchParams } from "@/lib/catalog-params";
import { getCachedCatalogListing } from "@/lib/db/cached-products";
import { getActiveProducts, mapProductToPublicProduct } from "@/lib/public-products";

export const runtime = "nodejs";

const querySchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  min: z.string().max(20).optional(),
  max: z.string().max(20).optional(),
  sort: z.string().max(20).optional(),
  page: z.string().max(6).optional(),
});

/**
 * One page of the catalog listing as public products — used by the mobile infinite scroll.
 * Same filters and page size as /products, so page N here is page N there.
 */
export async function GET(request: NextRequest) {
  const parsedQuery = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsedQuery.success) {
    return NextResponse.json({ ok: false, message: "Invalid query" }, { status: 400 });
  }

  const { brand, q, sort, page, minPrice, maxPrice, canonicalParams } = parseCatalogSearchParams(parsedQuery.data);

  try {
    const listing = await getCachedCatalogListing({
      brand,
      category: canonicalParams.category,
      q,
      sort,
      page,
      minPrice,
      maxPrice,
    });
    const products = getActiveProducts(listing.products).map(mapProductToPublicProduct);

    return NextResponse.json({
      ok: true,
      products,
      page: listing.page,
      pageSize: listing.pageSize,
      total: listing.total,
      hasMore: listing.page * listing.pageSize < listing.total,
    });
  } catch (error) {
    console.error("GET /api/catalog failed", error);
    return NextResponse.json({ ok: false, message: "Failed to load products" }, { status: 500 });
  }
}
