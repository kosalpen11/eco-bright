"use client";

import { Link2, LoaderCircle } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useLocale } from "@/components/locale/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUiText } from "@/lib/i18n";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/product";

interface ParseProductLinkResponse {
  ok: true;
  product: Product;
}

interface ParseProductLinkErrorResponse {
  ok: false;
  message?: string;
}

export function PasteLinkForm() {
  const { locale } = useLocale();
  const orderingCopy = getUiText(locale).ordering;
  const addItem = useCartStore((state) => state.addItem);
  const setOrderSource = useCartStore((state) => state.setOrderSource);
  const [url, setUrl] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      new URL(url);
    } catch {
      setError(orderingCopy.invalidLink);
      return;
    }

    setIsResolving(true);

    try {
      const response = await fetch("/api/parse-product-link", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = (await response.json().catch(() => null)) as
        | ParseProductLinkResponse
        | ParseProductLinkErrorResponse
        | null;

      if (!response.ok || !data?.ok) {
        setError(data && "message" in data && data.message ? data.message : orderingCopy.productNotFound);
        return;
      }

      setOrderSource("pasted-link");
      addItem(data.product);
      setSuccess(orderingCopy.addedFromLink(data.product.title));
      setUrl("");
    } catch {
      setError(orderingCopy.productNotFound);
    } finally {
      setIsResolving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-app-border bg-app-surface-2 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 inline-flex size-10 items-center justify-center rounded-2xl border border-app-border bg-app-surface text-app-primary">
          <Link2 className="size-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-app-text">{orderingCopy.pasteLinkTitle}</p>
          <p className="mt-1 text-sm leading-6 text-app-text-muted">
            {orderingCopy.pasteLinkDescription}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={orderingCopy.pasteLinkPlaceholder}
          autoComplete="off"
          spellCheck={false}
        />

        <Button type="submit" size="lg" disabled={isResolving}>
          {isResolving ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              {orderingCopy.resolvingLink}
            </>
          ) : (
            orderingCopy.resolveLink
          )}
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-app-danger">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-app-primary">{success}</p> : null}
    </form>
  );
}
