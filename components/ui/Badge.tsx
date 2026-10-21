import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#0f172a] text-white hover:bg-black shadow-xs",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200",
        destructive:
          "border-transparent bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-xs",
        outline:
          "border-slate-200 bg-white text-slate-800 hover:border-slate-300",
        google:
          "border-transparent bg-[#2563EB] text-white shadow-xs",
        blue:
          "border-[#2563EB]/30 bg-[#2563EB]/10 text-[#2563EB] font-bold",
        green:
          "border-[#10B981]/30 bg-[#10B981]/15 text-[#059669] font-bold",
        coral:
          "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#DC2626] font-bold",
        yellow:
          "border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#D97706] font-bold",
        neutral:
          "border-slate-200 bg-white text-slate-700",
        success:
          "border-[#10B981]/30 bg-[#10B981]/15 text-[#059669] font-bold",
        warning:
          "border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#D97706] font-bold",
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
