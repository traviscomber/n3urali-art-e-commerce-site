import type * as React from "react"
import { cn } from "@/lib/utils"

interface AlertProps extends React.ComponentProps<"div"> {
  variant?: "default" | "destructive"
}

function Alert({ className, variant = "default", ...props }: AlertProps) {
  const baseStyles = "relative w-full rounded-lg border px-4 py-3 text-sm"

  const variantStyles = {
    default: "bg-white border-gray-200 text-gray-900",
    destructive: "bg-red-50 border-red-200 text-red-800",
  }

  return <div role="alert" className={cn(baseStyles, variantStyles[variant], className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-medium tracking-tight", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm mt-1", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
