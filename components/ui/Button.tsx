import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[50px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#2c2e2a] text-white hover:bg-[#1f201d] shadow-xs",
        coral:
          "bg-[#ff705d] text-white hover:bg-[#ee6350] shadow-xs",
        destructive:
          "bg-[#ff705d] text-white hover:bg-[#ee6350] shadow-xs",
        outline:
          "border border-[#d5d5d4] bg-[#ffffff] text-[#2c2e2a] hover:bg-[#f5f1e4] hover:border-[#2c2e2a]/30 shadow-xs",
        secondary:
          "bg-[#ffffff] text-[#2c2e2a] border border-[#d5d5d4] hover:bg-[#eae5d7] shadow-xs",
        ghost:
          "text-[#2c2e2a] hover:bg-[#f5f1e4] hover:text-[#2c2e2a]",
        link:
          "text-[#2ba0ff] underline-offset-4 hover:underline",
        grass:
          "bg-[#8ed462] text-[#2c2e2a] hover:bg-[#7ec452] shadow-xs",
        sky:
          "bg-[#2ba0ff] text-white hover:bg-[#208be6] shadow-xs",
        google:
          "bg-[#4285F4] text-white hover:bg-[#3367D6] shadow-xs",
        emerald:
          "bg-[#8ed462] text-[#2c2e2a] hover:bg-[#7ec452] shadow-xs",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-[50px] px-3.5 text-xs",
        lg: "h-12 rounded-[50px] px-7 text-base",
        pill: "h-10 rounded-full px-6 text-sm",
        icon: "h-10 w-10 rounded-full",
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
