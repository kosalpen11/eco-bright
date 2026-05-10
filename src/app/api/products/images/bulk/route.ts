import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { bulkUpdateProductImages } from "@/lib/db/product-images";

export const runtime = "nodejs";

const updateSchema = z.object({
  id: z.string().min(1),
  imageUrls: z.array(z.string()).min(1),
});

const bodySchema = z.object({
  updates: z.array(updateSchema).min(1).max(2000),
});

function isAuthorized(request: NextRequest) {
  const required = process.env.ADMIN_API_KEY?.trim();
  if (!required) return false;
  const provided = request.headers.get("x-admin-key")?.trim();
  return Boolean(provided && provided === required);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await bulkUpdateProductImages(parsed.data.updates);
  return NextResponse.json({ ok: true, ...result });
}

