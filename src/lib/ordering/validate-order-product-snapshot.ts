import { getProductsByIds } from "@/db/queries/products";
import {
  deriveItemLineTotal,
  deriveOrderSubtotal,
  roundCurrency,
  type ValidatedCreateOrderInput,
} from "@/lib/validation/order";
import type { InvoiceItem } from "@/types/invoice";

export const ORDER_PRODUCT_SNAPSHOT_ISSUE_CODES = [
  "product_not_found",
  "product_inactive",
  "product_out_of_stock",
  "price_changed",
] as const;

export type OrderProductSnapshotIssueCode =
  (typeof ORDER_PRODUCT_SNAPSHOT_ISSUE_CODES)[number];

export interface OrderProductSnapshotIssue {
  code: OrderProductSnapshotIssueCode;
  productId: string;
  title: string;
  requestedPrice: number;
  currentPrice?: number;
}

export interface OrderProductSnapshotValidationSuccess {
  ok: true;
  input: ValidatedCreateOrderInput;
}

export interface OrderProductSnapshotValidationFailure {
  ok: false;
  message: string;
  issues: OrderProductSnapshotIssue[];
}

export type OrderProductSnapshotValidationResult =
  | OrderProductSnapshotValidationSuccess
  | OrderProductSnapshotValidationFailure;

function formatIssue(issue: OrderProductSnapshotIssue) {
  switch (issue.code) {
    case "product_not_found":
      return `${issue.title} is no longer available.`;
    case "product_inactive":
      return `${issue.title} is not available right now.`;
    case "product_out_of_stock":
      return `${issue.title} is out of stock right now.`;
    case "price_changed":
      return `${issue.title} changed from ${issue.requestedPrice.toFixed(2)} USD to ${issue.currentPrice?.toFixed(2) ?? "0.00"} USD.`;
    default:
      return `${issue.title} could not be validated.`;
  }
}

function buildValidationMessage(issues: OrderProductSnapshotIssue[]) {
  const prefix =
    "Your cart changed before checkout. Review the latest price or stock and place the order again.";

  return [prefix, ...issues.map((issue) => `- ${formatIssue(issue)}`)].join(" ");
}

export async function validateOrderProductSnapshot(
  input: ValidatedCreateOrderInput,
): Promise<OrderProductSnapshotValidationResult> {
  const products = await getProductsByIds(input.invoice.items.map((item) => item.id));
  const productMap = new Map(products.map((product) => [product.id, product]));
  const issues: OrderProductSnapshotIssue[] = [];
  const canonicalItems: InvoiceItem[] = [];

  for (const item of input.invoice.items) {
    const product = productMap.get(item.id);

    if (!product) {
      issues.push({
        code: "product_not_found",
        productId: item.id,
        title: item.title,
        requestedPrice: item.price,
      });
      continue;
    }

    if (!product.isActive) {
      issues.push({
        code: "product_inactive",
        productId: item.id,
        title: product.title,
        requestedPrice: item.price,
        currentPrice: product.price,
      });
      continue;
    }

    if (!product.inStock) {
      issues.push({
        code: "product_out_of_stock",
        productId: item.id,
        title: product.title,
        requestedPrice: item.price,
        currentPrice: product.price,
      });
      continue;
    }

    if (roundCurrency(item.price) !== roundCurrency(product.price)) {
      issues.push({
        code: "price_changed",
        productId: item.id,
        title: product.title,
        requestedPrice: item.price,
        currentPrice: product.price,
      });
      continue;
    }

    canonicalItems.push({
      id: product.id,
      title: product.title,
      titleKm: product.titleKm,
      imageUrl: product.imageUrl,
      category: product.category,
      price: product.price,
      qty: item.qty,
      lineTotal: deriveItemLineTotal({
        price: product.price,
        qty: item.qty,
      }),
    });
  }

  if (issues.length) {
    return {
      ok: false,
      message: buildValidationMessage(issues),
      issues,
    };
  }

  const subtotal = deriveOrderSubtotal(canonicalItems);

  return {
    ok: true,
    input: {
      ...input,
      invoice: {
        ...input.invoice,
        items: canonicalItems,
        subtotal,
        total: subtotal,
        payload: {
          ...input.invoice.payload,
          items: canonicalItems.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            qty: item.qty,
          })),
          subtotal,
          total: subtotal,
        },
      },
    },
  };
}
