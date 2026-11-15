import { permanentRedirect } from "next/navigation";
import type { ReactNode } from "react";

import { productPath } from "@/lib/structured-data";

import { getPublicProduct } from "./product-loader";

/**
 * Runs above this segment's loading.tsx, before any HTML streams, so an unknown product is a
 * real 404 and an old id is a real 308 (inside the streamed page they would be a 200).
 */
export default async function ProductLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublicProduct(id);

  // Old links (/products/Grace_LED-Bulb) keep working: 308 to the public slug.
  if (decodeURIComponent(id) !== product.slug) {
    permanentRedirect(productPath(product));
  }

  return children;
}
