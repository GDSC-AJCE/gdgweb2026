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
          "flex h-10 w-full rounded-xl border border-[#d5d5d4] bg-white px-3.5 py-2 text-sm text-[#2c2e2a] shadow-xs transition-all duration-200",
          "placeholder:text-[#80827f]",
          "focus-visible:outline-none focus-visible:border-[#4285F4] focus-visible:ring-3 focus-visible:ring-[#4285F4]/20",
          "hover:border-[#a0a29f]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f5f1e4]/50",
          "file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-[#2c2e2a]",
          error && "border-[#EA4335] focus-visible:border-[#EA4335] focus-visible:ring-[#EA4335]/20",
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
