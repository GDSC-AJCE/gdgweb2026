import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#0f172a] text-white hover:bg-[#020617] shadow-sm hover:shadow",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm hover:shadow",
        outline:
          "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-xs",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        link:
          "text-[#2563EB] underline-offset-4 hover:underline",
        google:
          "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md hover:shadow-lg",
        emerald:
          "bg-[#10B981] text-white hover:bg-[#059669] shadow-sm hover:shadow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        pill: "h-10 rounded-full px-5 text-sm",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
