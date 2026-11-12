"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Clock, Copy, Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { copyText } from "@/components/catalog/CopyProductButton";
import { TelegramIcon } from "@/components/layout/site-header";
import type { Locale } from "@/lib/locale";
import { TELEGRAM_OWNER_URL } from "@/lib/constants";
import { getUiText } from "@/lib/i18n";
import type { PublicProduct } from "@/lib/public-products";
import { STORE_INFO } from "@/lib/store-info";

type ProductCopy = ReturnType<typeof getUiText>["productPage"];

export const sectionCardClass =
  "rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm sm:p-6";
export const sectionTitleClass =
  "locale-label text-sm font-bold uppercase text-[var(--app-text)]";

/** Small "Product code" label with a copy button and a "Copied" toast. */
export function ProductCode({ code, copy }: { code: string; copy: ProductCopy }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function handleCopy() {
    try {
      await copyText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5 text-xs text-[var(--app-text-muted)]">
        <span className="shrink-0">{copy.productCode}:</span>
        <span className="min-w-0 font-mono break-all text-[var(--app-text-soft)]">{code}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="touch-target inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--app-text-muted)] hover:bg-[var(--app-surface)] hover:text-[var(--app-primary)]"
          aria-label={copy.copyCode}
        >
          {copied ? <Check className="size-3.5 text-[var(--app-primary)]" /> : <Copy className="size-3.5" />}
        </button>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 transition-all duration-200 md:bottom-8 ${
          copied ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {copied ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--app-text)] px-4 py-2 text-sm font-medium text-white shadow-lg">
            <Check className="size-4" />
            {copy.copied}
          </span>
        ) : null}
      </div>
    </>
  );
}

export function QuantityStepper({
  value,
  onChange,
  copy,
  max = 99,
}: {
  value: number;
  /** Receives an updater so rapid taps never read a stale value. */
  onChange: (update: (current: number) => number) => void;
  copy: ProductCopy;
  max?: number;
}) {
  const buttonClass =
    "inline-flex size-11 items-center justify-center rounded-full text-[var(--app-text-soft)] hover:bg-[var(--app-surface)] disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="flex items-center justify-between gap-3">
      <span id="quantity-label" className="text-sm font-medium text-[var(--app-text-muted)]">
        {copy.quantity}
      </span>
      <div
        role="group"
        aria-labelledby="quantity-label"
        className="inline-flex items-center rounded-full border border-[var(--app-border)] bg-white"
      >
        <button
          type="button"
          onClick={() => onChange((current) => Math.max(1, current - 1))}
          disabled={value <= 1}
          className={buttonClass}
          aria-label={copy.decrease}
        >
          <Minus className="size-4" />
        </button>
        <output aria-live="polite" className="w-10 text-center text-base font-semibold text-[var(--app-text)]">
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange((current) => Math.min(max, current + 1))}
          disabled={value >= max}
          className={buttonClass}
          aria-label={copy.increase}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function firstText(value: unknown): string | null {
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : null;
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

/** Specs rows from the dedicated columns, falling back to matching variant attributes. */
export function buildSpecRows(product: PublicProduct, locale: Locale, copy: ProductCopy) {
  const { specs, attributes } = product;
  const km = locale === "km";
  const attr = (...keys: string[]) => {
    for (const key of keys) {
      const match = Object.entries(attributes).find(([name]) => name.toLowerCase() === key.toLowerCase());
      const value = match ? firstText(match[1]) : null;
      if (value) return value;
    }
    return null;
  };

  const rows = [
    { label: copy.specLength, value: specs.length ?? attr("length", "ប្រវែង") },
    { label: copy.specVoltage, value: specs.voltage ?? attr("voltage", "វ៉ុល") },
    { label: copy.specWattage, value: specs.wattage ?? attr("wattage", "watt", "វ៉ាត់") },
    {
      label: copy.specColor,
      value: (km ? specs.colorKm ?? specs.color : specs.color ?? specs.colorKm) ?? attr("color", "colour", "ពណ៌"),
    },
    {
      label: copy.specWarranty,
      value: km ? specs.warrantyKm ?? specs.warranty : specs.warranty ?? specs.warrantyKm,
    },
  ];

  // Any other attributes (e.g. "Model") follow the standard specs.
  const used = new Set(["length", "ប្រវែង", "voltage", "វ៉ុល", "wattage", "watt", "វ៉ាត់", "color", "colour", "ពណ៌"]);
  const extra = Object.entries(attributes)
    .filter(([name]) => !used.has(name.toLowerCase()))
    .map(([name, value]) => ({ label: name, value: firstText(value) }));

  return [...rows, ...extra].filter((row): row is { label: string; value: string } => Boolean(row.value?.trim()));
}

export function SpecsTable({ rows, copy }: { rows: Array<{ label: string; value: string }>; copy: ProductCopy }) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className={sectionTitleClass}>{copy.specifications}</h2>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-dashed border-[var(--app-border)] last:border-0">
              <th scope="row" className="w-2/5 py-2.5 pr-3 text-left align-top font-medium text-[var(--app-text-muted)]">
                {row.label}
              </th>
              <td className="py-2.5 text-right align-top font-semibold break-words text-[var(--app-text-soft)]">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DeliveryReturns({
  locale,
  copy,
  warranty,
}: {
  locale: Locale;
  copy: ProductCopy;
  warranty: string | null;
}) {
  const deliveryArea = STORE_INFO.deliveryArea[locale];
  const hours = STORE_INFO.hours[locale];
  const rowClass = "flex items-start gap-3 text-sm leading-relaxed text-[var(--app-text-soft)]";
  const iconClass = "mt-0.5 size-4 shrink-0 text-[var(--app-primary)]";

  return (
    <section className={`${sectionCardClass} space-y-4`} aria-labelledby="delivery-returns-title">
      <h2 id="delivery-returns-title" className={sectionTitleClass}>
        {copy.deliveryReturns}
      </h2>
      <ul className="space-y-3">
        {deliveryArea ? (
          <li className={rowClass}>
            <Truck className={iconClass} />
            <span>
              <span className="font-semibold text-[var(--app-text)]">{deliveryArea}</span>
              <span className="block text-[var(--app-text-muted)]">{copy.deliveryNote}</span>
            </span>
          </li>
        ) : null}
        {hours ? (
          <li className={rowClass}>
            <Clock className={iconClass} />
            <span>{hours}</span>
          </li>
        ) : null}
        {warranty ? (
          <li className={rowClass}>
            <ShieldCheck className={iconClass} />
            <span>
              {copy.specWarranty}: <span className="font-semibold text-[var(--app-text)]">{warranty}</span>
            </span>
          </li>
        ) : null}
        <li className={rowClass}>
          <RotateCcw className={iconClass} />
          <span>
            {copy.returnsNote}{" "}
            {STORE_INFO.returnPolicyHref ? (
              <Link href={STORE_INFO.returnPolicyHref} className="font-semibold text-[var(--app-primary)] underline-offset-2 hover:underline">
                {copy.returnPolicy}
              </Link>
            ) : (
              <a
                href={TELEGRAM_OWNER_URL}
                target="_blank"
                rel="noreferrer"
                className="touch-target inline-flex items-center gap-1 font-semibold text-[var(--app-primary)] underline-offset-2 hover:underline"
              >
                <TelegramIcon className="size-3.5" />
                Telegram
              </a>
            )}
          </span>
        </li>
      </ul>
    </section>
  );
}
