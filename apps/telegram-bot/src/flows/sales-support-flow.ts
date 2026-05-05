import type {
  TelegramSalesPendingAction,
  TelegramSessionLanguage,
} from "../../../../packages/shared/src";

function orderLabel(orderCode?: string | null, shortOrderId?: string | null) {
  return orderCode ?? shortOrderId ?? "your order";
}

export function buildSalesFallbackMessage(language: TelegramSessionLanguage = "en") {
  if (language === "kh") {
    return "សូមស្វាគមន៍មកកាន់ ECO BRIGHT Sales Support។";
  }

  return "Welcome to ECO BRIGHT Sales Support.";
}

export function buildSalesPromptForAction(
  action: TelegramSalesPendingAction,
  language: TelegramSessionLanguage,
  input: {
    orderCode?: string | null;
    shortOrderId?: string | null;
  },
) {
  const label = orderLabel(input.orderCode, input.shortOrderId);

  if (language === "kh") {
    switch (action) {
      case "confirm_details":
        return `ព័ត៌មានលម្អិតនៃការបញ្ជាទិញ ${label} រួចរាល់ហើយ។ ផ្នែកលក់នឹងប្រើការបញ្ជាទិញដែលបានរក្សាទុកនេះ។`;
      case "ask_stock":
        return `សូមផ្ញើសំណួរអំពីស្តុកសម្រាប់ ${label}។`;
      case "change_fulfillment":
        return `សូមផ្ញើការផ្លាស់ប្តូរដែលអ្នកចង់បានសម្រាប់ ${label}។ ឧទាហរណ៍៖ ប្តូរទៅមកយកដោយខ្លួនឯង។`;
      case "add_note":
        return `សូមផ្ញើចំណាំដែលអ្នកចង់បន្ថែមទៅ ${label}។`;
      case "ask_product":
        return "សូមផ្ញើសំណួរអំពីផលិតផលរបស់អ្នក។";
    }
  }

  switch (action) {
    case "confirm_details":
      return `Order ${label} is already saved in Neon. Sales will continue from this saved order.`;
    case "ask_stock":
      return `Send your stock question for ${label}.`;
    case "change_fulfillment":
      return `Send the change you need for ${label}. Example: change to pickup.`;
    case "add_note":
      return `Send the note you want to add to ${label}.`;
    case "ask_product":
      return "Send your product question.";
  }
}

export function buildSalesAcknowledgement(
  action: TelegramSalesPendingAction,
  language: TelegramSessionLanguage,
  input: {
    orderCode?: string | null;
    shortOrderId?: string | null;
  },
) {
  const label = orderLabel(input.orderCode, input.shortOrderId);

  if (language === "kh") {
    switch (action) {
      case "ask_stock":
        return `យើងបានរក្សាទុកសំណួរអំពីស្តុកសម្រាប់ ${label} ហើយ។ ផ្នែកលក់នឹងបន្តជាមួយអ្នក។`;
      case "change_fulfillment":
        return `យើងបានរក្សាទុកសំណើប្តូរការទទួលសម្រាប់ ${label} ហើយ។ ផ្នែកលក់នឹងបញ្ជាក់ជាមួយអ្នក។`;
      case "add_note":
        return `យើងបានរក្សាទុកចំណាំសម្រាប់ ${label} ហើយ។ ផ្នែកលក់នឹងបន្តពីការបញ្ជាទិញនេះ។`;
      case "ask_product":
        return "យើងបានទទួលសំណួររបស់អ្នកហើយ។ ផ្នែកលក់នឹងឆ្លើយតបឆាប់ៗនេះ។";
      case "confirm_details":
        return `ព័ត៌មានលម្អិតសម្រាប់ ${label} ត្រូវបានបញ្ជាក់រួចហើយ។`;
    }
  }

  switch (action) {
    case "ask_stock":
      return `Your stock question for ${label} has been linked to the saved order. Sales will continue with you shortly.`;
    case "change_fulfillment":
      return `Your delivery or pickup change for ${label} has been saved. Sales will confirm it with you shortly.`;
    case "add_note":
      return `Your note for ${label} has been saved for sales follow-up.`;
    case "ask_product":
      return "Your product question has been received. Sales will continue with you shortly.";
    case "confirm_details":
      return `Order ${label} details are confirmed.`;
  }
}
