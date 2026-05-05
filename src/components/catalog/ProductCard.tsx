import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/types";
import { CopyProductButton } from "@/components/catalog/CopyProductButton";

function isAllowedImageUrl(url: string) {
  if (url.startsWith("/")) return true;
  if (!url.startsWith("http")) return false;

  try {
    const parsed = new URL(url);
    return parsed.hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

function CategoryIcon({ category }: { category: string }) {
  const common = "h-10 w-10 text-gray-400";

  switch (category) {
    case "led-tubes":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            d="M4 7h16M4 17h16M7 7v10M17 7v10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "panel-lights":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <rect
            x="5"
            y="6"
            width="14"
            height="12"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 9h8M8 12h8M8 15h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "ceiling-lights":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            d="M12 4v3M7 10a5 5 0 0 1 10 0v2H7v-2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 14h6M10 17h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "bulbs":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            d="M9 21h6M10 18h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 3a6 6 0 0 0-3.5 10.9c.7.6 1.2 1.3 1.3 2.1h4.4c.1-.8.6-1.5 1.3-2.1A6 6 0 0 0 12 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "emergency":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            d="M12 3v7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8.5 21h7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9 14h6l-1 7H10l-1-7Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "string-lights":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            d="M4 10c3 3 6-3 9 0s6-3 7 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7 10v3M13 10v3M18 10v3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="7" cy="15" r="1" fill="currentColor" />
          <circle cx="13" cy="15" r="1" fill="currentColor" />
          <circle cx="18" cy="15" r="1" fill="currentColor" />
        </svg>
      );
    case "led-strips":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            d="M6 7h12M6 12h12M6 17h12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8 7v10M16 7v10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "fans":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <circle
            cx="12"
            cy="12"
            r="1.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 3c2.5 0 3.8 3 2.2 4.8-1.1 1.2-1.4 2.2-1.2 3.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M21 12c0 2.5-3 3.8-4.8 2.2-1.2-1.1-2.2-1.4-3.2-1.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 21c-2.5 0-3.8-3-2.2-4.8 1.1-1.2 1.4-2.2 1.2-3.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "wire-cable":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            d="M7 7v5a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 7h4M13 7h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "drivers":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <rect
            x="5"
            y="8"
            width="14"
            height="8"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 12h8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            d="M6 8h12v10H6V8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M9 8V6a3 3 0 0 1 6 0v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

function brandFromId(id: string) {
  const idx = id.indexOf("_");
  if (idx <= 0) return null;
  const raw = id.slice(0, idx).trim();
  if (!raw) return null;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function ProductCard({ product }: { product: Product }) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency || "USD",
  });

  const brand = brandFromId(product.id);

  const primaryImage =
    product.imageUrls?.[0] ??
    (product.imageUrl ? product.imageUrl : null);

  const imageUrl = primaryImage && isAllowedImageUrl(primaryImage) ? primaryImage : null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-colors hover:border-gray-300">
      <div className="relative flex h-[120px] items-center justify-center bg-gray-100">
        <div className="absolute left-3 top-3 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
          {product.categoryLabel}
        </div>

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-6"
            sizes="200px"
          />
        ) : (
          <CategoryIcon category={product.category} />
        )}
      </div>

      <div className="p-4">
        <div className="inline-flex rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
          {brand ? brand : "Unknown Brand"}
        </div>

        <div className="mt-3 text-sm font-medium text-gray-900">
          {product.name}
        </div>

        {product.useCase ? (
          <div className="mt-1 text-xs text-gray-500">{product.useCase}</div>
        ) : (
          <div className="mt-1 h-4" />
        )}

        <div className="mt-3 text-lg font-semibold text-amber-700">
          {formatter.format(product.price)}{" "}
          <span className="text-sm font-medium text-gray-500">/ unit</span>
        </div>

        {product.packQty ? (
          <div className="mt-1 text-sm text-gray-500">
            <span className="mr-2 text-gray-300">&middot;</span>
            Pack: {product.packQty}
          </div>
        ) : (
          <div className="mt-1 h-5" />
        )}

        <Link
          href={`/products/${product.id}`}
          className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 transition-colors hover:border-amber-700 hover:bg-amber-50 hover:text-amber-700"
        >
          View Details
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="text-xs text-gray-400">{product.id}</div>
          <CopyProductButton
            productId={product.id}
            productName={product.name}
            className="h-8 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-amber-700 hover:bg-amber-50 hover:text-amber-700"
          />
        </div>
      </div>
    </div>
  );
}
