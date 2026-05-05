import { PRODUCT_CATEGORIES, type ProductCategory } from "@/types/product";

const categoryLookup = new Map(
  PRODUCT_CATEGORIES.map((category) => [category.value, category]),
);

const sourceCategoryRemaps = {
  accessories: "drivers-accessories",
  batteries: "solar-systems",
  bulbs: "led-bulbs",
  "batten-lights": "linear-lights",
  "emergency-lights": "ceiling-lights",
  "solar-lights": "solar-flood-lights",
  "solar-panels": "solar-systems",
  "street-lights": "solar-street-lights",
  "solar-high-bay": "high-bay-lights",
} as const satisfies Record<string, ProductCategory>;

const defaultCategoryLabels = {
  "led-bulbs": "LED Bulb",
  "led-tubes": "LED Tube",
  "panel-lights": "Panel Light",
  downlights: "Downlight",
  "ceiling-lights": "Ceiling Light",
  "linear-lights": "Linear Light",
  "flood-lights": "Flood Light",
  "high-bay-lights": "High Bay Light",
  "solar-flood-lights": "Solar Flood Light",
  "solar-street-lights": "Solar Street Light",
  "solar-systems": "Solar System",
  "water-pumps": "Water Pump",
  "led-strip-lights": "LED Strip Light",
  "decorative-lights": "Decorative Light",
  "string-lights": "String Light",
  "drivers-accessories": "Driver / Accessory",
  fans: "Fan",
  "wire-cables": "Wire / Cable",
} as const satisfies Record<ProductCategory, string>;

const genericTitlePrefixes = {
  "led-bulbs": "LED Bulb",
  "led-tubes": "LED Tube",
  "panel-lights": "Panel Light",
  downlights: "Downlight",
  "ceiling-lights": "Ceiling Light",
  "linear-lights": "Linear Light",
  "flood-lights": "Flood Light",
  "high-bay-lights": "High Bay Light",
  "solar-flood-lights": "Solar Flood Light",
  "solar-street-lights": "Solar Street Light",
  "solar-systems": "Solar System",
  "water-pumps": "Water Pump",
  "led-strip-lights": "LED Strip Light",
  "decorative-lights": "Decorative Light",
  "string-lights": "String Light",
  "drivers-accessories": "Driver / Accessory",
  fans: "Fan",
  "wire-cables": "Wire / Cable",
} as const satisfies Record<ProductCategory, string>;

export function isProductCategory(value: string): value is ProductCategory {
  return categoryLookup.has(value as ProductCategory);
}

export function normalizeCategory(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return { category: null, wasRemapped: false };
  }

  if (isProductCategory(normalized)) {
    return { category: normalized, wasRemapped: false };
  }

  const remapped = sourceCategoryRemaps[normalized as keyof typeof sourceCategoryRemaps];

  if (remapped) {
    return { category: remapped, wasRemapped: true };
  }

  return { category: null, wasRemapped: false };
}

export function getCategoryMeta(category: ProductCategory) {
  const meta = categoryLookup.get(category);

  if (!meta) {
    throw new Error(`Unknown category metadata for ${category}`);
  }

  return meta;
}

export function getDefaultCategoryLabel(category: ProductCategory) {
  return defaultCategoryLabels[category];
}

export function getGenericTitlePrefix(category: ProductCategory) {
  return genericTitlePrefixes[category];
}
