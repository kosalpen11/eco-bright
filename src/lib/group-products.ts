import { getCategoryLabel, getProductCategoryLabel, getProductUseCase, getUiText } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import { PRODUCT_CATEGORIES } from "@/types/product";
import type { Product, ProductGroupMode, ProductGroupSection } from "@/types/product";

function getPriceGroup(product: Product, locale: Locale) {
  const copy = getUiText(locale).groups;

  if (product.price < 10) {
    return {
      id: "budget",
      title: copy.budgetTitle,
      description: copy.budgetDescription,
    };
  }

  if (product.price < 100) {
    return {
      id: "mid-range",
      title: copy.midRangeTitle,
      description: copy.midRangeDescription,
    };
  }

  return {
    id: "project-grade",
    title: copy.projectGradeTitle,
    description: copy.projectGradeDescription,
  };
}

export function groupProducts(
  products: Product[],
  groupMode: ProductGroupMode,
  locale: Locale,
): ProductGroupSection[] {
  const groups = new Map<string, ProductGroupSection>();
  const copy = getUiText(locale).groups;

  products.forEach((product) => {
    if (groupMode === "price") {
      const priceGroup = getPriceGroup(product, locale);

      if (!groups.has(priceGroup.id)) {
        groups.set(priceGroup.id, { ...priceGroup, items: [] });
      }

      groups.get(priceGroup.id)?.items.push(product);
      return;
    }

    if (groupMode === "use-case") {
      const useCase = getProductUseCase(product, locale)?.trim() || copy.generalUse;
      const idSource = product.useCase?.trim() || product.useCaseKm?.trim() || useCase;
      const id =
        idSource.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
        `use-case-${groups.size + 1}`;

      if (!groups.has(id)) {
        groups.set(id, {
          id,
          title: useCase,
          description: copy.useCaseDescription,
          items: [],
        });
      }

      groups.get(id)?.items.push(product);
      return;
    }

    if (!groups.has(product.category)) {
      groups.set(product.category, {
        id: product.category,
        title: getProductCategoryLabel(product, locale) || getCategoryLabel(product.category, locale),
        description: copy.categoryDescription,
        items: [],
      });
    }

    groups.get(product.category)?.items.push(product);
  });

  const sections = Array.from(groups.values());

  if (groupMode === "category") {
    const categoryOrder = new Map(
      PRODUCT_CATEGORIES.map((category, index) => [category.value, index]),
    );

    sections.sort(
      (left, right) =>
        (categoryOrder.get(left.id as never) ?? 999) -
        (categoryOrder.get(right.id as never) ?? 999),
    );
  } else if (groupMode === "price") {
    const priceOrder = new Map([
      ["budget", 0],
      ["mid-range", 1],
      ["project-grade", 2],
    ]);

    sections.sort(
      (left, right) =>
        (priceOrder.get(left.id) ?? 999) - (priceOrder.get(right.id) ?? 999),
    );
  } else {
    sections.sort((left, right) => left.title.localeCompare(right.title));
  }

  return sections;
}
