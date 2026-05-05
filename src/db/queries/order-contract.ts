export {
  createOrderRequestSchema as createOrderInputSchema,
  deriveItemLineTotal,
  deriveOrderItemCount,
  deriveOrderSubtotal,
  normalizeCreateOrderInput,
  type ValidatedCreateOrderInput as CreateOrderWithItemsInput,
} from "@/lib/validation/order";
