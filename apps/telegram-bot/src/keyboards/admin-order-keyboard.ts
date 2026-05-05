import { InlineKeyboard } from "grammy";
import type { AdminKeyboardLayout } from "../../../../packages/telegram-core/src";

export function buildAdminInlineKeyboard(layout: AdminKeyboardLayout) {
  const keyboard = new InlineKeyboard();

  layout.forEach((row, rowIndex) => {
    row.forEach((button, buttonIndex) => {
      keyboard.text(button.text, button.callbackData);

      if (buttonIndex < row.length - 1) {
        return;
      }

      if (rowIndex < layout.length - 1) {
        keyboard.row();
      }
    });
  });

  return keyboard;
}
