import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border border-[#d5d5d4] bg-[#ffffff] px-4 py-3 text-sm text-[#2c2e2a] shadow-xs transition-all duration-200 outline-none resize-none",
          "placeholder:text-[#80827f]",
          "focus-visible:border-[#2c2e2a] focus-visible:ring-2 focus-visible:ring-[#2ba0ff]/20",
          "hover:border-[#2c2e2a]/40",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f5f1e4]/50",
          error && "border-[#ff705d] focus-visible:border-[#ff705d] focus-visible:ring-[#ff705d]/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
