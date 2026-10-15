"use client"

import type { LucideIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { initials } from "@/lib/format"
import type { MembershipStatus, SessionStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight uppercase [font-stretch:115%] sm:text-3xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon: LucideIcon
  tone?: "default" | "primary" | "warning" | "danger" | "success"
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">{label}</span>
          <span className="text-3xl leading-none font-extrabold tracking-tight [font-stretch:115%]">{value}</span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            tone === "default" && "bg-muted text-foreground",
            tone === "primary" && "bg-primary/15 text-primary",
            tone === "warning" && "bg-warning/15 text-warning",
            tone === "danger" && "bg-destructive/15 text-destructive",
            tone === "success" && "bg-success/15 text-success"
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  )
}

const statusStyles: Record<MembershipStatus, string> = {
  active: "bg-success/15 text-success",
  expiring: "bg-warning/15 text-warning",
  expired: "bg-destructive/15 text-destructive",
}
const statusLabels: Record<MembershipStatus, string> = { active: "Active", expiring: "Expiring", expired: "Expired" }

export function MembershipBadge({ status }: { status: MembershipStatus }) {
  return <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>
}

const sessionStyles: Record<SessionStatus, string> = {
  booked: "bg-primary/15 text-primary",
  completed: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
  "no-show": "bg-destructive/15 text-destructive",
}

export function SessionBadge({ status }: { status: SessionStatus }) {
  return <Badge className={cn("capitalize", sessionStyles[status])}>{status.replace("-", " ")}</Badge>
}

export function PersonAvatar({
  person,
  className,
}: {
  person: { firstName: string; lastName: string }
  className?: string
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">{initials(person)}</AvatarFallback>
    </Avatar>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{title}</p>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function NotFound({ what }: { what: string }) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
      This {what} could not be found. It may have been deleted.
    </div>
  )
}
