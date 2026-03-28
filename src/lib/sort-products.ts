import type { Product, ProductSortMode } from "@/types/product";

export function sortProducts(products: Product[], mode: ProductSortMode) {
  return [...products].sort((left, right) => {
    switch (mode) {
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "rating":
        return (
          (right.rating ?? 0) - (left.rating ?? 0) ||
          (left.sortOrder ?? 999) - (right.sortOrder ?? 999)
        );
      case "newest":
        return (right.createdOrder ?? 0) - (left.createdOrder ?? 0);
      case "featured":
      default:
        return (left.sortOrder ?? 999) - (right.sortOrder ?? 999);
    }
  });
}
