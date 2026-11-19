import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        coral:
          "bg-coral-pop text-white hover:brightness-95 shadow-xs",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-95 shadow-xs",
        outline:
          "border border-border bg-card text-foreground hover:bg-muted hover:border-foreground/30 shadow-xs",
        secondary:
          "bg-card text-foreground border border-border hover:bg-muted shadow-xs",
        ghost:
          "text-foreground hover:bg-muted hover:text-foreground",
        link:
          "text-sky-pop underline-offset-4 hover:underline",
        grass:
          "bg-fresh-grass text-ink-black hover:brightness-95 shadow-xs",
        sky:
          "bg-sky-pop text-white hover:brightness-95 shadow-xs",
        google:
          "bg-google-blue text-white hover:brightness-95 shadow-xs",
        emerald:
          "bg-fresh-grass text-ink-black hover:brightness-95 shadow-xs",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-full px-3.5 text-xs",
        lg: "h-12 rounded-full px-7 text-base",
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
  actionDot?: boolean | string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, actionDot, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    const dotColorClass =
      typeof actionDot === "string"
        ? actionDot
        : variant === "coral" || variant === "destructive" || variant === "default" || variant === "sky" || variant === "google"
        ? "bg-white"
        : variant === "grass" || variant === "emerald"
        ? "bg-ink-black"
        : "bg-sky-pop";

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
        {actionDot && (
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-150",
              dotColorClass
            )}
          />
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
