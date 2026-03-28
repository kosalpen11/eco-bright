import { NextRequest, NextResponse } from "next/server";
import {
  createOrderInputSchema,
  createOrderWithItems,
} from "@/db/queries/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUniqueViolation(error: unknown) {
  return !!(
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid order payload",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const order = await createOrderWithItems(parsed.data);

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      invoiceId: order.invoiceId,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        {
          ok: false,
          message: "An order with this invoice id already exists.",
        },
        { status: 409 },
      );
    }

    console.error("POST /api/orders failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to save order",
      },
      { status: 500 },
    );
  }
}
