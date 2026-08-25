import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border bg-background/50",
        tierA:
          "border-rose-200/90 bg-gradient-to-r from-rose-100/90 to-red-50 text-rose-900 font-bold shadow-xs",
        tierB:
          "border-amber-200/90 bg-gradient-to-r from-amber-100/80 to-amber-50 text-amber-900 font-bold shadow-xs",
        tierC:
          "border-slate-200 bg-slate-100/90 text-slate-700 font-semibold",
        success:
          "border-emerald-200/80 bg-gradient-to-r from-emerald-100/80 to-emerald-50 text-emerald-800 font-semibold shadow-xs",
        brand:
          "border-rose-300/40 bg-rose-50 text-rose-800 font-semibold",
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
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
