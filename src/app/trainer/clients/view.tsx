"use client"

import { Users } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { EmptyState, MembershipBadge, PageHeader, PersonAvatar } from "@/components/shared"
import { Card, CardContent } from "@/components/ui/card"
import { useCurrentTrainer } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { formatDate, fullName } from "@/lib/format"
import { membershipStatus } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"

export default function TrainerClientsPage() {
  const now = useNow()
  const trainer = useCurrentTrainer()!
  const members = useDb((s) => s.members)
  const progress = useDb((s) => s.progress)
  const sessions = useDb((s) => s.sessions)
  const plans = useDb((s) => s.workoutPlans)

  const clients = useMemo(
    () =>
      members
        .filter((m) => m.trainerId === trainer.id)
        .map((m) => {
          const logs = progress.filter((p) => p.memberId === m.id).sort((a, b) => a.date.localeCompare(b.date))
          const first = logs[0]
          const last = logs.at(-1)
          return {
            m,
            last,
            change: first && last && logs.length > 1 ? Math.round((last.weight - first.weight) * 10) / 10 : null,
            done: sessions.filter((s) => s.memberId === m.id && s.trainerId === trainer.id && s.status === "completed").length,
            plans: plans.filter((p) => p.memberIds.includes(m.id)).map((p) => p.title),
          }
        }),
    [members, progress, sessions, plans, trainer.id]
  )

  return (
    <>
      <PageHeader title="My clients" description="Members assigned to you by the front desk." />
      {clients.length === 0 && (
        <EmptyState icon={Users} title="No clients yet" description="When the front desk assigns members to you, they will appear here." />
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map(({ m, last, change, done, plans }) => (
          <Link key={m.id} href={`/trainer/clients/${m.id}`}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <PersonAvatar person={m} className="size-11" />
                  <div className="flex flex-1 flex-col">
                    <span className="font-semibold">{fullName(m)}</span>
                    <span className="text-xs text-muted-foreground">until {formatDate(m.endDate)}</span>
                  </div>
                  <MembershipBadge status={membershipStatus(m, now)} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted p-2">
                    <div className="font-bold">{last ? `${last.weight}` : "—"}</div>
                    <div className="text-[11px] text-muted-foreground">kg now</div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <div className={change == null ? "font-bold" : change <= 0 ? "font-bold text-success" : "font-bold text-warning"}>
                      {change == null ? "—" : `${change > 0 ? "+" : ""}${change}`}
                    </div>
                    <div className="text-[11px] text-muted-foreground">kg change</div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <div className="font-bold">{done}</div>
                    <div className="text-[11px] text-muted-foreground">sessions</div>
                  </div>
                </div>
                <p className="truncate text-xs text-muted-foreground">{plans.length ? plans.join(", ") : "No workout plan assigned"}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
