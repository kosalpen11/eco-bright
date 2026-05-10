import { neon } from "@neondatabase/serverless";

export interface ProductImageUpdate {
  id: string;
  imageUrls: string[];
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing required env: DATABASE_URL");
  return neon(url);
}

function normalizeUrls(urls: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of urls) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (!/^https?:\/\//i.test(trimmed)) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }

  return out;
}

export async function bulkUpdateProductImages(updates: ProductImageUpdate[]) {
  const sql = getSql();

  const cleaned = updates
    .map((u) => ({
      id: u.id.trim(),
      imageUrls: normalizeUrls(u.imageUrls),
    }))
    .filter((u) => u.id && u.imageUrls.length > 0);

  if (cleaned.length === 0) {
    return { updated: 0 };
  }

  const payload = cleaned.map((u) => ({
    id: u.id,
    image_urls: u.imageUrls,
  }));

  const result = await sql`
    WITH data AS (
      SELECT *
      FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb)
        AS x(id text, image_urls text[])
    )
    UPDATE products p
    SET image_urls = data.image_urls,
        image_url = COALESCE(data.image_urls[1], p.image_url)
    FROM data
    WHERE p.id = data.id
    RETURNING p.id
  `;

  return { updated: result.length };
}
