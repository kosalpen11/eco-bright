import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/components/locale/locale-provider";
import { Bebas_Neue, Noto_Sans_Khmer, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SHOP_DESCRIPTION, SHOP_NAME } from "@/lib/constants";
import { DEFAULT_LOCALE, LOCALE_COOKIE_KEY, resolveLocale } from "@/lib/locale";
import {
  DEFAULT_THEME,
  THEME_ATTRIBUTE,
  THEME_CLASS_DARK,
  THEME_STORAGE_KEY,
} from "@/lib/theme";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const notoSansKhmer = Noto_Sans_Khmer({
  variable: "--font-noto-sans-khmer",
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const themeInitScript = `(() => {
  try {
    const stored = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    const theme = stored === "dark" ? "dark" : ${JSON.stringify(DEFAULT_THEME)};
    const root = document.documentElement;
    root.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)}, theme);
    root.classList.toggle(${JSON.stringify(THEME_CLASS_DARK)}, theme === "dark");
  } catch {
    const root = document.documentElement;
    root.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)}, ${JSON.stringify(DEFAULT_THEME)});
    root.classList.remove(${JSON.stringify(THEME_CLASS_DARK)});
  }
})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SHOP_NAME,
    template: `%s | ${SHOP_NAME}`,
  },
  description: SHOP_DESCRIPTION,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
  keywords: [
    "LED storefront",
    "solar products",
    "Telegram ordering",
    "Cambodia lighting store",
    "solar flood lights",
    "solar street lights",
  ],
  openGraph: {
    title: SHOP_NAME,
    description: SHOP_DESCRIPTION,
    type: "website",
    siteName: SHOP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SHOP_NAME,
    description: SHOP_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  const locale = resolveLocale(cookieLocale ?? DEFAULT_LOCALE);

  return (
    <html
      lang={locale}
      data-locale={locale}
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${outfit.variable} ${notoSansKhmer.variable} ${bebasNeue.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-app-bg text-app-text">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
