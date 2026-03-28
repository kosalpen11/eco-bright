import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getActiveProducts } from "@/db/queries/products";

export async function getStorefrontProducts() {
  noStore();
  return getActiveProducts();
}
