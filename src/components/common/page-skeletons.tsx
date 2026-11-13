"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

const block = "animate-pulse rounded bg-[var(--app-surface-3)] motion-reduce:animate-none";
const card = "rounded-3xl border border-[var(--app-border)] bg-white shadow-sm";

/** Announces the loading state to screen readers in the current language. */
function LoadingStatus() {
  const { locale } = useLocale();
  return (
    <p role="status" className="sr-only">
      {getUiText(locale).states.loading}
    </p>
  );
}

/** Mirrors the product page layout (same heights) so content swaps in without shifting. */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] pb-6 md:pb-12" aria-busy="true">
      <LoadingStatus />
      <SiteHeader loadingCategories />
      <div className="mx-auto w-full max-w-7xl px-4 pt-3 lg:pt-5">
        <div className={`h-4 w-56 sm:h-5 ${block}`} />
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-4 lg:grid-cols-12 lg:gap-6 lg:py-6">
        <div className={`min-w-0 overflow-hidden lg:col-span-7 ${card}`}>
          <div className="h-[22rem] animate-pulse bg-[var(--app-surface)] motion-reduce:animate-none sm:h-[32rem]" />
          <div className="flex gap-2 border-t border-[var(--app-border)] p-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="size-16 shrink-0 animate-pulse rounded-xl bg-[var(--app-surface)] motion-reduce:animate-none" />
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-5 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
          <div className={`${card} space-y-5 p-5 sm:p-6`}>
            <div className={`h-5 w-20 rounded-full ${block}`} />
            <div className="space-y-2">
              <div className={`h-8 w-4/5 ${block}`} />
              <div className={`h-4 w-1/2 ${block}`} />
            </div>
            <div className="border-y border-[var(--app-border)] py-4">
              <div className={`h-9 w-28 ${block}`} />
            </div>
            <div className={`h-11 w-full rounded-full ${block}`} />
            <div className={`h-12 w-full rounded-full ${block}`} />
            <div className={`h-12 w-full rounded-full ${block}`} />
          </div>
          <div className={`${card} h-40`} />
        </div>

        <div className={`${card} h-48 lg:col-span-7 lg:col-start-1`} />
      </div>
    </div>
  );
}

/** Product grid placeholder shown while a catalog filter or page change loads. Same shape as ProductCard. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-[1.4rem] border border-[var(--app-border)] bg-white shadow-[var(--app-shadow-card)]"
        >
          <div className="aspect-[0.92] animate-pulse bg-[var(--app-surface)] motion-reduce:animate-none" />
          <div className="space-y-2 p-3.5">
            <div className={`h-3 w-16 ${block}`} />
            <div className={`h-4 w-full ${block}`} />
            <div className={`h-4 w-2/3 ${block}`} />
            <div className={`mt-3 h-5 w-24 ${block}`} />
            <div className={`h-6 w-20 rounded-full ${block}`} />
            <div className={`mt-4 h-11 w-full rounded-full ${block}`} />
            <div className={`h-11 w-full rounded-full ${block}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
