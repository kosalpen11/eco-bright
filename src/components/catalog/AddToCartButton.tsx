"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VariantPickerModal from "./VariantPickerModal";

import { buildCartLineId } from "@/lib/cart-storage";
import type { PublicProduct, PublicProductVariant } from "@/lib/public-products";
import { useCartStore } from "@/store/cart-store";
import type { ProductCategory } from "@/types/product";

export function AddToCartButton({
  product,
  variant,
  imageUrl,
  price,
  className,
}: {
  product: PublicProduct;
  variant?: PublicProductVariant | null;
  imageUrl: string | null;
  price: number;
  className?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);

  function handleAddToCart() {
    // If product has variants but no specific variant was provided,
    // open a lightweight modal to let the user pick instead of redirecting.
    if (product.variants && product.variants.length > 0 && !variant) {
      setShowPicker(true);
      return;
    }

    addItem({
      lineId: buildCartLineId({
        productId: product.id,
        variantId: variant?.id ?? null,
      }),
      id: variant?.id ?? product.id,
      productId: product.id,
      variantId: variant?.id ?? null,
      title: product.title,
      titleKm: product.titleKm ?? undefined,
      variantTitle: variant?.label ?? null,
      category: product.category as ProductCategory,
      categoryLabel: product.categoryLabel,
      categoryLabelKm: product.categoryLabelKm ?? undefined,
      imageUrl,
      price,
    });
    openCart();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  function handleVariantSelected(v: PublicProductVariant) {
    setShowPicker(false);
    addItem({
      lineId: buildCartLineId({ productId: product.id, variantId: v.id ?? null }),
      id: v.id ?? product.id,
      productId: product.id,
      variantId: v.id ?? null,
      title: product.title,
      titleKm: product.titleKm ?? undefined,
      variantTitle: v.label ?? null,
      optionLabel: v.value ?? v.label ?? null,
      optionPrice: v.price ?? null,
      category: product.category as ProductCategory,
      categoryLabel: product.categoryLabel,
      categoryLabelKm: product.categoryLabelKm ?? undefined,
      imageUrl,
      price: v.price ?? price,
    });
    openCart();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <>
      <button type="button" onClick={handleAddToCart} className={className}>
        {added ? "Added" : "Add to Cart"}
      </button>
      {showPicker && (
        <VariantPickerModal
          product={product}
          variants={product.variants}
          imageUrl={imageUrl}
          onSelect={handleVariantSelected}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
