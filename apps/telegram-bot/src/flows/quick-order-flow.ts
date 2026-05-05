import { getDeeplinkPayload } from "../../../../src/db/queries/telegram-sessions";
import { startProductPurchase } from "./purchase-flow";

export async function startQuickOrderFromReference(referenceId: string) {
  const payload = await getDeeplinkPayload(referenceId);

  if (!payload) {
    throw new Error("That order link has expired. Please generate a new one.");
  }

  const data = payload.payloadJson as Record<string, unknown>;

  if (payload.payloadType === "product" && typeof data.productId === "string") {
    return startProductPurchase({
      productId: data.productId,
      source: "telegram-deeplink",
      quantity: typeof data.qty === "number" ? data.qty : 1,
    });
  }

  throw new Error("Unsupported quick order payload.");
}
