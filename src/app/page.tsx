import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/layout/hero";
import { Navbar } from "@/components/layout/navbar";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { getStorefrontProducts } from "@/lib/products";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products: Product[] = [];
  let catalogError: string | null = null;

  try {
    products = await getStorefrontProducts();
  } catch (error) {
    console.error("Failed to load storefront products", error);
    catalogError =
      error instanceof Error
        ? error.message
        : "Failed to load products from Neon.";
  }

  return (
    <div className="relative overflow-x-clip">
      <CartHydrator />
      <Navbar />
      <Hero />
      <StorefrontShell products={products} catalogError={catalogError} />
      <Footer />
    </div>
  );
}
