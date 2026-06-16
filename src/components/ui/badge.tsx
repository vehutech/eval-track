import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]",
        success: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success))]",
        warning: "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning))]",
        destructive: "bg-[hsl(var(--destructive-subtle))] text-[hsl(var(--destructive))]",
        outline: "border border-[hsl(var(--border-strong))] text-[hsl(var(--foreground-muted))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };