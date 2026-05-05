import type { TelegramStartPayload } from "../../../shared/src";

function compactToken(value: string) {
  return encodeURIComponent(value.trim());
}

export function buildStartPayload(payload: TelegramStartPayload): string {
  switch (payload.type) {
    case "product":
      return `v1.p.${compactToken(payload.productId)}${payload.qty ? `.q${payload.qty}` : ""}`;
    case "cart":
      return `v1.c.${compactToken(payload.referenceId)}`;
    case "reference":
      return `v1.r.${compactToken(payload.referenceId)}`;
    case "link":
      return `v1.l.${compactToken(payload.lookupKey)}`;
    case "order":
      return `v1.o.${compactToken(payload.shortOrderId)}`;
    default:
      throw new Error(`Unknown payload type: ${(payload as any).type}`);
  }
}
