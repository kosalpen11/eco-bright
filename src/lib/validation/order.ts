import { z } from "zod";
import { ORDER_SOURCES, ORDER_STATUSES, type CreateOrderInput } from "@/types/order";

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function isSameMoney(left: number, right: number) {
  return Math.abs(roundCurrency(left) - roundCurrency(right)) < 0.005;
}

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  },
  z.string().min(1).optional(),
);

const optionalNullableUrl = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value ?? null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  },
  z.string().url().nullable().optional(),
);

// Phone format validation: accepts international formats
// Examples: +855 12 345 678, +1234567890, 012345678
// Must contain at least one digit, optional + prefix, min 6 digits total
const phoneRegex = /^(\+\d{1,3}[\s.-]?)?(\d[\s.-]*){5,15}\d$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(phoneRegex, "Please enter a valid phone number");

export const orderStatusSchema = z.enum(ORDER_STATUSES);
export const orderSourceSchema = z.enum(ORDER_SOURCES);

export function deriveItemLineTotal(item: {
  price: number;
  qty: number;
}) {
  return roundCurrency(item.price * item.qty);
}

export function deriveOrderSubtotal(
  items: Array<{
    price: number;
    qty: number;
  }>,
) {
  return roundCurrency(items.reduce((sum, item) => sum + deriveItemLineTotal(item), 0));
}

export function deriveOrderItemCount(items: Array<{ qty: number }>) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export const invoiceItemSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    titleKm: optionalTrimmedString,
    imageUrl: optionalNullableUrl,
    category: optionalTrimmedString,
    price: z.number().finite().positive(),
    qty: z.int().positive(),
    lineTotal: z.number().finite().nonnegative(),
  })
  .strict()
  .superRefine((item, context) => {
    const expectedLineTotal = deriveItemLineTotal(item);

    if (!isSameMoney(item.lineTotal, expectedLineTotal)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `lineTotal must equal price * qty (${expectedLineTotal.toFixed(2)})`,
        path: ["lineTotal"],
      });
    }
  });

export const invoiceSchema = z
  .object({
    invoiceId: z.string().trim().min(1),
    shop: z.string().trim().min(1),
    currency: z.literal("USD"),
    createdAtIso: z.string().datetime(),
    items: z.array(invoiceItemSchema).min(1),
    subtotal: z.number().finite().nonnegative(),
    total: z.number().finite().nonnegative(),
    telegramUrl: z.string().url(),
    payload: z
      .object({
        invoiceId: z.string().trim().min(1),
        shop: z.string().trim().min(1),
        currency: z.literal("USD"),
        createdAtIso: z.string().datetime(),
        items: z
          .array(
            z
              .object({
                id: z.string().trim().min(1),
                title: z.string().trim().min(1),
                price: z.number().finite().positive(),
                qty: z.int().positive(),
              })
              .strict(),
          )
          .min(1),
        subtotal: z.number().finite().nonnegative(),
        total: z.number().finite().nonnegative(),
        telegram: z.string().url(),
      })
      .strict(),
  })
  .strict()
  .superRefine((invoice, context) => {
    const computedSubtotal = deriveOrderSubtotal(invoice.items);

    if (!isSameMoney(invoice.subtotal, computedSubtotal)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `subtotal must equal the sum of line totals (${computedSubtotal.toFixed(2)})`,
        path: ["subtotal"],
      });
    }

    if (!isSameMoney(invoice.total, computedSubtotal)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `total must equal subtotal (${computedSubtotal.toFixed(2)})`,
        path: ["total"],
      });
    }
  });

export const createOrderRequestSchema = z
  .object({
    invoice: invoiceSchema,
    customerName: optionalTrimmedString,
    customerPhone: phoneSchema,
    note: optionalTrimmedString,
    fulfillmentMethod: z.enum(["pickup", "delivery"]).optional(),
    source: orderSourceSchema.default("web"),
  })
  .strict();

export type ValidatedCreateOrderInput = z.infer<typeof createOrderRequestSchema>;

export function normalizeCreateOrderInput(
  input: ValidatedCreateOrderInput,
): CreateOrderInput {
  return {
    invoice: input.invoice,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    note: input.note,
    fulfillmentMethod: input.fulfillmentMethod,
    source: input.source,
  };
}
