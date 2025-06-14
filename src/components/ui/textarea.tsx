
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-quikle-silver bg-gradient-to-r from-white to-quikle-crystal px-3 py-2 text-sm ring-offset-background placeholder:text-quikle-slate/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quikle-primary focus-visible:ring-offset-2 focus-visible:border-quikle-primary transition-all duration-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
