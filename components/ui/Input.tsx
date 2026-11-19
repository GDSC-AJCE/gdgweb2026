import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-input bg-card px-4 py-2 text-sm text-foreground shadow-xs transition-all duration-200 outline-none",
          "placeholder:text-muted-foreground",
          "focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/20",
          "hover:border-foreground/30",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
          error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
