export type ProductBadge = "new" | "hot" | "sale";

export type ProductCategory =
  | "led-bulbs"
  | "led-tubes"
  | "flood-lights"
  | "street-lights"
  | "solar-panels"
  | "batteries"
  | "accessories";

export const PRODUCT_CATEGORIES = [
  { value: "led-bulbs", label: "LED Bulbs", labelKm: "អំពូល LED" },
  { value: "led-tubes", label: "LED Tubes", labelKm: "បំពង់ LED" },
  { value: "flood-lights", label: "Flood Lights", labelKm: "ភ្លើងហ្វ្លដ៍" },
  { value: "street-lights", label: "Street Lights", labelKm: "ភ្លើងផ្លូវ" },
  { value: "solar-panels", label: "Solar Panels", labelKm: "បន្ទះសូឡា" },
  { value: "batteries", label: "Batteries", labelKm: "ថ្ម" },
  { value: "accessories", label: "Accessories", labelKm: "គ្រឿងបន្លាស់" },
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
  title: string;
  titleKm?: string;
  category: ProductCategory;
  categoryLabel: string;
  categoryLabelKm?: string;
  useCase?: string;
  useCaseKm?: string;
  description: string;
  descriptionKm?: string;
  imageUrl: string;
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
}

export interface ProductGroupSection {
  id: string;
  title: string;
  description: string;
  items: Product[];
}
