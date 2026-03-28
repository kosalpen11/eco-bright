import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "locale-chip inline-flex items-center rounded-full px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.24em]",
  {
    variants: {
      tone: {
        neutral: "border border-app-border bg-app-surface-2 text-app-text-muted",
        new: "border border-app-accent bg-app-accent-soft text-app-accent",
        hot: "border border-app-danger bg-app-danger-soft text-app-danger",
        sale: "border border-app-secondary bg-app-secondary-soft text-app-secondary",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ tone, className }))} {...props} />;
}
