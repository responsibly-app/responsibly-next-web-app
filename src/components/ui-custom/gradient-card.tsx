import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientCardProps extends React.ComponentProps<"div"> {
  color?: string
  size?: "default" | "sm"
}

function GradientCard({
  className,
  color = "#3b82f6",
  size = "default",
  style,
  ...props
}: GradientCardProps) {
  return (
    <div
      className={cn("rounded-2xl p-px", className)}
      style={{
        background: `radial-gradient(circle at top left, ${color}99 0%, ${color}33 30%, transparent 65%), oklch(var(--border) / 0.6)`,
        ...style,
      }}
    >
      <div
        data-slot="card"
        data-size={size}
        className="group/card flex flex-col gap-6 overflow-hidden rounded-[calc(1rem-1px)] bg-card py-6 text-sm text-card-foreground has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl"
        style={{
          background: `radial-gradient(circle at top left, ${color}18 0%, transparent 55%), var(--card, hsl(var(--card)))`,
        }}
        {...props}
      />
    </div>
  )
}

function GradientCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-2 rounded-t-xl px-6 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4",
        className
      )}
      {...props}
    />
  )
}

function GradientCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base font-medium", className)}
      {...props}
    />
  )
}

function GradientCardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function GradientCardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function GradientCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  )
}

function GradientCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl px-6 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4",
        className
      )}
      {...props}
    />
  )
}

export {
  GradientCard,
  GradientCardHeader,
  GradientCardFooter,
  GradientCardTitle,
  GradientCardAction,
  GradientCardDescription,
  GradientCardContent,
}
