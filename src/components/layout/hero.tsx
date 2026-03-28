"use client";

import { ArrowRight, MessagesSquare, Search, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";
import { Button } from "@/components/ui/button";
import { getUiText } from "@/lib/i18n";
import { TELEGRAM_PUBLIC_URL } from "@/lib/constants";

export function Hero() {
  const { locale } = useLocale();
  const copy = getUiText(locale).hero;

  return (
    <>
      <section className="hide-on-print relative overflow-hidden pb-10 pt-10 sm:pb-14 sm:pt-14">
        <div className="pointer-events-none absolute inset-0 hero-grid" />
        <div className="pointer-events-none absolute -right-20 top-0 size-72 rounded-full bg-app-primary-soft blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-0 size-64 rounded-full bg-app-secondary-soft blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:px-8">
          <div className="relative z-10 flex flex-col justify-end">
            <div className="locale-chip inline-flex w-fit items-center gap-2 rounded-full border border-app-accent bg-app-accent-soft px-4 py-2 text-[0.74rem] font-bold uppercase text-app-accent">
              <ShieldCheck className="size-4" />
              {copy.badge}
            </div>
            <div className="mt-5 space-y-5">
              <h1 className="locale-display max-w-4xl font-display text-[3.8rem] uppercase text-foreground sm:text-[5.6rem] lg:text-[7rem]">
                {copy.headingPrefix}{" "}
                <span className="text-transparent [-webkit-text-stroke:1.6px_var(--app-accent)]">
                  {copy.headingAccent}
                </span>{" "}
                {copy.headingSuffix}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-app-text-soft sm:text-lg">
                {copy.description}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#store">
                  {copy.browseProducts}
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={TELEGRAM_PUBLIC_URL} target="_blank" rel="noreferrer">
                  {copy.chatTelegram}
                  <MessagesSquare className="size-4" />
                </a>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {copy.highlights.map((highlight) => (
                <div
                  key={highlight.accent}
                  className="locale-chip rounded-full border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text-muted"
                >
                  <span className="font-semibold text-app-secondary">{highlight.accent}</span>{" "}
                  {highlight.text}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid gap-4">
            {copy.cards.map((card) => (
              <div
                key={card.title}
                className="grid-fade rounded-[1.75rem] border border-app-border bg-app-surface p-5 shadow-[var(--app-shadow-card)]"
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="locale-display font-display text-[2.25rem] uppercase text-app-primary">
                      {card.title}
                    </div>
                    <p className="locale-label mt-2 text-sm uppercase text-app-text-faint">
                      {card.text}
                    </p>
                  </div>
                  <span className="text-3xl">{card.icon}</span>
                </div>
              </div>
            ))}

            <div className="rounded-[1.75rem] border border-app-border bg-app-surface-2 p-5">
              <div className="flex items-center gap-3 text-sm text-app-text-muted">
                <Search className="size-4 text-app-secondary" />
                {copy.footnote}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="hide-on-print overflow-hidden border-y border-app-border bg-app-surface">
        <div className="flex w-max min-w-full gap-8 py-4 [animation:marquee_26s_linear_infinite]">
          {Array.from({ length: 2 }).flatMap((_, loop) =>
            copy.marquee.map((item) => (
              <div
                key={`${item}-${loop}`}
                className="locale-display font-display text-xl uppercase text-app-text-muted"
              >
                {item} <span className="mx-2 text-app-accent">★</span>
              </div>
            )),
          )}
        </div>
      </div>
    </>
  );
}
