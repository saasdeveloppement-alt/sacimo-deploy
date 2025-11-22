import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-600 text-white [a&]:hover:bg-primary-700 shadow-sm",
        secondary:
          "border-transparent bg-gray-100 text-gray-700 border-gray-200 [a&]:hover:bg-gray-200",
        destructive:
          "border-transparent bg-red-100 text-red-700 border-red-200 [a&]:hover:bg-red-200",
        outline:
          "text-gray-700 border-gray-200 bg-white [a&]:hover:bg-gray-50 [a&]:hover:border-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
