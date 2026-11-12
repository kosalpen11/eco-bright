import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { TelegramIcon } from "@/components/layout/site-header";
import { TELEGRAM_OWNER_URL } from "@/lib/constants";

/** Shared layout for error and not-found pages, in the storefront's card style. */
export function StatusPage({
  icon: Icon,
  title,
  body,
  primaryAction,
  backLabel,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  primaryAction?: ReactNode;
  backLabel: string;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--app-bg)] px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          <Icon className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-[var(--app-text)]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">{body}</p>
        <div className="mt-6 flex flex-col gap-2">
          {primaryAction}
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--app-border)] bg-white px-5 text-sm font-semibold text-[var(--app-text-soft)] hover:bg-[var(--app-surface)]"
          >
            {backLabel}
          </Link>
          <a
            href={TELEGRAM_OWNER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 text-sm font-semibold text-[var(--app-primary)] hover:underline"
          >
            <TelegramIcon className="size-4" />
            Telegram
          </a>
        </div>
      </div>
    </main>
  );
}
