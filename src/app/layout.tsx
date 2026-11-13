import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { Footer } from "@/components/layout/footer";
import { LocaleProvider } from "@/components/locale/locale-provider";
import { Bebas_Neue, Noto_Sans_Khmer, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { DEFAULT_LOCALE, LOCALE_COOKIE_KEY, resolveLocale } from "@/lib/locale";
import {
  DEFAULT_OG_IMAGE,
  SITE_ALTERNATE_LOCALE,
  SITE_LOCALE,
  SITE_DESCRIPTION_KM,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import {
  DEFAULT_THEME,
  THEME_ATTRIBUTE,
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
  // Display font is only used for a few headings; don't compete with the LCP image.
  preload: false,
});

const themeInitScript = `(() => {
  const root = document.documentElement;
  root.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)}, ${JSON.stringify(DEFAULT_THEME)});
  root.classList.remove("dark");
})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | LED & Solar Cambodia`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION_KM,
  applicationName: SITE_NAME,
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
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    alternateLocale: [SITE_ALTERNATE_LOCALE],
    title: `${SITE_NAME} | LED & Solar Cambodia`,
    description: SITE_DESCRIPTION_KM,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | LED & Solar Cambodia`,
    description: SITE_DESCRIPTION_KM,
    images: [DEFAULT_OG_IMAGE.url],
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
          <LocaleProvider>
            <CartHydrator />
            {children}
            <Footer />
            <AnalyticsScripts />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
