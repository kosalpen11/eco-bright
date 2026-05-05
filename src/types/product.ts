export type ProductBadge = "new" | "hot" | "sale";

export type ProductCategory =
  | "led-bulbs"
  | "led-tubes"
  | "panel-lights"
  | "downlights"
  | "ceiling-lights"
  | "linear-lights"
  | "flood-lights"
  | "high-bay-lights"
  | "solar-flood-lights"
  | "solar-street-lights"
  | "solar-systems"
  | "water-pumps"
  | "led-strip-lights"
  | "decorative-lights"
  | "string-lights"
  | "drivers-accessories"
  | "fans"
  | "wire-cables";

export const PRODUCT_CATEGORIES = [
  { value: "led-bulbs", label: "LED Bulbs", labelKm: "អំពូល LED" },
  { value: "led-tubes", label: "LED Tubes", labelKm: "បំពង់ LED" },
  { value: "panel-lights", label: "Panel Lights", labelKm: "ភ្លើងបន្ទះ" },
  { value: "downlights", label: "Downlights", labelKm: "ភ្លើងដោនឡាយ" },
  { value: "ceiling-lights", label: "Ceiling Lights", labelKm: "ភ្លើងពិដាន" },
  { value: "linear-lights", label: "Linear Lights", labelKm: "ភ្លើងបន្ទាត់" },
  { value: "flood-lights", label: "Flood Lights", labelKm: "ភ្លើងហ្វ្លដ៍" },
  { value: "high-bay-lights", label: "High Bay Lights", labelKm: "ភ្លើងរោងចក្រ" },
  { value: "solar-flood-lights", label: "Solar Flood Lights", labelKm: "ភ្លើងហ្វ្លដ៍សូឡា" },
  { value: "solar-street-lights", label: "Solar Street Lights", labelKm: "ភ្លើងផ្លូវសូឡា" },
  { value: "solar-systems", label: "Solar Systems", labelKm: "ប្រព័ន្ធសូឡា" },
  { value: "water-pumps", label: "Water Pumps", labelKm: "ម៉ាស៊ីនបូមទឹក" },
  { value: "led-strip-lights", label: "LED Strip Lights", labelKm: "ខ្សែភ្លើង LED" },
  { value: "decorative-lights", label: "Decorative Lights", labelKm: "ភ្លើងតុបតែង" },
  { value: "string-lights", label: "String Lights", labelKm: "ភ្លើងខ្សែតុបតែង" },
  { value: "drivers-accessories", label: "Drivers & Accessories", labelKm: "ឌ្រាយវឺរ និងគ្រឿងបន្លាស់" },
  { value: "fans", label: "Fans", labelKm: "កង្ហារ" },
  { value: "wire-cables", label: "Wire & Cables", labelKm: "ខ្សែភ្លើង និងខ្សែកាប" },
] as const satisfies ReadonlyArray<{ value: ProductCategory; label: string; labelKm: string }>;

export type ProductFilterValue = ProductCategory | "all";

export const PRODUCT_GROUP_MODES = [
  { value: "category", label: "Category", labelKm: "ប្រភេទ" },
  { value: "price", label: "Price Range", labelKm: "កម្រិតតម្លៃ" },
  { value: "use-case", label: "Use Case", labelKm: "ការប្រើប្រាស់" },
] as const;

export type ProductGroupMode = (typeof PRODUCT_GROUP_MODES)[number]["value"];

export const PRODUCT_SORT_MODES = [
  { value: "featured", label: "Featured", labelKm: "ណែនាំ" },
  { value: "newest", label: "Newest", labelKm: "ថ្មីបំផុត" },
  { value: "rating", label: "Top Rated", labelKm: "ពេញនិយមខ្ពស់" },
  { value: "price-asc", label: "Price: Low to High", labelKm: "តម្លៃ: ទាបទៅខ្ពស់" },
  { value: "price-desc", label: "Price: High to Low", labelKm: "តម្លៃ: ខ្ពស់ទៅទាប" },
] as const;

export type ProductSortMode = (typeof PRODUCT_SORT_MODES)[number]["value"];

export interface Product {
  id: string;
  brand?: string;
  title: string;
  titleKm?: string;
  category: ProductCategory;
  categoryLabel: string;
  categoryLabelKm?: string;
  useCase?: string;
  useCaseKm?: string;
  description: string;
  descriptionKm?: string;
  imageUrl: string | null;
  imageUrls?: string[] | null;
  price: number;
  oldPrice?: number | null;
  badge?: ProductBadge;
  tags: string[];
  currency: "USD";
  inStock: boolean;
  sortOrder?: number;
  isActive: boolean;
  rating?: number;
  createdOrder?: number;
  rawCategory?: string;
  packQty?: number;
  holeSize?: string;
  sourceSheet?: string;
  sourceBlock?: string;
  sourceRow?: string;
  sourceSegment?: string;
  needsReview?: boolean;
  reviewFlags?: string[];
  migrationBatchId?: string;
}

export interface ProductGroupSection {
  id: string;
  title: string;
  description: string;
  items: Product[];
}
