import type { TelegramStartPayload } from "../../../shared/src";

export function parseStartPayload(rawPayload: string): TelegramStartPayload | null {
  const payload = rawPayload.trim();

  if (!payload.startsWith("v1.")) {
    return null;
  }

  const [, typeToken, ...rest] = payload.split(".");
  const content = rest.join(".");

  if (typeToken === "p") {
    const [productToken, qtyToken] = content.split(".q");
    return {
      version: 1,
      type: "product",
      productId: decodeURIComponent(productToken),
      ...(qtyToken ? { qty: Number(qtyToken) } : {}),
    };
  }

  if (typeToken === "c") {
    return {
      version: 1,
      type: "cart",
      referenceId: decodeURIComponent(content),
    };
  }

  if (typeToken === "r") {
    return {
      version: 1,
      type: "reference",
      referenceId: decodeURIComponent(content),
    };
  }

  if (typeToken === "l") {
    return {
      version: 1,
      type: "link",
      lookupKey: decodeURIComponent(content),
    };
  }

  if (typeToken === "o") {
    return {
      version: 1,
      type: "order",
      shortOrderId: decodeURIComponent(content),
    };
  }

  return null;
}
