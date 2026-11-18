"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { ProductCard } from "@/components/catalog/ProductCard";
import { getUiText } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import type { PublicProduct } from "@/lib/public-products";

/** Below this width (Tailwind `lg`) the catalog scrolls forever instead of showing page links. */
const MOBILE_QUERY = "(max-width: 1023px)";

type CatalogPageResponse =
  | { ok: true; products: PublicProduct[]; page: number; hasMore: boolean }
  | { ok: false; message: string };

/**
 * Phones: appends the next catalog page (same filters, same page size) when the reader nears the
 * end of the grid. Desktop renders nothing here and keeps the numbered pagination.
 * Remount it (via `key`) when filters change so it starts over from the server-rendered page.
 */
export function MobileInfiniteProducts({
  locale,
  initialPage,
  total,
  pageSize,
  initialIds,
  query,
}: {
  locale: Locale;
  initialPage: number;
  total: number;
  pageSize: number;
  /** Products already on screen, so a shifted listing never shows a card twice. */
  initialIds: string[];
  /** Current listing filters, as /api/catalog query parameters. */
  query: Record<string, string | null>;
}) {
  const copy = getUiText(locale).catalogPage;
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialPage * pageSize < total);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const seenIds = useRef(new Set(initialIds));
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setStatus("loading");

    const params = new URLSearchParams();
    for (const [name, value] of Object.entries(query)) {
      if (value) params.set(name, value);
    }
    params.set("page", String(page + 1));

    try {
      const response = await fetch(`/api/catalog?${params.toString()}`);
      const data = (await response.json()) as CatalogPageResponse;
      if (!response.ok || !data.ok) throw new Error("load failed");

      const fresh = data.products.filter((product) => !seenIds.current.has(product.id));
      fresh.forEach((product) => seenIds.current.add(product.id));
      setProducts((current) => [...current, ...fresh]);
      setPage(data.page);
      setHasMore(data.hasMore);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore, page, query]);

  // Start loading a little before the reader reaches the end of the grid.
  useEffect(() => {
    if (!isMobile || !hasMore || status === "error") return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadNext();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isMobile, hasMore, status, loadNext]);

  if (!isMobile || total === 0) return null;

  return (
    <div className="lg:hidden">
      {products.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} analyticsLocation="product_card_more" />
          ))}
        </div>
      ) : null}

      <div ref={sentinelRef} className="flex min-h-16 items-center justify-center py-4" aria-live="polite">
        {status === "loading" ? (
          <span className="inline-flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {copy.loadingMore}
          </span>
        ) : status === "error" ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-sm text-[var(--app-text-muted)]">{copy.loadMoreError}</span>
            <button
              type="button"
              onClick={() => void loadNext()}
              className="inline-flex h-11 items-center rounded-full border border-[var(--app-border)] bg-white px-5 text-sm font-semibold text-[var(--app-text-soft)] hover:bg-[var(--app-surface)]"
            >
              {copy.retry}
            </button>
          </div>
        ) : hasMore ? (
          // Fallback if the observer doesn't fire (e.g. very tall viewport): tap to load.
          <button
            type="button"
            onClick={() => void loadNext()}
            className="inline-flex h-11 items-center rounded-full border border-[var(--app-border)] bg-white px-5 text-sm font-semibold text-[var(--app-text-soft)] hover:bg-[var(--app-surface)]"
          >
            {copy.loadMore}
          </button>
        ) : (
          <span className="text-xs text-[var(--app-text-faint)]">{copy.allLoaded(total)}</span>
        )}
      </div>
    </div>
  );
}
