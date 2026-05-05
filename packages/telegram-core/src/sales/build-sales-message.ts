export interface SalesOrderSummaryContext {
  orderCode?: string | null;
  invoiceId: string;
  total: number;
  currency: string;
  fulfillmentMethod?: "pickup" | "delivery" | null;
  shop: string;
}

export function buildSalesOrderFoundMessage(order: SalesOrderSummaryContext): string {
  const codeDisplay = order.orderCode ? `Order ID: ${order.orderCode}` : `Invoice ID: ${order.invoiceId}`;
  const fulfillment = order.fulfillmentMethod === "pickup" ? "Pickup" : order.fulfillmentMethod === "delivery" ? "Delivery" : "Not specified";

  return [
    `Hello, we found your order from ${order.shop}.`,
    "",
    codeDisplay,
    `Total: ${order.total.toFixed(2)} ${order.currency}`,
    `Fulfillment: ${fulfillment}`,
    "",
    "Please review your order details. Our sales team can help you continue from here.",
  ].join("\n");
}

export function buildSalesConfirmationMessage(): string {
  return "Everything looks good. Shall we confirm this order for the team to process?";
}

export function buildSalesPendingMessage(): string {
  return "Your order is saved and waiting for confirmation. Our sales team will contact you shortly.";
}

export function buildAskOrderIdMessage(): string {
  return "Please paste your short order ID.\nExample: ECO-8K4P2";
}

export function buildInvalidOrderMessage(): string {
  return "We could not find that order. Please check the ID and try again, or paste the full order text.";
}

export function buildContactHumanMessage(): string {
  return "Our sales team will continue with you shortly in this chat.";
}

export function buildSalesWelcomeMessage(): string {
  return "Welcome to ECO BRIGHT Sales Support.\nHow can we help you today?";
}
