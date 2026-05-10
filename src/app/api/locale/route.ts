import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE_KEY, resolveLocale } from "@/lib/locale";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { locale?: string }
    | null;

  const locale = resolveLocale(body?.locale);

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(LOCALE_COOKIE_KEY, locale, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}

