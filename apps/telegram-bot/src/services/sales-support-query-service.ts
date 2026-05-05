import { getSharedRuntimeConfig } from "../../../../packages/config/src";
import {
  getOrderWithItemsById,
  searchOrdersForSalesSupport,
} from "../../../../src/db/queries/orders";

function formatOrderStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatFulfillmentMethod(value: "pickup" | "delivery" | null) {
  if (value === "pickup") {
    return "Pickup";
  }

  if (value === "delivery") {
    return "Delivery";
  }

  return "Not set";
}

export class SalesSupportQueryService {
  async lookup(query: string, limit = 6) {
    return searchOrdersForSalesSupport(query, limit);
  }

  async buildOrderSupportContext(orderId: string) {
    const result = await getOrderWithItemsById(orderId);

    if (!result) {
      return null;
    }

    const config = getSharedRuntimeConfig();
    const orderLabel = result.order.orderCode ?? result.order.shortOrderId ?? result.order.id;

    return {
      order: result,
      message: [
        `Sales handoff for ${config.NEXT_PUBLIC_SHOP_NAME}`,
        `Order ID: ${orderLabel}`,
        `Invoice ID: ${result.order.invoiceId}`,
        `Status: ${formatOrderStatus(result.order.status)}`,
        `Fulfillment: ${formatFulfillmentMethod(result.order.fulfillmentMethod)}`,
        result.order.customerPhone ? `Phone: ${result.order.customerPhone}` : null,
        `Total: ${result.order.total.toFixed(2)} ${result.order.currency}`,
        "",
        "Open the sales chat and mention the Order ID so the team can continue from the saved Neon order.",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
}
