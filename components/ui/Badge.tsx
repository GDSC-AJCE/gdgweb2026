import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#2c2e2a] focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#2c2e2a] text-white hover:bg-[#2c2e2a]/90 shadow-xs",
        grass:
          "border-transparent bg-[#8ed462] text-[#2c2e2a] hover:bg-[#8ed462]/90",
        coral:
          "border-[#ff705d]/30 bg-[#ff705d]/15 text-[#ff705d] font-bold",
        sky:
          "border-[#2ba0ff]/30 bg-[#2ba0ff]/15 text-[#2ba0ff] font-bold",
        yellow:
          "border-[#ffd600]/40 bg-[#ffd600]/15 text-[#80827f] font-bold",
        success:
          "border-[#8ed462]/30 bg-[#8ed462]/15 text-[#5a9e30] font-bold",
        warning:
          "border-[#ffd600]/40 bg-[#ffd600]/15 text-[#80827f] font-bold",
        destructive:
          "border-transparent bg-[#ff705d] text-white hover:bg-[#ff705d]/90 shadow-xs",
        outline:
          "border-[#d5d5d4] bg-transparent text-[#2c2e2a] hover:bg-[#f5f1e4]",
        secondary:
          "border-[#e5e1d5] bg-[#f5f1e4] text-[#80827f] hover:bg-[#e0dbce]",
        // Legacy aliases kept for backward compat
        google:
          "border-transparent bg-[#2ba0ff] text-white shadow-xs",
        blue:
          "border-[#2ba0ff]/30 bg-[#2ba0ff]/15 text-[#2ba0ff] font-bold",
        green:
          "border-[#8ed462]/30 bg-[#8ed462]/15 text-[#5a9e30] font-bold",
        neutral:
          "border-[#e5e1d5] bg-white text-[#2c2e2a]",
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
