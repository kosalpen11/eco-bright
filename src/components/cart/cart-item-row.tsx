"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";
import { ProductImage } from "@/components/common/product-image";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { getCartItemCategoryLabel, getCartItemTitle, getUiText } from "@/lib/i18n";
import type { CartItem } from "@/types/cart";

interface CartItemRowProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemRowProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).cart;
  const productCopy = getUiText(locale).product;
  const title = getCartItemTitle(item, locale);
  const categoryLabel = getCartItemCategoryLabel(item, locale);

  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-app-border bg-app-surface-2 p-3 sm:grid-cols-[5rem_minmax(0,1fr)]">
      <ProductImage
        src={item.imageUrl}
        alt={item.title}
        sizes="80px"
        className="aspect-square min-h-20 rounded-[1.25rem]"
        imageClassName="p-3"
      />

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="locale-label text-[0.74rem] font-semibold uppercase text-app-text-muted">
            {categoryLabel}
          </div>
          <div className="text-sm font-semibold leading-6">{title}</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(item.price)} {productCopy.each}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-app-bg-soft px-2 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onDecrease}
              aria-label={copy.decreaseQuantity(title)}
            >
              <Minus className="size-4" />
            </Button>
            <span className="min-w-6 text-center text-sm font-semibold">{item.qty}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onIncrease}
              aria-label={copy.increaseQuantity(title)}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-app-primary">
              {formatCurrency(item.price * item.qty)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-app-text-muted hover:text-app-danger"
              onClick={onRemove}
              aria-label={copy.removeFromCart(title)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
