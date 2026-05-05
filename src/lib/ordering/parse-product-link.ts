import { z } from "zod";

export const parseProductLinkRequestSchema = z
  .object({
    url: z.string().trim().url(),
  })
  .strict();

export interface ParsedProductLink {
  lookupKey: string;
  lookupType: "id" | "slug";
  normalizedUrl: string;
}

function decodeLookupKey(value: string) {
  return decodeURIComponent(value).trim();
}

function findLookupFromHash(hash: string) {
  const normalizedHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const [hashPath, hashQuery] = normalizedHash.split("?");
  const params = new URLSearchParams(hashQuery ?? "");

  for (const key of ["productId", "product", "id", "slug"]) {
    const value = params.get(key);
    if (value?.trim()) {
      return {
        lookupKey: decodeLookupKey(value),
        lookupType: key === "slug" ? "slug" : "id",
      } as const;
    }
  }

  const segments = hashPath.split("/").filter(Boolean);
  const candidate = segments.at(-1);
  if (candidate?.trim()) {
    return {
      lookupKey: decodeLookupKey(candidate),
      lookupType: candidate.startsWith("prd_") ? "id" : "slug",
    } as const;
  }

  return null;
}

export function parseProductLink(value: string): ParsedProductLink {
  const url = new URL(value);

  for (const key of ["productId", "product", "id", "slug"]) {
    const candidate = url.searchParams.get(key);
    if (candidate?.trim()) {
      return {
        lookupKey: decodeLookupKey(candidate),
        lookupType: key === "slug" ? "slug" : "id",
        normalizedUrl: url.toString(),
      };
    }
  }

  const hashLookup = findLookupFromHash(url.hash);
  if (hashLookup) {
    return {
      ...hashLookup,
      normalizedUrl: url.toString(),
    };
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const index = segments.findIndex((segment) => segment === "product" || segment === "products");
  const candidate = index >= 0 ? segments[index + 1] : segments.at(-1);

  if (!candidate?.trim()) {
    throw new Error("No product lookup key found in the provided URL.");
  }

  return {
    lookupKey: decodeLookupKey(candidate),
    lookupType: candidate.startsWith("prd_") ? "id" : "slug",
    normalizedUrl: url.toString(),
  };
}
