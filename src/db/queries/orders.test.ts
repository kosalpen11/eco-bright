import test from "node:test";
import assert from "node:assert/strict";
import { createTelegramOrderPayload } from "@/lib/ordering/create-order-payload";
import {
  createOrderRequestSchema,
  deriveItemLineTotal,
  deriveOrderItemCount,
  deriveOrderSubtotal,
} from "@/lib/validation/order";
import { buildTelegramOrderMessage } from "@/lib/telegram-order";

function createPayload() {
  return {
    invoice: {
      invoiceId: "INV-2026-0001",
      shop: "ECO BRIGHT LED & SOLAR",
      currency: "USD" as const,
      createdAtIso: "2026-03-30T12:00:00.000Z",
      items: [
        {
          id: "prd_001",
          title: "Solar Flood Light 200W",
          imageUrl: "https://example.com/flood-light.jpg",
          category: "solar-flood-lights",
          price: 58,
          qty: 2,
          lineTotal: 116,
        },
      ],
      subtotal: 116,
      total: 116,
      telegramUrl: "https://t.me/eco_bright_sale_bot",
      payload: {
        invoiceId: "INV-2026-0001",
        shop: "ECO BRIGHT LED & SOLAR",
        currency: "USD" as const,
        createdAtIso: "2026-03-30T12:00:00.000Z",
        items: [
          {
            id: "prd_001",
            title: "Solar Flood Light 200W",
            price: 58,
            qty: 2,
          },
        ],
        subtotal: 116,
        total: 116,
        telegram: "https://t.me/eco_bright_sale_bot",
      },
    },
    customerName: "  Alice  ",
    customerPhone: "  +85512710410  ",
    note: "  call first  ",
    source: "web" as const,
  };
}

test("createOrderRequestSchema rejects mismatched invoice totals", () => {
  const parsed = createOrderRequestSchema.safeParse({
    ...createPayload(),
    invoice: {
      ...createPayload().invoice,
      total: 115,
    },
  });

  assert.equal(parsed.success, false);
});

test("validation helpers derive authoritative totals", () => {
  const parsed = createOrderRequestSchema.parse(createPayload());

  assert.equal(deriveItemLineTotal(parsed.invoice.items[0]), 116);
  assert.equal(deriveOrderItemCount(parsed.invoice.items), 2);
  assert.equal(deriveOrderSubtotal(parsed.invoice.items), 116);
});

test("telegram payload builder preserves order details for handoff", () => {
  const parsed = createOrderRequestSchema.parse(createPayload());
  const telegramPayload = createTelegramOrderPayload(parsed);
  telegramPayload.orderCode = "ECO-8K4P2";
  telegramPayload.shortOrderId = "ECO-2026-0001";
  const message = buildTelegramOrderMessage(telegramPayload);

  assert.equal(telegramPayload.items[0]?.productId, "prd_001");
  assert.match(message, /Order Code: ECO-8K4P2/);
  assert.match(message, /Order ID: ECO-2026-0001/);
  assert.match(message, /Customer Name: Alice/);
  assert.match(message, /Total: 116.00 USD/);
});
