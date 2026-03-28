import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  meta?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  accent,
  description,
  meta,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl space-y-3">
        <div className="locale-chip inline-flex items-center gap-2 rounded-full border border-app-accent bg-app-accent-soft px-4 py-2 text-[0.74rem] font-bold uppercase text-app-accent">
          {eyebrow}
        </div>
        <div className="space-y-3">
          <h2 className="locale-display font-display text-[2.7rem] uppercase sm:text-[4rem]">
            {title} <span className="text-app-accent">{accent}</span>
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-app-text-muted sm:text-base">
            {description}
          </p>
        </div>
      </div>
      {meta ? (
        <div className="locale-chip rounded-full border border-app-border bg-app-surface-2 px-4 py-2 text-sm font-semibold uppercase text-app-text-muted">
          {meta}
        </div>
      ) : null}
    </div>
  );
}
