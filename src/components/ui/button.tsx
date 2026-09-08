import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25",
        secondary:
          "border-2 border-navy/25 bg-white text-navy shadow-sm hover:border-navy/40 hover:bg-navy-light hover:shadow-md",
        accent:
          "bg-brand-dark text-white shadow-md hover:bg-brand hover:shadow-brand/20",
        ghost: "text-navy/80 hover:bg-navy-light/80 hover:text-navy",
        outline:
          "border border-gray-200/80 bg-white/90 text-navy shadow-sm backdrop-blur-sm hover:border-navy/25 hover:bg-navy-light/40 hover:shadow-soft",
        link: "text-brand underline-offset-4 hover:text-brand-dark hover:underline p-0 h-auto font-semibold",
        linkSecondary:
          "text-navy underline-offset-4 hover:text-navy-dark hover:underline p-0 h-auto font-semibold",
        destructive: "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg",
        success: "bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-lg",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
