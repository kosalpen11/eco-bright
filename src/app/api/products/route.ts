import { NextResponse } from "next/server";
import { getStorefrontProducts } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getStorefrontProducts();

    return NextResponse.json({
      ok: true,
      count: result.products.length,
      products: result.products,
      source: result.isFallback ? "fallback" : "neon",
      message: result.catalogError,
    });
  } catch (error) {
    console.error("GET /api/products failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to load products",
      },
      { status: 500 },
    );
  }
}
