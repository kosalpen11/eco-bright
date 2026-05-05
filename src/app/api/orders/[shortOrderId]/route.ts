import { getOrderWithItemsByLookup } from "@/db/queries/orders";
import { isOrderingEnabled } from "@/lib/feature-flags";

/**
 * GET /api/orders/[shortOrderId]
 * 
 * Fetch persisted order by short order id or order code for bot restoration.
 * Returns full order with items for modification UI.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortOrderId: string }> }
) {
  if (!isOrderingEnabled()) {
    return Response.json(
      { ok: false, message: "Ordering is currently disabled." },
      { status: 404 }
    );
  }

  try {
    const { shortOrderId } = await params;

    if (!shortOrderId) {
      return Response.json({ error: "shortOrderId is required" }, { status: 400 });
    }

    const result = await getOrderWithItemsByLookup(shortOrderId);

    if (!result) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    const { order, items } = result;

    return Response.json({
      id: order.id,
      shop: order.shop,
      shortOrderId: order.shortOrderId,
      orderCode: order.orderCode,
      invoiceId: order.invoiceId,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      fulfillmentMethod: order.fulfillmentMethod,
      note: order.note,
      subtotal: order.subtotal,
      total: order.total,
      currency: order.currency,
      source: order.source,
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        title: item.title,
        price: item.price,
        qty: item.qty,
        lineTotal: item.lineTotal,
        imageUrl: item.imageUrl,
        category: item.category,
      })),
    });
  } catch (error) {
    console.error("[GET /api/orders/:shortOrderId]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
