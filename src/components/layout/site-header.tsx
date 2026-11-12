"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShieldCheck, ShoppingCart, Truck, X } from "lucide-react";

import { CategoryBar } from "@/components/catalog/CategoryBar";
import { SearchInput } from "@/components/catalog/SearchInput";
import { useLocale } from "@/components/locale/locale-provider";
import { TELEGRAM_OWNER_URL } from "@/lib/constants";
import { getUiText } from "@/lib/i18n";
import type { ProductCategory } from "@/lib/types";
import { selectCartCount, useCartStore } from "@/store/cart-store";

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M9.993 15.544 9.83 19.1c.35 0 .503-.15.686-.33l1.645-1.57 3.41 2.496c.625.345 1.067.163 1.223-.577l2.216-10.39c.227-1.01-.37-1.404-.98-1.18L4.24 11.39c-.96.38-.946.925-.165 1.17l3.56 1.11 8.26-5.22c.39-.24.744-.11.452.13z" />
    </svg>
  );
}

const iconButtonClass =
  "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-[var(--app-primary)] shadow-sm transition-colors hover:bg-[var(--app-surface)]";

function isCatalogPath(pathname: string) {
  return pathname === "/products" || pathname.startsWith("/catalog/");
}

function HeaderCartButton({ label }: { label: string }) {
  const count = useCartStore(selectCartCount);
  const openCart = useCartStore((state) => state.openCart);
  const pathname = usePathname();
  const router = useRouter();

  function handleClick() {
    // The cart lives on the catalog: a bottom sheet on mobile, the side rail on desktop.
    openCart();
    if (isCatalogPath(pathname)) {
      document.getElementById("cart-rail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/products");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={iconButtonClass}
      aria-label={`${label} (${count})`}
    >
      <ShoppingCart className="size-5" />
      {count > 0 ? (
        <span
          className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[var(--app-primary)] px-1 py-0.5 text-[0.65rem] font-bold leading-none text-white ring-2 ring-white"
          aria-hidden="true"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}

function TrustStrip() {
  const { locale } = useLocale();
  const copy = getUiText(locale).site.trust;
  const items = [
    { icon: <Truck className="size-4" />, label: copy.delivery },
    { icon: <ShieldCheck className="size-4" />, label: copy.warranty },
    { icon: <TelegramIcon className="size-4" />, label: copy.support },
  ];

  return (
    <div className="border-b border-[var(--app-border)] bg-[var(--app-surface)]">
      <ul className="mx-auto grid w-full max-w-7xl grid-cols-3 gap-1 px-2 py-2 sm:gap-3 sm:px-4">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex min-w-0 flex-col items-center justify-center gap-1 text-center text-[11px] font-medium leading-tight text-[var(--app-text-soft)] sm:flex-row sm:gap-2 sm:text-sm"
          >
            <span className="shrink-0 text-[var(--app-primary)]">{item.icon}</span>
            <span className="min-w-0">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteHeader({
  categories,
  activeCategory,
  loadingCategories = false,
}: {
  categories?: ProductCategory[];
  activeCategory?: string;
  /** Show same-size chip placeholders (used by loading.tsx skeletons to avoid layout shift). */
  loadingCategories?: boolean;
}) {
  const { locale } = useLocale();
  const copy = getUiText(locale).site;
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const localizedCategories = categories?.map((category) => ({
    ...category,
    label:
      category.id === "all"
        ? copy.allCategories
        : locale === "km" && category.labelKm?.trim()
          ? category.labelKm
          : category.label,
  }));

  return (
    <>
      <header className="hide-on-print sticky top-0 z-40 border-b border-[var(--app-border)] bg-[rgba(248,250,247,0.94)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          <Link href="/products" className="flex min-h-11 min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <Image
              src="/ecobright-logo.jpeg"
              alt="Eco Bright"
              width={34}
              height={34}
              className="shrink-0 rounded-xl"
              loading="eager"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-[0.12em] text-[var(--app-text)] uppercase">
                Eco Bright
              </div>
              <div className="hidden truncate text-[11px] text-[var(--app-text-muted)] min-[400px]:block">
                Lighting catalog
              </div>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 sm:block">
            <SearchInput />
          </div>

          <button
            type="button"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className={`${iconButtonClass} sm:hidden`}
            aria-label={mobileSearchOpen ? copy.closeSearch : copy.search}
            aria-expanded={mobileSearchOpen}
            aria-controls="mobile-header-search"
          >
            {mobileSearchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </button>

          <HeaderCartButton label={copy.cart} />

          <a
            href={TELEGRAM_OWNER_URL}
            target="_blank"
            rel="noreferrer"
            className={`${iconButtonClass} md:w-auto md:gap-2 md:px-4 md:text-sm md:font-semibold`}
            aria-label={copy.contactTelegram}
          >
            <TelegramIcon className="size-5" />
            <span className="hidden md:inline">{copy.telegram}</span>
          </a>
        </div>

        {mobileSearchOpen ? (
          <div id="mobile-header-search" className="mx-auto w-full max-w-7xl px-3 pb-2.5 sm:hidden">
            <SearchInput />
          </div>
        ) : null}

        {loadingCategories ? (
          <div className="mx-auto w-full max-w-7xl px-3 pb-2.5 sm:px-4 sm:pb-3" aria-hidden="true">
            <div className="flex gap-2 overflow-hidden pb-1">
              {[96, 84, 80, 104, 88, 92].map((width, index) => (
                <div
                  key={index}
                  style={{ width }}
                  className="h-[46px] shrink-0 animate-pulse rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] motion-reduce:animate-none"
                />
              ))}
            </div>
          </div>
        ) : localizedCategories && localizedCategories.length > 0 ? (
          <nav aria-label={copy.categories} className="mx-auto w-full max-w-7xl px-3 pb-2.5 sm:px-4 sm:pb-3">
            <CategoryBar categories={localizedCategories} activeCategory={activeCategory ?? "all"} />
          </nav>
        ) : null}
      </header>

      <TrustStrip />
    </>
  );
}
