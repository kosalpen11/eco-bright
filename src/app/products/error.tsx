"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { StatusPage } from "@/components/common/status-page";
import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";

export default function ProductsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { locale } = useLocale();
  const copy = getUiText(locale).states;

  useEffect(() => {
    console.error("Products page error", error);
  }, [error]);

  return (
    <StatusPage
      icon={AlertTriangle}
      title={copy.errorTitle}
      body={copy.errorBody}
      backLabel={copy.backToProducts}
      primaryAction={
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--app-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--app-primary-hover)]"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {copy.retry}
        </button>
      }
    />
  );
}
