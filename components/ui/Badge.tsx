import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        grass:
          "border-transparent bg-fresh-grass text-ink-black hover:brightness-95",
        coral:
          "border-coral-pop/30 bg-coral-pop/15 text-coral-pop font-bold",
        sky:
          "border-sky-pop/30 bg-sky-pop/15 text-sky-pop font-bold",
        yellow:
          "border-sunshine-pop/40 bg-sunshine-pop/15 text-stone-gray font-bold",
        success:
          "border-fresh-grass/30 bg-fresh-grass/15 text-fresh-grass font-bold",
        warning:
          "border-sunshine-pop/40 bg-sunshine-pop/15 text-sunshine-pop font-bold",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:brightness-95 shadow-xs",
        outline:
          "border-border bg-transparent text-foreground hover:bg-muted",
        secondary:
          "border-border bg-muted text-muted-foreground hover:brightness-95",
        google:
          "border-transparent bg-google-blue text-white shadow-xs",
        blue:
          "border-sky-pop/30 bg-sky-pop/15 text-sky-pop font-bold",
        green:
          "border-fresh-grass/30 bg-fresh-grass/15 text-fresh-grass font-bold",
        neutral:
          "border-border bg-card text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  label?: string;
  dot?: boolean;
  icon?: React.ReactNode;
}

function Badge({
  className,
  variant,
  children,
  label,
  dot,
  icon,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children || label}
    </div>
  );
}

export { Badge, badgeVariants };
export default Badge;
