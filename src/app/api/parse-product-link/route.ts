import { NextRequest, NextResponse } from "next/server";
import { getProductByLookupKey } from "@/db/queries/products";
import {
  parseProductLink,
  parseProductLinkRequestSchema,
} from "@/lib/ordering/parse-product-link";
import { isOrderingEnabled } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isOrderingEnabled()) {
    return NextResponse.json(
      { ok: false, message: "Ordering is currently disabled." },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = parseProductLinkRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid product link payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const productLink = parseProductLink(parsed.data.url);
    const product = await getProductByLookupKey(productLink.lookupKey);

    if (!product) {
      return NextResponse.json(
        {
          ok: false,
          message: "No matching product found for this link.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      product,
      lookupKey: productLink.lookupKey,
      lookupType: productLink.lookupType,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Failed to parse product link",
      },
      { status: 400 },
    );
  }
}
