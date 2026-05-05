"use client";

import { SearchX } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { getUiText } from "@/lib/i18n";

interface ProductEmptyStateProps {
  onReset: () => void;
}

export function ProductEmptyState({ onReset }: ProductEmptyStateProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).storefront;

  return (
    <EmptyState
      icon={SearchX}
      title={copy.noProductsFound}
      description={copy.noProductsDescription}
      action={
        <Button variant="outline" onClick={onReset}>
          {copy.resetCatalogView}
        </Button>
      }
    />
  );
}
