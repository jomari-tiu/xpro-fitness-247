"use client"

import { AlertTriangle, BadgeDollarSign, ScanLine, Users } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { MembershipBadge, PageHeader, PersonAvatar, StatCard } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useNow } from "@/hooks/use-now"
import { formatClock, formatPeso, formatTime, fullName } from "@/lib/format"
import { checkInsByDay, daysLeft, isToday, membershipStatus, revenueByMonth, sumThisMonth } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import { isoDate } from "@/lib/format"

const revenueConfig = {
  memberships: { label: "Memberships", color: "var(--chart-1)" },
  training: { label: "Personal training", color: "var(--chart-2)" },
} satisfies ChartConfig

const checkInConfig = {
  checkIns: { label: "Check-ins", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function AdminDashboard() {
  const now = useNow()
  const members = useDb((s) => s.members)
  const payments = useDb((s) => s.payments)
  const checkIns = useDb((s) => s.checkIns)
  const sessions = useDb((s) => s.sessions)
  const trainers = useDb((s) => s.trainers)
  const plans = useDb((s) => s.plans)

  const stats = useMemo(() => {
    const statuses = members.map((m) => membershipStatus(m, now))
    return {
      active: statuses.filter((s) => s !== "expired").length,
      expiring: statuses.filter((s) => s === "expiring").length,
      expired: statuses.filter((s) => s === "expired").length,
      todayCheckIns: checkIns.filter((c) => isToday(c.at, now)).length,
      revenue: sumThisMonth(payments, now),
    }
  }, [members, checkIns, payments, now])

  const revenue = useMemo(() => revenueByMonth(payments, now), [payments, now])
  const traffic = useMemo(() => checkInsByDay(checkIns, now), [checkIns, now])
  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const trainerById = useMemo(() => new Map(trainers.map((t) => [t.id, t])), [trainers])

  const attention = useMemo(
    () =>
      members
        .filter((m) => membershipStatus(m, now) !== "active")
        .sort((a, b) => a.endDate.localeCompare(b.endDate))
        .reverse()
        .slice(0, 6),
    [members, now]
  )
  const recent = checkIns.slice(0, 6)
  const todaySessions = sessions
    .filter((s) => s.date === isoDate(now) && s.status !== "cancelled")
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Today at XPRO Fitness 24/7"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/attendance">
                <ScanLine /> Check in
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/members/new">
                <Users /> Register member
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active members" value={stats.active} hint={`${members.length} total · ${stats.expired} expired`} icon={Users} tone="primary" />
        <StatCard label="Expiring ≤ 7 days" value={stats.expiring} hint="Send reminders before they lapse" icon={AlertTriangle} tone="warning" />
        <StatCard label="Check-ins today" value={stats.todayCheckIns} hint="Since midnight" icon={ScanLine} tone="success" />
        <StatCard label="Revenue this month" value={formatPeso(stats.revenue)} hint="Memberships + PT" icon={BadgeDollarSign} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="aspect-auto h-64 w-full">
              <BarChart data={revenue} margin={{ left: 4, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => `₱${v / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v, name) => (
                  <div className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">{revenueConfig[name as keyof typeof revenueConfig]?.label}</span>
                    <span className="font-mono">{formatPeso(Number(v))}</span>
                  </div>
                )} />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="memberships" stackId="a" fill="var(--color-memberships)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="training" stackId="a" fill="var(--color-training)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Check-ins</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={checkInConfig} className="aspect-auto h-64 w-full">
              <AreaChart data={traffic} margin={{ left: 4, right: 4 }}>
                <defs>
                  <linearGradient id="fillCheckIns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-checkIns)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-checkIns)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="checkIns" type="monotone" stroke="var(--color-checkIns)" fill="url(#fillCheckIns)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>Expiring and expired memberships</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/alerts">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {attention.length === 0 && <p className="text-sm text-muted-foreground">Everyone is paid up.</p>}
            {attention.map((m) => {
              const d = daysLeft(m, now)
              return (
                <Link key={m.id} href={`/admin/members/${m.id}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60">
                  <PersonAvatar person={m} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{fullName(m)}</span>
                    <span className="text-xs text-muted-foreground">
                      {plans.find((p) => p.id === m.planId)?.name} · {d < 0 ? `expired ${-d}d ago` : d === 0 ? "expires today" : `${d}d left`}
                    </span>
                  </div>
                  <MembershipBadge status={membershipStatus(m, now)} />
                </Link>
              )
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest check-ins</CardTitle>
            <CardDescription>Who&apos;s on the floor</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/attendance">Check-in desk</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {recent.map((c) => {
              const m = memberById.get(c.memberId)
              if (!m) return null
              return (
                <div key={c.id} className="flex items-center gap-3 py-2">
                  <PersonAvatar person={m} />
                  <span className="flex-1 truncate text-sm font-medium">{fullName(m)}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {isToday(c.at, now) ? formatTime(c.at) : new Date(c.at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>PT sessions today</CardTitle>
            <CardDescription>{todaySessions.length} scheduled</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/sessions">All sessions</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {todaySessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions booked today.</p>}
            {todaySessions.map((s) => {
              const m = memberById.get(s.memberId)
              const t = trainerById.get(s.trainerId)
              if (!m || !t) return null
              return (
                <div key={s.id} className="flex items-center gap-3 py-2">
                  <span className="w-16 font-mono text-xs text-primary">{formatClock(s.time)}</span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{fullName(m)}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      with {t.firstName} · {s.focus}
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
