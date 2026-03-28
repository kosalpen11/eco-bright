"use client";

import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";
import { TELEGRAM_PUBLIC_URL } from "@/lib/constants";

export function Footer() {
  const { locale } = useLocale();
  const copy = getUiText(locale).footer;

  return (
    <footer className="hide-on-print border-t border-app-border pb-28 pt-10 lg:pb-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <div className="locale-display font-display text-[2rem] uppercase text-app-accent">
            ECO BRIGHT LED & SOLAR
          </div>
          <p className="mt-2 max-w-md text-sm leading-7 text-app-text-muted">{copy.description}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm font-medium text-app-text-muted">
          <a href="#store" className="hover:text-app-text">
            {copy.products}
          </a>
          <a href="#invoice" className="hover:text-app-text">
            {copy.invoice}
          </a>
          <a href={TELEGRAM_PUBLIC_URL} target="_blank" rel="noreferrer" className="hover:text-app-text">
            {copy.telegram}
          </a>
        </div>

        <div className="text-sm text-app-text-muted">© 2026 ECO BRIGHT LED & SOLAR</div>
      </div>
    </footer>
  );
}
