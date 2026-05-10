import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type ProductRow = { id: string };
type SourceRow = { id: string; url: string };

function parseArgs() {
  const args = process.argv.slice(2);
  const input = args.find((a) => !a.startsWith("--"));
  if (!input) {
    throw new Error(
      "Usage: npx tsx scripts/generate-image-crawl-sources.ts ./path/to/products.json --template=https://example.com/products/{id}",
    );
  }

  const templateArg = args.find((a) => a.startsWith("--template="));
  const template = templateArg ? String(templateArg.split("=").slice(1).join("=")) : "";
  if (!template || !template.includes("{id}")) {
    throw new Error('Missing/invalid --template. It must include "{id}".');
  }

  const outArg = args.find((a) => a.startsWith("--out="));
  const out = outArg
    ? String(outArg.split("=").slice(1).join("="))
    : "artifacts/image-crawl/sources.json";

  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : null;

  return { input, template, out, limit: Number.isFinite(limit) ? Math.max(1, Math.floor(limit!)) : null };
}

function loadProducts(filePath: string): ProductRow[] {
  const abs = resolve(process.cwd(), filePath);
  const raw = readFileSync(abs, "utf8");
  const data = JSON.parse(raw) as unknown;
  if (!Array.isArray(data)) {
    throw new Error("Expected JSON array: [{ id: string, ... }]");
  }
  return data as ProductRow[];
}

function buildSources(products: ProductRow[], template: string): SourceRow[] {
  const out: SourceRow[] = [];
  for (const p of products) {
    const id = String((p as any)?.id ?? "").trim();
    if (!id) continue;
    out.push({ id, url: template.replaceAll("{id}", encodeURIComponent(id)) });
  }
  return out;
}

async function main() {
  const { input, template, out, limit } = parseArgs();
  const products = loadProducts(input);
  const sliced = limit ? products.slice(0, limit) : products;
  const sources = buildSources(sliced, template);

  const outAbs = resolve(process.cwd(), out);
  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, JSON.stringify(sources, null, 2) + "\n", "utf8");

  console.info(`[crawl] Wrote ${sources.length} sources to ${outAbs}`);
  console.info(
    "[crawl] Next: npx tsx scripts/crawl-product-images.ts " +
      out +
      " --concurrency=4 --timeoutMs=15000 --retries=2",
  );
}

main().catch((error) => {
  console.error("[crawl] Generate sources failed", error);
  process.exit(1);
});

