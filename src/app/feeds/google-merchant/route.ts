import { loadFeedProducts, renderMerchantFeed } from "@/lib/merchant-feed";

// Data is cached for 1 hour in getCachedFeedProducts; the CDN may also cache the response for 1 hour.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const xml = renderMerchantFeed(await loadFeedProducts());
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    // Never serve an empty feed: Merchant Center would drop every product. 503 keeps the last fetch.
    console.error("[feeds/google-merchant] failed to build feed", error);
    return new Response("Feed temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "600", "Cache-Control": "no-store" },
    });
  }
}
