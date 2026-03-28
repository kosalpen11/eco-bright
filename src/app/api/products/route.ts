import { NextResponse } from "next/server";
import { getActiveProducts } from "@/db/queries/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getActiveProducts();

    return NextResponse.json({
      ok: true,
      count: products.length,
      products,
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
