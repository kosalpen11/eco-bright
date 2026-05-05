export type ProductSortMode = "default" | "price-asc" | "price-desc" | "name-asc";

export interface ProductFilters {
  brand?: string | null;
  category?: string | null;
  q?: string | null;
  sort?: ProductSortMode | null;
  page?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export interface Product {
  id: string;
  title: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  packQty: string | null;
  useCase: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  currency: string;
  inStock: boolean;
  isActive: boolean;
  sortOrder: number | null;
}

export interface ProductCategory {
  id: string;
  label: string;
  count: number;
}
