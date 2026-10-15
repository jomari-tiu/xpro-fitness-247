"use client"

import { BellRing, CheckCircle2, RefreshCcw, Send } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { toast } from "sonner"
import { RenewDialog } from "@/components/admin/renew-dialog"
import { EmptyState, MembershipBadge, PageHeader, PersonAvatar } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNow } from "@/hooks/use-now"
import { formatDate, fullName } from "@/lib/format"
import { EXPIRING_WINDOW_DAYS, daysLeft, membershipStatus } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import type { Member } from "@/lib/types"

export default function AlertsPage() {
  const now = useNow()
  const members = useDb((s) => s.members)
  const plans = useDb((s) => s.plans)
  const notifications = useDb((s) => s.notifications)
  const sendReminder = useDb((s) => s.sendReminder)

  const { expiring, expired } = useMemo(() => {
    const withDays = members.map((m) => ({ m, d: daysLeft(m, now) }))
    return {
      expiring: withDays.filter((x) => membershipStatus(x.m, now) === "expiring").sort((a, b) => a.d - b.d),
      expired: withDays.filter((x) => x.d < 0).sort((a, b) => b.d - a.d),
    }
  }, [members, now])

  const lastReminder = (memberId: string) =>
    notifications
      .filter((n) => n.memberId === memberId && n.title.startsWith("Membership"))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  const remind = (m: Member, d: number) => {
    const title = d < 0 ? "Membership expired" : "Membership expiring soon"
    const body =
      d < 0
        ? `Your membership expired on ${formatDate(m.endDate)}. Renew at the front desk or message us to keep training.`
        : `Your membership expires ${d === 0 ? "today" : `in ${d} day${d === 1 ? "" : "s"}`} (${formatDate(m.endDate)}). Renew early to avoid interruptions.`
    sendReminder(m.id, title, body)
    toast.success(`Reminder sent to ${m.firstName}`, { description: "It will appear in their member portal." })
  }

  const remindAll = (list: { m: Member; d: number }[]) => {
    list.forEach(({ m, d }) => remind(m, d))
  }

  const section = (title: string, description: string, list: { m: Member; d: number }[]) => (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <CardTitle>
            {title} <span className="text-muted-foreground">({list.length})</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {list.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => remindAll(list)}>
            <Send /> Remind all
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {list.length === 0 && <EmptyState icon={CheckCircle2} title="Nothing here" description="No members in this group right now." />}
        {list.map(({ m, d }) => {
          const last = lastReminder(m.id)
          return (
            <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
              <PersonAvatar person={m} className="size-10" />
              <Link href={`/admin/members/${m.id}`} className="flex min-w-0 flex-1 flex-col hover:underline">
                <span className="font-semibold">{fullName(m)}</span>
                <span className="text-xs text-muted-foreground">
                  {plans.find((p) => p.id === m.planId)?.name} · {m.phone} ·{" "}
                  {d < 0 ? `expired ${-d}d ago` : d === 0 ? "expires today" : `${d}d left`}
                </span>
                {last && <span className="text-xs text-muted-foreground">Last reminded {formatDate(last.createdAt)}</span>}
              </Link>
              <MembershipBadge status={membershipStatus(m, now)} />
              <Button variant="ghost" size="sm" onClick={() => remind(m, d)}>
                <BellRing /> Remind
              </Button>
              <RenewDialog
                member={m}
                trigger={
                  <Button size="sm">
                    <RefreshCcw /> Renew
                  </Button>
                }
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )

  return (
    <>
      <PageHeader
        title="Expiration alerts"
        description={`Members expiring within ${EXPIRING_WINDOW_DAYS} days or already expired. Reminders show up in the member portal.`}
      />
      {section("Expiring soon", `Ends within ${EXPIRING_WINDOW_DAYS} days`, expiring)}
      {section("Expired", "Check-ins are blocked until renewed", expired)}
    </>
  )
}
