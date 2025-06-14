
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white shadow-md hover:shadow-luxury hover:from-quikle-primary/90 hover:to-quikle-secondary/90",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:shadow-luxury hover:from-red-700 hover:to-red-800",
        outline: "border border-quikle-silver bg-white hover:bg-gradient-to-r hover:from-quikle-crystal hover:to-quikle-platinum hover:text-quikle-primary shadow-sm hover:shadow-md",
        secondary: "bg-gradient-to-r from-quikle-platinum to-quikle-crystal text-quikle-primary shadow-sm hover:shadow-md hover:from-quikle-silver/50 hover:to-quikle-platinum",
        ghost: "hover:bg-gradient-to-r hover:from-quikle-crystal hover:to-quikle-platinum hover:text-quikle-primary",
        link: "text-quikle-primary underline-offset-4 hover:underline hover:text-quikle-secondary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
