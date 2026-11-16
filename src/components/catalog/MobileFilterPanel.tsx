"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/**
 * On phones the brand / sort / price controls fold behind one "Filters" button so the products
 * stay near the top of the screen. From `lg` up the panel uses `display: contents`, so its children
 * sit directly in the parent grid exactly as before and the button is hidden.
 */
export function MobileFilterPanel({
  children,
  activeCount,
  labels,
}: {
  children: ReactNode;
  activeCount: number;
  labels: { show: string; hide: string };
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex h-11 w-full items-center justify-between gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm font-semibold text-[var(--app-text-soft)] hover:border-[var(--app-border-strong)] lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {open ? labels.hide : labels.show}
          {activeCount > 0 ? (
            <span className="grid min-w-5 place-items-center rounded-full bg-[var(--app-primary)] px-1.5 py-0.5 text-[0.7rem] font-bold leading-none text-white">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div id={panelId} className={`${open ? "flex" : "hidden"} min-w-0 flex-col gap-3 lg:contents`}>
        {children}
      </div>
    </>
  );
}
