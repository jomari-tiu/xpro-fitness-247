"use client"

import { differenceInCalendarDays, format } from "date-fns"
import { Bell, CalendarDays, CheckCheck, Dumbbell, MessageCircle, ScanLine } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { AnnouncementFeed } from "@/components/announcement-feed"
import { MembershipBadge, StatCard } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MESSENGER_URL } from "@/content/landing"
import { useCurrentMember } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { formatClock, formatDate, formatDateTime, fullName, toDate } from "@/lib/format"
import { daysLeft, membershipStatus, sessionDateTime } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import { cn } from "@/lib/utils"

export default function PortalHome() {
  const now = useNow()
  const member = useCurrentMember()!
  const plan = useDb((s) => s.plans.find((p) => p.id === member.planId))
  const trainers = useDb((s) => s.trainers)
  const allNotifications = useDb((s) => s.notifications)
  const allCheckIns = useDb((s) => s.checkIns)
  const allSessions = useDb((s) => s.sessions)
  const markRead = useDb((s) => s.markNotificationsRead)

  const notifications = useMemo(
    () => allNotifications.filter((n) => n.memberId === member.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allNotifications, member.id]
  )
  const monthKey = format(now, "yyyy-MM")
  const visitsThisMonth = allCheckIns.filter((c) => c.memberId === member.id && c.at.startsWith(monthKey)).length
  const nextSession = allSessions
    .filter((s) => s.memberId === member.id && s.status === "booked" && sessionDateTime(s) > now)
    .sort((a, b) => sessionDateTime(a) - sessionDateTime(b))[0]
  const trainer = trainers.find((t) => t.id === member.trainerId)
  const nextTrainer = trainers.find((t) => t.id === nextSession?.trainerId)

  const status = membershipStatus(member, now)
  const left = daysLeft(member, now)
  const total = differenceInCalendarDays(toDate(member.endDate), toDate(member.startDate)) + 1
  const remainingPct = Math.max(0, Math.min(100, (Math.max(left, 0) / total) * 100))
  const unread = notifications.filter((n) => !n.read).length

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs tracking-[.08em] text-muted-foreground uppercase">{format(now, "EEEE, MMMM d")}</span>
        <h1 className="text-3xl font-black tracking-tight uppercase [font-stretch:120%] sm:text-4xl">
          Hey {member.firstName}, <span className="xp-gradient-text">let&apos;s train.</span>
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          className={cn(
            "lg:col-span-2",
            status === "expired" && "border-destructive/40",
            status === "expiring" && "border-warning/40"
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Membership <MembershipBadge status={status} />
            </CardTitle>
            <CardDescription>
              {plan?.name} · {member.code}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-5xl font-black [font-stretch:125%]">{Math.max(left, 0)}</div>
                <div className="text-sm text-muted-foreground">
                  {left < 0 ? `days left · expired on ${formatDate(member.endDate)}` : `days left · valid until ${formatDate(member.endDate)}`}
                </div>
              </div>
              {status !== "active" && (
                <Button asChild>
                  <a href={MESSENGER_URL} target="_blank" rel="noreferrer">
                    <MessageCircle /> Message us to renew
                  </a>
                </Button>
              )}
            </div>
            <Progress value={remainingPct} />
            <p className="text-xs text-muted-foreground">
              Started {formatDate(member.startDate)} · renew at the front desk or via Messenger.
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <StatCard label="Visits this month" value={visitsThisMonth} icon={ScanLine} tone="success" />
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base">Next PT session</CardTitle>
            </CardHeader>
            <CardContent>
              {nextSession ? (
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{format(toDate(`${nextSession.date}T${nextSession.time}`), "EEE, MMM d")} · {formatClock(nextSession.time)}</span>
                  <span className="text-sm text-muted-foreground">
                    with {nextTrainer ? fullName(nextTrainer) : "—"} · {nextSession.focus}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <span className="text-sm text-muted-foreground">Nothing booked.</span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/portal/bookings">
                      <CalendarDays /> Book a trainer
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-4 text-primary" /> Reminders &amp; notifications
              {unread > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{unread} new</span>}
            </CardTitle>
            <CardDescription>Membership reminders and updates from your coach</CardDescription>
            {unread > 0 && (
              <CardAction>
                <Button variant="ghost" size="sm" onClick={() => markRead(member.id)}>
                  <CheckCheck /> Mark all read
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {notifications.length === 0 && <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>}
            {notifications.slice(0, 8).map((n) => (
              <div key={n.id} className={cn("flex gap-3 rounded-lg border p-3", !n.read && "border-primary/40 bg-primary/5")}>
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-muted" : "bg-primary")} />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{n.title}</span>
                  <span className="text-sm text-muted-foreground">{n.body}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{formatDateTime(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <AnnouncementFeed audience="members" limit={4} />
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base">Your coach</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {trainer ? (
                <>
                  <span className="font-semibold">{fullName(trainer)}</span>
                  <span className="text-muted-foreground">{trainer.specializations.join(" · ")}</span>
                  <Button variant="outline" size="sm" className="self-start" asChild>
                    <Link href="/portal/workouts">
                      <Dumbbell /> View my workouts
                    </Link>
                  </Button>
                </>
              ) : (
                <span className="text-muted-foreground">No trainer assigned. Ask the front desk, or book any trainer.</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
