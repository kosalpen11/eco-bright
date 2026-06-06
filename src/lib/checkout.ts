import type { CartItem } from "@/types/cart";

export interface CheckoutCustomerInfo {
  phone: string;
  fulfillmentType: "delivery" | "pickup" | "";
  deliveryLocation: string;
  pickupNote: string;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: {
    phone?: string;
    fulfillmentType?: string;
    deliveryLocation?: string;
  };
}

function formatTotal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function getCheckoutTotal(cartItems: CartItem[]) {
  return cartItems.reduce(
    (total, item) => total + (item.optionPrice ?? item.price) * item.qty,
    0,
  );
}

function formatFieldValue(value: string) {
  const normalized = value.trim();
  return normalized || "-";
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+\s]/g, "").trim();
}

function toKhmerNumber(value: number) {
  // convert digits to Khmer numerals for small integer quantities
  const khmerDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) =>
    String.fromCharCode(0x17e0 + Number(d)),
  );

  if (!Number.isInteger(value)) return String(value);
  return String(value)
    .split("")
    .map((ch) => (/[0-9]/.test(ch) ? khmerDigits[Number(ch)] : ch))
    .join("");
}

export function validateCheckout(
  cartItems: CartItem[],
  customerInfo: CheckoutCustomerInfo,
): CheckoutValidationResult {
  const errors: CheckoutValidationResult["errors"] = {};

  if (!cartItems.length) {
    errors.phone = undefined;
  }

  if (!normalizePhone(customerInfo.phone)) {
    errors.phone = "Phone is required";
  }

  if (!customerInfo.fulfillmentType) {
    errors.fulfillmentType = "Choose delivery or pickup";
  }

  if (
    customerInfo.fulfillmentType === "delivery" &&
    !customerInfo.deliveryLocation.trim()
  ) {
    errors.deliveryLocation = "Delivery location is required";
  }

  return {
    isValid: cartItems.length > 0 && Object.keys(errors).length === 0,
    errors,
  };
}

export function formatCheckoutMessage(
  cartItems: CartItem[],
  customerInfo: CheckoutCustomerInfo,
) {
  const lines = cartItems.map((item) => {
    const title = item.variantTitle ? `${item.title} ${item.variantTitle}` : item.title;
    const qtyKh = toKhmerNumber(item.qty);
    const unitPrice = item.optionPrice ?? item.price;
    const lineTotal = unitPrice * item.qty;
    return `${title} ចំនួន ${qtyKh} គ្រឿង @ $${formatTotal(unitPrice)} = $${formatTotal(
      lineTotal,
    )}`;
  });

  const deliveryValue =
    customerInfo.fulfillmentType === "delivery"
      ? formatFieldValue(customerInfo.deliveryLocation)
      : "";

  const pickupValue =
    customerInfo.fulfillmentType === "pickup"
      ? formatFieldValue(customerInfo.pickupNote || "Pickup at shop")
      : "";

  const contactPhone = formatFieldValue(normalizePhone(customerInfo.phone));
  const total = `$${formatTotal(getCheckoutTotal(cartItems))}`;

  // Build message using requested Khmer layout with per-line prices
  const productLines: string[] = cartItems.map((item, idx) => {
    const title = item.variantTitle ? `${item.title} / ${item.variantTitle}` : item.title;
    const qtyKh = item.qty;
    const unitPrice = item.optionPrice ?? item.price;
    const lineTotal = unitPrice * item.qty;

    return [
      `${idx + 1}. ${title}  `,
      `   ចំនួន ${qtyKh} គ្រឿង @ $${formatTotal(unitPrice)} = $${formatTotal(lineTotal)}`,
      "",
    ].join("\n");
  });

  const msg: string[] = [
    "🛒 សំណើបញ្ជាទិញ",
    "━━━━━━━━━━━━━━",
    "ផលិតផល:",
    "",
    ...productLines,
    "━━━━━━━━━━━━━━",
  ];

  if (customerInfo.fulfillmentType === "delivery" && deliveryValue) {
    msg.push(`ទីតាំងដឹកជញ្ជូន៖ ${deliveryValue}  `);
  } else if (customerInfo.fulfillmentType === "pickup" && pickupValue) {
    msg.push(`ទីតាំងទទួល៖ ${pickupValue}  `);
  }

  msg.push(`លេខទូរសព្ទ៖ ${contactPhone}  `);
  msg.push("");
  msg.push(`តម្លៃសរុប៖ ${total}`);
  msg.push("━━━━━━━━━━━━━━");
  msg.push("សួស្តី! ខ្ញុំចាប់អារម្មណ៍ទិញផលិតផលទាំងនេះ។ តើនៅមានទំនិញដែរឬទេ?");

  return msg.join("\n");
}

export function buildTelegramProfileUrl(username: string, message?: string) {
  const normalized = username.trim().replace(/^@/, "");
  const target = normalized || "sonita17";

  if (!message?.trim()) {
    return `https://t.me/${target}`;
  }

  return `https://t.me/${target}?text=${encodeURIComponent(message)}`;
}

export async function copyCheckoutMessage(message: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(message);
    return;
  }

  const el = document.createElement("textarea");
  el.value = message;
  el.setAttribute("readonly", "true");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}
