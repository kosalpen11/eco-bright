import type { TelegramOrderMessageInput } from "@/lib/telegram-order/types";

function normalizeTelegramMessage(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function formatTelegramCurrency(value: number, currency: string) {
  return `${value.toFixed(2)} ${currency}`;
}

function formatFulfillmentMethod(value?: "pickup" | "delivery" | null) {
  if (value === "pickup") {
    return "Pickup";
  }

  if (value === "delivery") {
    return "Delivery";
  }

  return null;
}

export function buildTelegramOrderMessage(input: TelegramOrderMessageInput) {
  const actualLines: string[] = [];

  actualLines.push(`${input.shop}`);

  if (input.orderCode) {
    actualLines.push(`Order Code: ${input.orderCode}`);
  }

  if (input.shortOrderId) {
    actualLines.push(`Order ID: ${input.shortOrderId}`);
  }

  actualLines.push(`Invoice ID: ${input.invoiceId}`);
  actualLines.push("");
  actualLines.push("Items:");

  input.items.forEach((item, index) => {
    actualLines.push(`${index + 1}. ${item.title}`);
    actualLines.push(`   Qty: ${item.qty}`);
    actualLines.push(`   Price: ${formatTelegramCurrency(item.price, input.currency)}`);
    actualLines.push(`   Total: ${formatTelegramCurrency(item.lineTotal, input.currency)}`);
    actualLines.push("");
  });

  const fulfillment = formatFulfillmentMethod(input.fulfillmentMethod);
  if (fulfillment) {
    actualLines.push(`Fulfillment: ${fulfillment}`);
  }

  if (input.customerPhone) {
    actualLines.push(`Customer Phone: ${input.customerPhone}`);
  }

  if (input.customerName) {
    actualLines.push(`Customer Name: ${input.customerName}`);
  }

  if (input.note) {
    actualLines.push(`Note: ${input.note}`);
  }

  actualLines.push("");
  actualLines.push(`Subtotal: ${formatTelegramCurrency(input.subtotal, input.currency)}`);
  actualLines.push(`Total: ${formatTelegramCurrency(input.total, input.currency)}`);

  return normalizeTelegramMessage(actualLines.join("\n"));
}
