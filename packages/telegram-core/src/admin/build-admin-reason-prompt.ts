import type { AdminReasonPromptInput } from "./types";

const MODE_LABELS: Record<AdminReasonPromptInput["mode"], string> = {
  reject: "rejection reason",
  clarify: "clarification request",
  note: "admin note",
};

export function buildAdminReasonPrompt(input: AdminReasonPromptInput) {
  return [
    `Order ${input.invoiceId}`,
    `Send the ${MODE_LABELS[input.mode]} now.`,
    "Your next text message will be saved to this order.",
  ].join("\n");
}
