"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

export function CartHydrator() {
  const hydrate = useCartStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
