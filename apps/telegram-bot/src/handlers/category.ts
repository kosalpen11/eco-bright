import { InlineKeyboard, type Bot } from "grammy";
import { getCatalogCategories, getCatalogProducts } from "../../../../packages/catalog-core/src";

function buildCategoriesKeyboard(categories: Awaited<ReturnType<typeof getCatalogCategories>>) {
  const keyboard = new InlineKeyboard();

  for (const category of categories.slice(0, 12)) {
    keyboard.text(`${category.label} (${category.count})`, `category:${category.id}`).row();
  }

  return keyboard.text("Contact Support", "support").row().text("Main Menu", "menu:home");
}

function buildCategoryProductsKeyboard(categoryId: string, products: Awaited<ReturnType<typeof getCatalogProducts>>) {
  const keyboard = new InlineKeyboard();

  for (const product of products.filter((item) => item.category === categoryId).slice(0, 10)) {
    keyboard.text(product.title, `preview:${product.id}`).row();
  }

  return keyboard.text("Back", "browse:categories").text("Main Menu", "menu:home");
}

export function registerCategoryHandlers(bot: Bot) {
  bot.callbackQuery("browse:categories", async (ctx) => {
    const categories = await getCatalogCategories();
    await ctx.answerCallbackQuery();
    await ctx.reply("Choose a category.", {
      reply_markup: buildCategoriesKeyboard(categories),
    });
  });

  bot.callbackQuery(/^category:(.+)$/i, async (ctx) => {
    const categoryId = ctx.match[1];
    const products = await getCatalogProducts();
    await ctx.answerCallbackQuery();
    await ctx.reply("Choose a product:", {
      reply_markup: buildCategoryProductsKeyboard(categoryId, products),
    });
  });
}
