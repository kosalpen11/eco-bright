"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

type NavigateOptions = {
  scroll?: boolean;
  /** Scroll to the top of the product list once the new page has rendered (pagination). */
  scrollToResults?: boolean;
};

interface CatalogNavigation {
  push: (href: string, options?: NavigateOptions) => void;
  replace: (href: string, options?: NavigateOptions) => void;
  isPending: boolean;
}

const CatalogNavigationContext = createContext<CatalogNavigation | null>(null);

export const CATALOG_RESULTS_ID = "catalog-results";

/**
 * Wraps catalog URL changes (filters, sort, search, pagination) in a React transition, so the
 * page can show a progress bar and a skeleton grid while the next server render loads.
 * The first visit is fully server-rendered and never shows the skeleton.
 */
export function CatalogNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const scrollAfterLoad = useRef(false);

  const navigate = useCallback(
    (method: "push" | "replace", href: string, options?: NavigateOptions) => {
      scrollAfterLoad.current = Boolean(options?.scrollToResults);
      if (options?.scrollToResults) {
        // Bring the (skeleton) list into view straight away, not after the load.
        document.getElementById(CATALOG_RESULTS_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      startTransition(() => {
        router[method](href, { scroll: options?.scroll ?? false });
      });
    },
    [router],
  );

  useEffect(() => {
    if (isPending || !scrollAfterLoad.current) return;
    scrollAfterLoad.current = false;
    document.getElementById(CATALOG_RESULTS_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isPending]);

  const value = useMemo<CatalogNavigation>(
    () => ({
      push: (href, options) => navigate("push", href, options),
      replace: (href, options) => navigate("replace", href, options),
      isPending,
    }),
    [navigate, isPending],
  );

  return (
    <CatalogNavigationContext.Provider value={value}>
      <CatalogProgressBar active={isPending} />
      {children}
    </CatalogNavigationContext.Provider>
  );
}

/**
 * Same API as Next's router for push/replace. Inside the catalog it shows loading feedback;
 * elsewhere (e.g. the header search on a product page) it falls back to the plain router.
 */
export function useCatalogRouter(): Pick<CatalogNavigation, "push" | "replace"> {
  const context = useContext(CatalogNavigationContext);
  const router = useRouter();
  return useMemo(
    () =>
      context ?? {
        push: (href: string, options?: NavigateOptions) => router.push(href, { scroll: options?.scroll }),
        replace: (href: string, options?: NavigateOptions) => router.replace(href, { scroll: options?.scroll }),
      },
    [context, router],
  );
}

export function useCatalogPending() {
  return useContext(CatalogNavigationContext)?.isPending ?? false;
}

function CatalogProgressBar({ active }: { active: boolean }) {
  const { locale } = useLocale();

  return (
    <div
      aria-hidden={!active}
      className={`pointer-events-none fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden transition-opacity duration-200 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {active ? (
        <>
          <div className="catalog-progress h-full w-1/3 rounded-full bg-[var(--app-primary)]" />
          <span role="status" className="sr-only">
            {getUiText(locale).states.loading}
          </span>
        </>
      ) : null}
    </div>
  );
}

/** A link that navigates through the catalog transition (falls back to a normal link without JS). */
export function CatalogLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const router = useCatalogRouter();
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        router.push(href, { scroll: false });
      }}
    >
      {children}
    </a>
  );
}

/** Shows the skeleton instead of the results while a catalog navigation is loading. */
export function CatalogResults({ children, skeleton }: { children: ReactNode; skeleton: ReactNode }) {
  const isPending = useCatalogPending();
  return (
    <div id={CATALOG_RESULTS_ID} className="scroll-mt-40" aria-busy={isPending}>
      {isPending ? skeleton : children}
    </div>
  );
}
