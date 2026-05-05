const HUMAN_ORDER_CODE_REGEX = /^ECO-[A-HJ-NP-Z2-9]{5}$/;
const LEGACY_SHORT_ORDER_ID_REGEX = /^ECO-\d{4}-\d{4}$/;

export function normalizeOrderLookupInput(value: string) {
  const raw = value.trim().toUpperCase().replace(/\s+/g, "");

  if (!raw) {
    return null;
  }

  const compact = raw.replace(/-/g, "");

  if (/^[A-HJ-NP-Z2-9]{5}$/.test(compact)) {
    return `ECO-${compact}`;
  }

  if (/^ECO[A-HJ-NP-Z2-9]{5}$/.test(compact)) {
    return `ECO-${compact.slice(3)}`;
  }

  if (/^ECO\d{8}$/.test(compact)) {
    return `ECO-${compact.slice(3, 7)}-${compact.slice(7)}`;
  }

  if (/^ECO-\d{4}-\d{4}$/.test(raw)) {
    return raw;
  }

  return raw;
}

export function isHumanOrderCode(value: string) {
  return HUMAN_ORDER_CODE_REGEX.test(value);
}

export function isLegacyShortOrderId(value: string) {
  return LEGACY_SHORT_ORDER_ID_REGEX.test(value);
}

export function isSupportedOrderLookup(value: string) {
  return isHumanOrderCode(value) || isLegacyShortOrderId(value);
}

export function getOrderLookupExample() {
  return "ECO-8K4P2";
}
