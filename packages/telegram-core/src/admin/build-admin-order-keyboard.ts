import { getAvailableOrderStatusTransitions } from "../../../order-core/src";
import type { OrderStatus } from "../../../../src/types/order";
import type {
  AdminCallbackAction,
  AdminKeyboardButton,
  AdminKeyboardLayout,
} from "./types";

function makeCallback(action: AdminCallbackAction, orderId: string) {
  return `adm:${action}:${orderId}`;
}

function isKeyboardButton(
  value: AdminKeyboardButton | null,
): value is AdminKeyboardButton {
  return value !== null;
}

export function buildAdminOrderKeyboard(input: {
  orderId: string;
  status: OrderStatus;
}) {
  const allowed = new Set(getAvailableOrderStatusTransitions(input.status));
  const rows: AdminKeyboardLayout = [];

  const rowOne = [
    allowed.has("accepted")
      ? { text: "Accept", callbackData: makeCallback("accept", input.orderId) }
      : null,
    allowed.has("rejected")
      ? { text: "Reject", callbackData: makeCallback("reject", input.orderId) }
      : null,
    allowed.has("needs_clarification")
      ? { text: "Clarify", callbackData: makeCallback("clarify", input.orderId) }
      : null,
  ].filter(isKeyboardButton);

  if (rowOne.length) {
    rows.push(rowOne);
  }

  const rowTwo = [
    allowed.has("processing")
      ? { text: "Processing", callbackData: makeCallback("processing", input.orderId) }
      : null,
    allowed.has("completed")
      ? { text: "Complete", callbackData: makeCallback("complete", input.orderId) }
      : null,
    allowed.has("cancelled")
      ? { text: "Cancel", callbackData: makeCallback("cancel", input.orderId) }
      : null,
  ].filter(isKeyboardButton);

  if (rowTwo.length) {
    rows.push(rowTwo);
  }

  rows.push(
    [
      { text: "Custom Reason", callbackData: makeCallback("reason", input.orderId) },
      { text: "Add Note", callbackData: makeCallback("note", input.orderId) },
      { text: "Refresh", callbackData: makeCallback("refresh", input.orderId) },
    ],
  );

  return rows;
}
