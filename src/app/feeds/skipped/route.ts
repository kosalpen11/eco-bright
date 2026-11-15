import { timingSafeEqual } from "node:crypto";

import { buildSkippedReport, loadFeedProducts } from "@/lib/merchant-feed";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const expected = process.env.FEED_REPORT_TOKEN?.trim();
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : (new URL(request.url).searchParams.get("token") ?? "").trim();

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Products left out of /feeds/google-merchant (no image / price / description), plus data
 * warnings (no brand, thin description). Protected by FEED_REPORT_TOKEN; 404 without it.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const report = buildSkippedReport(await loadFeedProducts());
    return Response.json(report, {
      headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
    });
  } catch (error) {
    console.error("[feeds/skipped] failed to build report", error);
    return Response.json({ error: "Report temporarily unavailable" }, { status: 503 });
  }
}
