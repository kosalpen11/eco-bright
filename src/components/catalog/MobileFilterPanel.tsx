"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/**
 * On phones the brand / sort / price controls fold behind a compact "Filters" button that sits
 * beside the search box, so the products stay near the top of the screen. From `lg` up the panel
 * uses `display: contents`, so its children sit directly in the parent toolbar row and the button
 * is hidden.
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
        aria-label={open ? labels.hide : labels.show}
        className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition lg:hidden ${
          open || activeCount > 0
            ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary-hover)]"
            : "border-[var(--app-border)] bg-white text-[var(--app-text-soft)] hover:border-[var(--app-border-strong)]"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {labels.show}
          {activeCount > 0 ? (
            <span className="grid min-w-5 place-items-center rounded-full bg-[var(--app-primary)] px-1.5 py-0.5 text-[0.7rem] font-bold leading-none text-white">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Phones: a full-width 2-column panel under the search row. lg+: children join the toolbar row. */}
      <div id={panelId} className={`${open ? "grid" : "hidden"} w-full basis-full grid-cols-2 gap-2 lg:contents`}>
        {children}
      </div>
    </>
  );
}
