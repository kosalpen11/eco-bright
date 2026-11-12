import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Home > Category > Product trail. The last item is the current page. */
export function Breadcrumbs({ items, label }: { items: BreadcrumbItem[]; label: string }) {
  return (
    <nav aria-label={label} className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-xs text-[var(--app-text-muted)] sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className={isLast ? "min-w-0 truncate" : "flex shrink-0 items-center gap-1"}>
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="touch-target rounded-full font-medium text-[var(--app-text-soft)] hover:text-[var(--app-primary)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="font-medium text-[var(--app-text)]">
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
