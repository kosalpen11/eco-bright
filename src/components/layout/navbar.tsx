"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CartBadge } from "@/components/cart/cart-badge";
import { LocaleToggle } from "@/components/locale/locale-toggle";
import { useLocale } from "@/components/locale/locale-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getUiText } from "@/lib/i18n";
import { SHOP_NAME, TELEGRAM_PUBLIC_URL } from "@/lib/constants";

export function Navbar() {
  const { locale } = useLocale();
  const copy = getUiText(locale);

  return (
    <header className="hide-on-print sticky top-0 z-40 border-b border-app-border bg-app-bg-soft backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <div className="locale-display font-display text-[2rem] uppercase text-app-accent sm:text-[2.3rem]">
            {SHOP_NAME}
          </div>
          <p className="locale-label locale-nowrap mt-1 max-w-[14rem] text-[0.74rem] font-semibold uppercase text-app-text-muted sm:max-w-[18rem]">
            {copy.shopTagline}
          </p>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="#store"
            className="rounded-full px-3 py-2 text-sm font-medium text-app-text-muted hover:text-app-text"
          >
            {copy.navbar.catalog}
          </Link>
          <Link
            href="#invoice"
            className="rounded-full px-3 py-2 text-sm font-medium text-app-text-muted hover:text-app-text"
          >
            {copy.navbar.invoice}
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleToggle />
          <ThemeToggle />
          <CartBadge />
          <Button asChild variant="outline" size="sm">
            <a href={TELEGRAM_PUBLIC_URL} target="_blank" rel="noreferrer">
              {copy.navbar.telegram}
            </a>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={TELEGRAM_PUBLIC_URL} target="_blank" rel="noreferrer">
              {copy.navbar.orderNow}
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
