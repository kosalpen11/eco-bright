import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductById } from "@/lib/db/products";
import { TELEGRAM_OWNER_URL } from "@/lib/constants";
import { CopyProductButton } from "@/components/catalog/CopyProductButton";
import { TelegramOrderButton } from "@/components/catalog/TelegramOrderButton";
import { getUiText } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
import { localizeText } from "@/lib/i18n";

type Params = Promise<{ id: string }>;

function isAllowedImageUrl(url: string) {
  if (url.startsWith("/")) return true;
  if (!url.startsWith("http")) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function CategoryIcon({ category }: { category: string }) {
  const common = "h-12 w-12 text-gray-400";

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

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return {
    title: product.name,
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const locale = await getRequestLocale();
  const copy = getUiText(locale).catalog;

  const brand = brandFromId(product.id);
  const displayName = localizeText(locale, product.name, product.titleKm);
  const displayUseCase =
    localizeText(locale, product.useCase ?? "", product.useCaseKm) || null;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency || "USD",
  });

  const images = (product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [])
    .filter((url) => typeof url === "string" && url.length > 0)
    .filter(isAllowedImageUrl);

  const primaryImage = images[0] ?? null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
        <div className="border-b border-gray-100 bg-gray-50">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-end px-4 py-2">
            <a
              href={TELEGRAM_OWNER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-amber-700"
              aria-label={copy.contactSales}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M9.993 15.544 9.83 19.1c.35 0 .503-.15.686-.33l1.645-1.57 3.41 2.496c.625.345 1.067.163 1.223-.577l2.216-10.39c.227-1.01-.37-1.404-.98-1.18L4.24 11.39c-.96.38-.946.925-.165 1.17l3.56 1.11 8.26-5.22c.39-.24.744-.11.452.13z" />
              </svg>
              {copy.contactSales}
            </a>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-amber-700"
          >
            {copy.backToCatalog}
          </Link>

          <div className="flex items-center gap-2">
            <Image
              src="/ecobright-logo.jpeg"
              alt="EcoBright"
              width={24}
              height={24}
              className="rounded"
              priority
            />
            <div className="text-base font-semibold tracking-tight text-gray-900">
              EcoBright
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CopyProductButton
              productId={product.id}
              productName={product.name}
              className="h-8 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-amber-700 hover:bg-amber-50 hover:text-amber-700"
            />
            <div className="text-sm font-medium text-amber-700">
              {formatter.format(product.price)}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="relative flex h-[280px] items-center justify-center bg-gray-100">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={product.name}
                  fill
                  className="object-contain p-10"
                  sizes="(max-width: 1024px) 100vw, 360px"
                />
              ) : (
                <CategoryIcon category={product.category} />
              )}
            </div>

            {images.length > 1 ? (
              <div className="border-t border-gray-100 p-3">
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 8).map((url) => (
                    <div
                      key={url}
                      className="relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                    >
                      <Image
                        src={url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                {brand ? brand : "Unknown Brand"}
              </div>
            </div>

            <h1 className="mt-3 text-xl font-semibold tracking-tight text-gray-900">
              {displayName}
            </h1>

            {displayUseCase ? (
              <div className="mt-1 text-sm text-gray-500">{displayUseCase}</div>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {copy.price}
                </div>
                <div className="mt-2 text-lg font-semibold text-amber-700">
                  {formatter.format(product.price)}{" "}
                  <span className="text-sm font-medium text-gray-500">{copy.eachUnit}</span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {copy.availability}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-900">
                  {product.inStock ? copy.inStock : copy.outOfStock}
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {copy.productId}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="min-w-0 truncate font-mono text-sm text-gray-700">
                    {product.id}
                  </div>
                  <CopyProductButton
                    productId={product.id}
                    productName={product.name}
                    className="h-8 shrink-0 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-amber-700 hover:bg-amber-50 hover:text-amber-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <TelegramOrderButton
                productId={product.id}
                productName={product.name}
                priceText={`${formatter.format(product.price)} ${copy.eachUnit}`}
                className="h-10 w-full rounded-lg border border-gray-200 text-sm font-semibold text-gray-800 transition-colors hover:border-amber-700 hover:bg-amber-50 hover:text-amber-700"
              />
              <div className="mt-2 text-xs text-gray-500">
                {copy.requestOrderNote}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
