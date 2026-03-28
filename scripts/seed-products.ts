import { config as loadEnv } from "dotenv";
import { products } from "../src/data/products";
import { upsertProducts } from "../src/db/queries/products";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

function isMissingProductsTableError(error: unknown) {
  return !!(
    error &&
    typeof error === "object" &&
    "cause" in error &&
    error.cause &&
    typeof error.cause === "object" &&
    "code" in error.cause &&
    error.cause.code === "42P01"
  );
}

async function main() {
  const result = await upsertProducts(products);
  console.info(`[neon] Seeded ${result.count} products.`);
}

main().catch((error) => {
  if (isMissingProductsTableError(error)) {
    console.error(
      "[neon] Product seed failed: the products table does not exist yet. Run `npm run db:push` first, then rerun `npm run seed:products`.",
    );
    process.exit(1);
  }

  console.error("[neon] Product seed failed", error);
  process.exit(1);
});
