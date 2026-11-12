"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone, Truck } from "lucide-react";

import { TelegramIcon } from "@/components/layout/site-header";
import { useLocale } from "@/components/locale/locale-provider";
import { TELEGRAM_OWNER_URL } from "@/lib/constants";
import { getUiText } from "@/lib/i18n";
import { STORE_INFO, toTelHref } from "@/lib/store-info";

const headingClass =
  // `locale-label` swaps the wide Latin letter-spacing for a Khmer-safe one.
  "locale-label text-xs font-semibold uppercase text-[var(--app-text-muted)]";
const linkClass =
  "inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--app-text-soft)] hover:text-[var(--app-primary)]";
const rowClass = "flex items-start gap-2 text-sm text-[var(--app-text-soft)]";
const iconClass = "mt-0.5 size-4 shrink-0 text-[var(--app-primary)]";

export function Footer() {
  const { locale } = useLocale();
  const copy = getUiText(locale).site.footer;
  const address = STORE_INFO.address[locale];
  const deliveryArea = STORE_INFO.deliveryArea[locale];
  const hours = STORE_INFO.hours[locale];
  const returnPolicyHref = STORE_INFO.returnPolicyHref;

  return (
    <footer className="hide-on-print border-t border-[var(--app-border)] bg-white pb-28 pt-8 lg:pb-10">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        <section className="space-y-3">
          <Link href="/products" className="flex min-h-11 items-center gap-2">
            <Image src="/ecobright-logo.jpeg" alt="Eco Bright" width={34} height={34} className="rounded-xl" />
            <span className="text-sm font-bold tracking-[0.12em] text-[var(--app-text)] uppercase">Eco Bright</span>
          </Link>
          <h2 className={headingClass}>{copy.aboutTitle}</h2>
          <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">{copy.about}</p>
        </section>

        <section className="space-y-3">
          <h2 className={headingClass}>{copy.contactTitle}</h2>
          <ul className="space-y-1">
            <li>
              <a href={TELEGRAM_OWNER_URL} target="_blank" rel="noreferrer" className={linkClass}>
                <TelegramIcon className="size-4 shrink-0 text-[var(--app-primary)]" />
                {copy.chatTelegram}
              </a>
            </li>
            {STORE_INFO.phone ? (
              <li>
                <a href={toTelHref(STORE_INFO.phone)} className={linkClass}>
                  <Phone className="size-4 shrink-0 text-[var(--app-primary)]" />
                  <span className="sr-only">{copy.phone}: </span>
                  {STORE_INFO.phone}
                </a>
              </li>
            ) : null}
            {address ? (
              <li className={rowClass}>
                <MapPin className={iconClass} />
                <span>
                  <span className="sr-only">{copy.address}: </span>
                  {address}
                </span>
              </li>
            ) : null}
          </ul>
        </section>

        {deliveryArea || hours ? (
          <section className="space-y-3">
            <h2 className={headingClass}>{copy.deliveryTitle}</h2>
            <ul className="space-y-2.5">
              {deliveryArea ? (
                <li className={rowClass}>
                  <Truck className={iconClass} />
                  <span>
                    <span className="sr-only">{copy.deliveryArea}: </span>
                    {deliveryArea}
                  </span>
                </li>
              ) : null}
              {hours ? (
                <li className={rowClass}>
                  <Clock className={iconClass} />
                  <span>
                    <span className="sr-only">{copy.hours}: </span>
                    {hours}
                  </span>
                </li>
              ) : null}
            </ul>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className={headingClass}>{copy.helpTitle}</h2>
          <ul className="space-y-2.5">
            <li>
              <Link href="/products" className={linkClass}>
                {copy.products}
              </Link>
            </li>
            {returnPolicyHref ? (
              <li>
                <Link href={returnPolicyHref} className={linkClass}>
                  {copy.returnPolicy}
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      <div className="mx-auto mt-8 w-full max-w-7xl border-t border-[var(--app-border)] px-4 pt-4 text-xs text-[var(--app-text-muted)]">
        © {new Date().getFullYear()} ECOBright. {copy.rights}
      </div>
    </footer>
  );
}
