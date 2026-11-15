import test from "node:test";
import assert from "node:assert/strict";

import { buildCatalogHref, getCatalogParams } from "@/lib/catalog-url";
import {
  buildMerchantFeedItem,
  buildProductDescription,
  getFeedSkipReasons,
  productJsonLd,
  serializeJsonLd,
  type SeoProduct,
} from "@/lib/structured-data";

function createProduct(overrides: Partial<SeoProduct> = {}): SeoProduct {
  return {
    id: "V_star_audio",
    slug: "led-strip-100m",
    brand: "Grace",
    name: "ខ្សែត LED 100m",
    title: "ខ្សែត LED 100m",
    category: "lights",
    categoryLabel: "Lights",
    categoryLabelKm: "អំពូលភ្លើង",
    description: "អំពូលខ្សែ",
    descriptionKm: null,
    price: 14,
    priceMax: 14,
    currency: "USD",
    available: true,
    imageUrl: "https://example.supabase.co/a.jpg",
    imageUrls: ["https://example.supabase.co/a.jpg", "http://example.supabase.co/b.jpg"],
    variants: [],
    ...overrides,
  };
}

test("single-price product gets an Offer that matches the feed item", () => {
  const product = createProduct();
  const ld = productJsonLd(product);
  const offers = ld.offers as Record<string, unknown>;
  const feed = buildMerchantFeedItem(product)!;

  assert.equal(offers["@type"], "Offer");
  assert.equal(offers.price, "14.00");
  assert.equal(offers.availability, "https://schema.org/InStock");
  assert.equal(feed.price, "14.00 USD");
  assert.equal(feed.title, ld.name);
  assert.equal(feed.description, ld.description);
  assert.equal(feed.link, "https://ecobright.store/products/led-strip-100m");
  assert.deepEqual(ld.image, ["https://example.supabase.co/a.jpg", "https://example.supabase.co/b.jpg"]);
  assert.equal(feed.additionalImageLinks.length, 1);
});

test("price range product gets an AggregateOffer; feed uses the low price", () => {
  const product = createProduct({
    price: 1.05,
    priceMax: 4.75,
    available: false,
    variants: [
      { id: "a", label: "3W", imageUrl: null, price: 1.05, oldPrice: null, attributes: {}, available: false },
      { id: "b", label: "18W", imageUrl: null, price: 4.75, oldPrice: null, attributes: {}, available: false },
    ],
  });
  const offers = productJsonLd(product).offers as Record<string, unknown>;
  assert.equal(offers["@type"], "AggregateOffer");
  assert.equal(offers.lowPrice, "1.05");
  assert.equal(offers.highPrice, "4.75");
  assert.equal(offers.offerCount, 2);
  assert.equal(offers.availability, "https://schema.org/OutOfStock");
  assert.equal(buildMerchantFeedItem(product)!.price, "1.05 USD");
  assert.equal(buildMerchantFeedItem(product)!.availability, "out_of_stock");
});

test("brand is omitted, never invented", () => {
  const ld = productJsonLd(createProduct({ brand: null }));
  assert.equal("brand" in ld, false);
});

test("thin descriptions are padded with real facts only", () => {
  const text = buildProductDescription(createProduct());
  assert.match(text, /^ខ្សែត LED 100m។ អំពូលខ្សែ។ ប្រភេទ៖ អំពូលភ្លើង។ ម៉ាក Grace។/);
});

test("products without image or description are skipped from the feed", () => {
  const product = createProduct({ imageUrl: "/ecobright-logo.jpeg", imageUrls: [], description: "" });
  assert.deepEqual(getFeedSkipReasons(product), ["no-image", "no-description"]);
  assert.equal(buildMerchantFeedItem(product), null);
});

test("JSON-LD cannot close the script tag", () => {
  assert.equal(serializeJsonLd({ name: "</script>" }).includes("</script>"), false);
});

test("catalog hrefs move category into the path", () => {
  assert.equal(buildCatalogHref({ category: "lights", sort: "price-asc", page: null }), "/category/lights?sort=price-asc");
  assert.equal(buildCatalogHref({ category: "all", q: "led" }), "/products?q=led");
  const params = getCatalogParams("/category/fans", new URLSearchParams("page=2"));
  assert.equal(params.get("category"), "fans");
  params.delete("category");
  assert.equal(buildCatalogHref(params), "/products?page=2");
});
