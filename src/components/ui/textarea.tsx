import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="space-y-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "flex min-h-[120px] w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all placeholder:text-gray-400",
            "focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/15",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
            error && "border-red-400 focus:border-red-400 focus:ring-red-500/15",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
