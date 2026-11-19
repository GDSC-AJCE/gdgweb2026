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
          "flex min-h-[80px] w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-xs transition-all duration-200 outline-none resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
