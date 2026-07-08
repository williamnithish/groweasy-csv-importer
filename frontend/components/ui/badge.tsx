import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium font-mono tracking-tight",
  {
    variants: {
      variant: {
        neutral: "bg-surface-raised text-ink-muted border border-border-strong",
        good: "bg-signal-green/10 text-signal-green",
        bad: "bg-signal-red/10 text-signal-red",
        warn: "bg-amber/10 text-amber-soft",
        info: "bg-signal-blue/10 text-signal-blue",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
