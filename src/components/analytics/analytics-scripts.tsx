import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

/**
 * Loads Google Analytics 4 only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 * `lazyOnload` keeps it off the critical path; clicks before it loads are queued by `track()`.
 */
export function AnalyticsScripts() {
  if (!GA_ID || !/^G-[A-Z0-9]+$/i.test(GA_ID)) return null;

  return (
    <>
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      {/* Tiny inline init runs early so `config` precedes any queued click events. */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag(){dataLayer.push(arguments);};
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
