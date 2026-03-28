import type { LucideIcon } from "lucide-react";
import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = PackageSearch,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid-fade rounded-[2rem] border border-dashed border-app-border bg-app-surface p-8 text-center",
        className,
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <div className="rounded-full border border-app-border bg-app-bg-soft p-4 text-app-secondary">
          <Icon className="size-6" />
        </div>
        <div className="space-y-2">
          <h3 className="locale-display font-display text-3xl uppercase">{title}</h3>
          <p className="text-sm leading-7 text-app-text-muted">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
