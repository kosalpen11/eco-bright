export type ProductSortMode = "default" | "price-asc" | "price-desc" | "name-asc";

export type ProductAttributeValue =
  | string
  | number
  | boolean
  | Array<string | number>;

export interface ProductVariant {
  id: string;
  label: string;
  value?: string | null;
  imageUrl: string | null;
  price: number | null;
  oldPrice: number | null;
  attributes: Record<string, ProductAttributeValue>;
  stockQty: number | null;
  inStock: boolean | null;
  isActive: boolean;
}

export interface ProductFilters {
  brand?: string | null;
  category?: string | null;
  q?: string | null;
  sort?: ProductSortMode | null;
  page?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

/** Optional technical specs; every field may be null and empty rows are hidden. */
export interface ProductSpecs {
  length: string | null;
  voltage: string | null;
  wattage: string | null;
  color: string | null;
  colorKm: string | null;
  warranty: string | null;
  warrantyKm: string | null;
}

export interface Product {
  id: string;
  title: string;
  titleKm: string | null;
  name: string;
  category: string;
  categoryLabel: string;
  categoryLabelKm: string | null;
  description: string;
  descriptionKm: string | null;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  packQty: string | null;
  holeSize: string | null;
  useCase: string | null;
  useCaseKm: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  currency: string;
  stockQty: number | null;
  inStock: boolean;
  rating: number | null;
  tags: string[];
  attributes: Record<string, ProductAttributeValue>;
  variants: ProductVariant[];
  isActive: boolean;
  sortOrder: number | null;
  specs?: ProductSpecs;
}

export interface ProductCategory {
  id: string;
  label: string;
  labelKm?: string | null;
  count: number;
}
