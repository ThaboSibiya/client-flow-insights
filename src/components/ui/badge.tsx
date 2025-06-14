
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white hover:shadow-md",
        secondary:
          "border-transparent bg-gradient-to-r from-quikle-crystal to-quikle-platinum text-quikle-primary hover:shadow-md",
        destructive:
          "border-transparent bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-md",
        outline: "text-quikle-primary border-quikle-silver bg-white hover:bg-quikle-crystal",
        success: "border-transparent bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-md",
        warning: "border-transparent bg-gradient-to-r from-quikle-accent to-quikle-neutral text-white hover:shadow-md",
        info: "border-transparent bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white hover:shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
