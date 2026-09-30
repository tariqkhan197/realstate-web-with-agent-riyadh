import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background,color,border,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-palm-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-palm-900 text-white hover:bg-palm-800 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]",
        secondary: "border border-line-strong bg-white text-ink hover:border-ink-4 hover:bg-canvas",
        ghost: "text-ink-2 hover:bg-ink/[.05] hover:text-ink",
        gold: "bg-gold-600 text-white hover:bg-gold-700",
        soft: "bg-palm-50 text-palm-800 hover:bg-palm-100",
        link: "text-palm-700 underline-offset-4 hover:underline px-0 h-auto",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: { sm: "h-9 rounded-lg px-3 text-[13px]", md: "h-11 rounded-xl px-4 text-sm", lg: "h-12 rounded-xl px-5 text-[15px]", icon: "h-10 w-10 rounded-xl" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";
