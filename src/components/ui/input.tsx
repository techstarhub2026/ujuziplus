import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, leftIcon, rightIcon, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="space-y-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all placeholder:text-gray-400",
              "focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/15",
              "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-400 focus:border-red-400 focus:ring-red-500/15",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{rightIcon}</div>
          )}
        </div>
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
