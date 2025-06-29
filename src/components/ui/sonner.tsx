
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-quikle-charcoal group-[.toaster]:border-quikle-silver group-[.toaster]:shadow-luxury group-[.toaster]:backdrop-blur-none",
          description: "group-[.toast]:text-quikle-slate",
          actionButton:
            "group-[.toast]:bg-quikle-primary group-[.toast]:text-white group-[.toast]:hover:bg-quikle-secondary",
          cancelButton:
            "group-[.toast]:bg-quikle-crystal group-[.toast]:text-quikle-charcoal group-[.toast]:hover:bg-quikle-silver group-[.toast]:border-quikle-silver",
          success: "group-[.toast]:bg-emerald-50 group-[.toast]:text-emerald-800 group-[.toast]:border-emerald-300",
          error: "group-[.toast]:bg-red-50 group-[.toast]:text-red-800 group-[.toast]:border-red-300",
          warning: "group-[.toast]:bg-amber-50 group-[.toast]:text-amber-800 group-[.toast]:border-amber-300",
          info: "group-[.toast]:bg-quikle-crystal group-[.toast]:text-quikle-charcoal group-[.toast]:border-quikle-primary/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
