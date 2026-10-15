"use client"

import { Mail, Pencil, Phone } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { AssignClientsDialog } from "@/components/admin/assign-clients-dialog"
import { MembershipBadge, NotFound, PersonAvatar, SessionBadge } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useNow } from "@/hooks/use-now"
import { DAY_NAMES, formatClock, formatDate, formatPeso, fullName } from "@/lib/format"
import { membershipStatus } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"

export default function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const now = useNow()
  const trainer = useDb((s) => s.trainers.find((t) => t.id === id))
  const allMembers = useDb((s) => s.members)
  const allSessions = useDb((s) => s.sessions)
  const allPlans = useDb((s) => s.workoutPlans)

  const clients = useMemo(() => allMembers.filter((m) => m.trainerId === id), [allMembers, id])
  const sessions = useMemo(
    () =>
      allSessions
        .filter((s) => s.trainerId === id)
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [allSessions, id]
  )
  const plans = useMemo(() => allPlans.filter((w) => w.trainerId === id), [allPlans, id])
  const memberName = useMemo(() => new Map(allMembers.map((m) => [m.id, fullName(m)])), [allMembers])

  if (!trainer) return <NotFound what="trainer" />
  const completed = sessions.filter((s) => s.status === "completed").length

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <PersonAvatar person={trainer} className="size-14 text-lg" />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold tracking-tight uppercase [font-stretch:115%]">{fullName(trainer)}</h1>
            <div className="flex flex-wrap gap-1.5">
              {trainer.specializations.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/trainers/${trainer.id}/edit`}>
            <Pencil /> Edit profile
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="text-muted-foreground">{trainer.bio || "No bio yet."}</p>
            <span className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" /> {trainer.phone}
            </span>
            <span className="flex items-center gap-2 break-all">
              <Mail className="size-4 shrink-0 text-muted-foreground" /> {trainer.email}
            </span>
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="rounded-lg bg-muted p-2">
                <div className="text-xl font-bold">{clients.length}</div>
                <div className="text-xs text-muted-foreground">Clients</div>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <div className="text-xl font-bold">{completed}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <div className="text-xl font-bold">{formatPeso(trainer.ratePerSession)}</div>
                <div className="text-xs text-muted-foreground">Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>Bookable hours, set by the trainer</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm">
            {trainer.availability.map((a) => (
              <div key={a.day} className="flex justify-between">
                <span className={a.enabled ? "" : "text-muted-foreground"}>{DAY_NAMES[a.day]}</span>
                <span className={a.enabled ? "font-mono" : "text-muted-foreground"}>
                  {a.enabled ? `${formatClock(a.start)} – ${formatClock(a.end)}` : "Off"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workout plans</CardTitle>
            <CardDescription>{plans.length} created</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {plans.length === 0 && <p className="text-sm text-muted-foreground">No plans yet.</p>}
            {plans.map((p) => (
              <div key={p.id} className="rounded-lg border p-3">
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-muted-foreground">
                  {p.goal} · {p.exercises.length} exercises · {p.memberIds.length} assigned
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>Members assigned to {trainer.firstName}</CardDescription>
          <CardAction>
            <AssignClientsDialog trainer={trainer} />
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {clients.length === 0 && <p className="text-sm text-muted-foreground">No clients assigned yet.</p>}
          {clients.map((m) => (
            <Link key={m.id} href={`/admin/members/${m.id}`} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
              <PersonAvatar person={m} />
              <span className="flex-1 truncate text-sm font-medium">{fullName(m)}</span>
              <MembershipBadge status={membershipStatus(m, now)} />
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="pb-0">
        <CardHeader>
          <CardTitle>Session history</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden sm:table-cell">Focus</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.slice(0, 25).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="pl-6">
                  {formatDate(s.date)} <span className="text-muted-foreground">· {formatClock(s.time)}</span>
                </TableCell>
                <TableCell>{memberName.get(s.memberId) ?? "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{s.focus}</TableCell>
                <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">{s.notes || "—"}</TableCell>
                <TableCell>
                  <SessionBadge status={s.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
