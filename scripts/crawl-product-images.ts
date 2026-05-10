import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

import { bulkUpdateProductImages, type ProductImageUpdate } from "../src/lib/db/product-images";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

type SourceRow = { id: string; url: string };

function parseArgs() {
  const args = process.argv.slice(2);
  const filePath = args.find((arg) => !arg.startsWith("--"));
  if (!filePath) {
    throw new Error(
      "Usage: npx tsx scripts/crawl-product-images.ts ./path/to/sources.json",
    );
  }

  const concurrencyArg = args.find((arg) => arg.startsWith("--concurrency="));
  const concurrency = concurrencyArg ? Number(concurrencyArg.split("=")[1]) : 4;

  const timeoutArg = args.find((arg) => arg.startsWith("--timeoutMs="));
  const timeoutMs = timeoutArg ? Number(timeoutArg.split("=")[1]) : 15000;

  const retriesArg = args.find((arg) => arg.startsWith("--retries="));
  const retries = retriesArg ? Number(retriesArg.split("=")[1]) : 2;

  const dryRun = args.includes("--dry-run");

  const outArg = args.find((arg) => arg.startsWith("--report="));
  const reportPath = outArg ? String(outArg.split("=")[1]) : "artifacts/image-crawl/crawl-report.json";

  const saveUpdatesArg = args.find((arg) => arg.startsWith("--save-updates="));
  const saveUpdatesPath = saveUpdatesArg
    ? String(saveUpdatesArg.split("=")[1])
    : "artifacts/image-crawl/updates.json";

  return {
    filePath,
    concurrency: Number.isFinite(concurrency) ? Math.max(1, Math.floor(concurrency)) : 4,
    timeoutMs: Number.isFinite(timeoutMs) ? Math.max(1000, Math.floor(timeoutMs)) : 15000,
    retries: Number.isFinite(retries) ? Math.max(0, Math.floor(retries)) : 2,
    dryRun,
    reportPath,
    saveUpdatesPath,
  };
}

function loadSources(filePath: string): SourceRow[] {
  const abs = resolve(process.cwd(), filePath);
  let raw: string;
  try {
    raw = readFileSync(abs, "utf8");
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : String(error);
    throw new Error(
      `Cannot read sources file at ${abs}. ` +
        `Create it as a JSON array like scripts/examples/product-image-sources.example.json. ` +
        `Original error: ${message}`,
    );
  }
  const data = JSON.parse(raw) as unknown;
  if (!Array.isArray(data)) {
    throw new Error("Expected JSON array: [{ id, url }]");
  }
  return data as SourceRow[];
}

function uniq<T>(items: T[]) {
  return Array.from(new Set(items));
}

function extractImagesFromHtml(html: string, pageUrl: string) {
  const urls: string[] = [];

  // OpenGraph / Twitter cards.
  for (const re of [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
  ]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      if (m[1]) urls.push(m[1]);
    }
  }

  // Basic <img src|data-src|data-original>.
  for (const re of [
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
    /<img[^>]+data-src=["']([^"']+)["'][^>]*>/gi,
    /<img[^>]+data-original=["']([^"']+)["'][^>]*>/gi,
  ]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      if (m[1]) urls.push(m[1]);
    }
  }

  // Normalize to absolute URLs where possible.
  const absolute = urls
    .map((u) => u.trim())
    .filter(Boolean)
    .map((u) => {
      try {
        return new URL(u, pageUrl).toString();
      } catch {
        return null;
      }
    })
    .filter((u): u is string => Boolean(u))
    .filter((u) => /^https?:\/\//i.test(u));

  // Basic filtering to reduce obvious non-product imagery.
  const filtered = absolute.filter((u) => !/(favicon|apple-touch|logo|icon|sprite|manifest)\b/i.test(u));
  return uniq(filtered);
}

function normalizeSourceUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  // Best-effort: allow "example.com/path" inputs.
  if (/^[a-z0-9.-]+\\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts: { timeoutMs: number; retries: number },
) {
  let attempt = 0;
  let lastErr: unknown = null;
  const maxAttempts = Math.max(1, opts.retries + 1);

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      // Node 20+ supports AbortSignal.timeout; keep a fallback for runtimes that don't.
      const signal =
        typeof (AbortSignal as any)?.timeout === "function"
          ? (AbortSignal as any).timeout(opts.timeoutMs)
          : (() => {
              const controller = new AbortController();
              setTimeout(() => controller.abort(), opts.timeoutMs).unref?.();
              return controller.signal;
            })();

      const res = await fetch(url, { ...init, signal });
      if (res.ok) return res;

      // Retry 429 and transient 5xx.
      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        lastErr = new Error(`Fetch failed ${res.status} for ${url}`);
        const backoff = Math.min(10_000, 500 * Math.pow(2, attempt - 1));
        await sleep(backoff);
        continue;
      }

      throw new Error(`Fetch failed ${res.status} for ${url}`);
    } catch (err) {
      lastErr = err;
      // Only retry on network-ish errors + timeouts.
      if (attempt < maxAttempts) {
        const backoff = Math.min(10_000, 500 * Math.pow(2, attempt - 1));
        await sleep(backoff);
        continue;
      }
      throw lastErr;
    }
  }

  throw lastErr ?? new Error(`Fetch failed for ${url}`);
}

async function crawlOne(source: SourceRow, opts: { timeoutMs: number; retries: number }) {
  const url = normalizeSourceUrl(source.url);
  const id = source.id.trim();
  if (!id || !url) return null;
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(`Invalid URL: ${source.url}`);
  }

  const res = await fetchWithRetry(
    url,
    {
    redirect: "follow",
    headers: {
      "user-agent":
        "EcoBrightImageCrawler/1.0 (+contact: admin@ecobright.local) NodeFetch",
      "accept": "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
    },
    },
    opts,
  );

  const html = await res.text();
  const images = extractImagesFromHtml(html, url);

  // Heuristic: keep the first few; prefer og:image if present by ordering.
  const picked = images.slice(0, 8);

  if (picked.length === 0) return null;
  return { id, imageUrls: picked } satisfies ProductImageUpdate;
}

async function main() {
  const { filePath, concurrency, timeoutMs, retries, dryRun, reportPath, saveUpdatesPath } = parseArgs();
  const sources = loadSources(filePath);

  const queue = sources.slice();
  const updates: ProductImageUpdate[] = [];
  let failures = 0;
  const failureRows: Array<{ id: string; url: string; error: string }> = [];

  async function worker() {
    while (queue.length) {
      const next = queue.shift();
      if (!next) return;

      try {
        const result = await crawlOne(next, { timeoutMs, retries });
        if (result) updates.push(result);
      } catch (err) {
        failures += 1;
        const msg =
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : String(err);
        failureRows.push({ id: next?.id ?? "", url: next?.url ?? "", error: msg });
        console.error("[crawl] Failed", next?.id, next?.url, msg);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  console.info(`[crawl] Crawled ${sources.length} pages. Got updates for ${updates.length}. Failures: ${failures}.`);

  // Write report + extracted updates so failures can be triaged without rerunning.
  try {
    const { mkdirSync, writeFileSync } = await import("node:fs");
    const { dirname } = await import("node:path");
    mkdirSync(dirname(resolve(process.cwd(), reportPath)), { recursive: true });
    writeFileSync(
      resolve(process.cwd(), reportPath),
      JSON.stringify(
        {
          crawled: sources.length,
          updates: updates.length,
          failures,
          failureRows: failureRows.slice(0, 5000),
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );

    mkdirSync(dirname(resolve(process.cwd(), saveUpdatesPath)), { recursive: true });
    writeFileSync(
      resolve(process.cwd(), saveUpdatesPath),
      JSON.stringify(updates, null, 2) + "\n",
      "utf8",
    );
  } catch (err) {
    console.error("[crawl] Failed to write report files", err);
  }

  if (dryRun) {
    console.info("[crawl] --dry-run enabled; skipping DB updates.");
    return;
  }

  if (updates.length) {
    // Bulk apply in batches.
    const batchSize = 200;
    let updated = 0;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const result = await bulkUpdateProductImages(batch);
      updated += result.updated;
      console.info(`[crawl] Applied ${result.updated} updates (batch ${i / batchSize + 1}).`);
    }
    console.info(`[crawl] Done. Updated ${updated} products total.`);
  }
}

main().catch((error) => {
  console.error("[crawl] Crawler failed", error);
  process.exit(1);
});
