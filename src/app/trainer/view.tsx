"use client"

import { CalendarCheck, CalendarClock, ClipboardList, Users } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { AnnouncementFeed } from "@/components/announcement-feed"
import { PageHeader, PersonAvatar, SessionBadge, StatCard } from "@/components/shared"
import { CompleteSessionDialog } from "@/components/trainer/complete-session-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentTrainer } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { formatClock, formatDate, fullName, isoDate } from "@/lib/format"
import { sessionDateTime } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import { addDays, format } from "date-fns"

export default function TrainerHome() {
  const now = useNow()
  const trainer = useCurrentTrainer()!
  const members = useDb((s) => s.members)
  const allSessions = useDb((s) => s.sessions)
  const allPlans = useDb((s) => s.workoutPlans)

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const clients = members.filter((m) => m.trainerId === trainer.id)
  const sessions = useMemo(() => allSessions.filter((s) => s.trainerId === trainer.id), [allSessions, trainer.id])
  const today = isoDate(now)
  const weekEnd = isoDate(addDays(now, 7))
  const todays = sessions.filter((s) => s.date === today && s.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time))
  const upcoming = sessions
    .filter((s) => s.status === "booked" && s.date > today && s.date <= weekEnd)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const toRecord = sessions.filter((s) => s.status === "booked" && sessionDateTime(s) < now)
  const monthKey = format(now, "yyyy-MM")
  const doneThisMonth = sessions.filter((s) => s.status === "completed" && s.date.startsWith(monthKey)).length

  return (
    <>
      <PageHeader
        title={`Hi, Coach ${trainer.firstName}`}
        description={format(now, "EEEE, MMMM d")}
        actions={
          <Button asChild>
            <Link href="/trainer/plans/new">
              <ClipboardList /> New workout plan
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clients" value={clients.length} icon={Users} tone="primary" />
        <StatCard label="Sessions today" value={todays.length} icon={CalendarClock} tone="success" />
        <StatCard label="Next 7 days" value={upcoming.length} hint="Booked sessions" icon={CalendarCheck} />
        <StatCard label="Completed this month" value={doneThisMonth} hint={`${allPlans.filter((p) => p.trainerId === trainer.id).length} workout plans`} icon={ClipboardList} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {toRecord.length > 0 && (
            <Card className="border-warning/40">
              <CardHeader>
                <CardTitle>Needs recording</CardTitle>
                <CardDescription>Past sessions still marked as booked</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {toRecord.map((s) => {
                  const m = memberById.get(s.memberId)
                  if (!m) return null
                  return (
                    <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                      <PersonAvatar person={m} />
                      <div className="flex flex-1 flex-col">
                        <span className="font-medium">{fullName(m)}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(s.date)} · {formatClock(s.time)} · {s.focus}
                        </span>
                      </div>
                      <CompleteSessionDialog session={s} memberName={fullName(m)} />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s sessions</CardTitle>
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/trainer/sessions">All sessions</Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {todays.length === 0 && <p className="text-sm text-muted-foreground">No sessions today.</p>}
              {todays.map((s) => {
                const m = memberById.get(s.memberId)
                if (!m) return null
                return (
                  <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                    <span className="w-16 font-mono text-sm text-primary">{formatClock(s.time)}</span>
                    <Link href={`/trainer/clients/${m.id}`} className="flex flex-1 flex-col hover:underline">
                      <span className="font-medium">{fullName(m)}</span>
                      <span className="text-xs text-muted-foreground">{s.focus}</span>
                    </Link>
                    {s.status === "booked" && sessionDateTime(s) <= now ? (
                      <CompleteSessionDialog session={s} memberName={fullName(m)} />
                    ) : (
                      <SessionBadge status={s.status} />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Coming up this week</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nothing booked yet.</p>}
              {upcoming.map((s) => {
                const m = memberById.get(s.memberId)
                return (
                  <div key={s.id} className="flex items-center gap-3 py-1.5 text-sm">
                    <span className="w-28 font-mono text-xs text-muted-foreground">
                      {format(new Date(`${s.date}T${s.time}`), "EEE d · h a")}
                    </span>
                    <span className="flex-1 font-medium">{m ? fullName(m) : "—"}</span>
                    <span className="text-muted-foreground">{s.focus}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
        <AnnouncementFeed audience="trainers" />
      </div>
    </>
  )
}
