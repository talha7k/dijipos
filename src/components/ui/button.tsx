import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-input/30  shadow-xs hover:bg-input/50 hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Enhanced color variants for better contrast and consistency
        primary: "bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-700",
        success: "bg-green-600 text-white shadow-xs hover:bg-green-700 focus-visible:ring-green-500/20 dark:bg-green-600 dark:hover:bg-green-700",
        warning: "bg-yellow-600 text-white shadow-xs hover:bg-yellow-700 focus-visible:ring-yellow-500/20 dark:bg-yellow-600 dark:hover:bg-yellow-700",
        danger: "bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-500/20 dark:bg-red-600 dark:hover:bg-red-700",
        // Status-specific colors matching the enums
        yellow: "bg-yellow-500 text-white shadow-xs hover:bg-yellow-600 focus-visible:ring-yellow-500/20 dark:bg-yellow-500 dark:hover:bg-yellow-600",
        orange: "bg-orange-500 text-white shadow-xs hover:bg-orange-600 focus-visible:ring-orange-500/20 dark:bg-orange-500 dark:hover:bg-orange-600",
        green: "bg-green-500 text-white shadow-xs hover:bg-green-600 focus-visible:ring-green-500/20 dark:bg-green-500 dark:hover:bg-green-600",
        purple: "bg-purple-600 text-white shadow-xs hover:bg-purple-700 focus-visible:ring-purple-500/20 dark:bg-purple-600 dark:hover:bg-purple-700",
        indigo: "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 focus-visible:ring-indigo-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700",
        pink: "bg-pink-600 text-white shadow-xs hover:bg-pink-700 focus-visible:ring-pink-500/20 dark:bg-pink-600 dark:hover:bg-pink-700",
        cyan: "bg-cyan-600 text-white shadow-xs hover:bg-cyan-700 focus-visible:ring-cyan-500/20 dark:bg-cyan-600 dark:hover:bg-cyan-700",
        teal: "bg-teal-600 text-white shadow-xs hover:bg-teal-700 focus-visible:ring-teal-500/20 dark:bg-teal-600 dark:hover:bg-teal-700",
        lime: "bg-lime-600 text-white shadow-xs hover:bg-lime-700 focus-visible:ring-lime-500/20 dark:bg-lime-600 dark:hover:bg-lime-700",
        // Gradient variants for special buttons
        gradient: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xs hover:from-blue-700 hover:to-purple-700 focus-visible:ring-purple-500/20",
        gradientSuccess: "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-xs hover:from-green-700 hover:to-teal-700 focus-visible:ring-teal-500/20",
        gradientWarning: "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-xs hover:from-yellow-700 hover:to-orange-700 focus-visible:ring-orange-500/20",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || loading;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {typeof children === 'string' ? (
            <span>{children.replace(/^(Sign In|Sign Up|Create|Save|Update|Delete|Reset|Send)/, '$1ing...')}</span>
          ) : (
            <span>Loading...</span>
          )}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
