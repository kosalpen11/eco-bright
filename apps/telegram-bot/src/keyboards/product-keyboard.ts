import { InlineKeyboard } from "grammy";

export function buildProductKeyboard(productId: string) {
  return new InlineKeyboard()
    .text("Add to Cart", `cart:add:${productId}`)
    .text("Order Now", `order:product:${productId}`)
    .row()
    .text("Back", "browse:categories")
    .text("My Cart", "cart:view")
    .row()
    .text("Main Menu", "menu:home");
}

export function buildQuantityKeyboard() {
  return new InlineKeyboard()
    .text("1", "order:qty:1")
    .text("2", "order:qty:2")
    .text("5", "order:qty:5")
    .text("10", "order:qty:10")
    .row()
    .text("Cancel", "order:cancel")
    .text("Main Menu", "menu:home");
}
