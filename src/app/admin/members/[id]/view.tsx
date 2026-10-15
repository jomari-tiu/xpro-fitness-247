"use client"

import { CalendarCheck, Mail, MapPin, Pencil, Phone, RefreshCcw, ScanLine, ShieldAlert, Trash2, UserCog } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"
import { RenewDialog } from "@/components/admin/renew-dialog"
import { ProgressPanel } from "@/components/progress/progress-panel"
import { MembershipBadge, NotFound, PersonAvatar, SessionBadge } from "@/components/shared"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNow } from "@/hooks/use-now"
import {
  formatClock,
  formatDate,
  formatDateTime,
  formatPeso,
  fullName,
  paymentMethodLabel,
  paymentTypeLabel,
} from "@/lib/format"
import { daysLeft, isToday, membershipStatus } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import { differenceInCalendarDays } from "date-fns"
import { toDate } from "@/lib/format"

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const now = useNow()
  const member = useDb((s) => s.members.find((m) => m.id === id))
  const plan = useDb((s) => s.plans.find((p) => p.id === member?.planId))
  const trainer = useDb((s) => s.trainers.find((t) => t.id === member?.trainerId))
  const allCheckIns = useDb((s) => s.checkIns)
  const allPayments = useDb((s) => s.payments)
  const allSessions = useDb((s) => s.sessions)
  const trainers = useDb((s) => s.trainers)
  const checkIn = useDb((s) => s.checkIn)
  const deleteMember = useDb((s) => s.deleteMember)

  const checkIns = useMemo(() => allCheckIns.filter((c) => c.memberId === id), [allCheckIns, id])
  const payments = useMemo(
    () => allPayments.filter((p) => p.memberId === id).sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    [allPayments, id]
  )
  const sessions = useMemo(
    () => allSessions.filter((s) => s.memberId === id).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [allSessions, id]
  )

  if (!member) return <NotFound what="member" />

  const status = membershipStatus(member, now)
  const left = daysLeft(member, now)
  const total = differenceInCalendarDays(toDate(member.endDate), toDate(member.startDate)) + 1
  const used = Math.min(100, Math.max(0, ((total - Math.max(left, 0)) / total) * 100))
  const checkedInToday = checkIns.some((c) => isToday(c.at, now))
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const trainerName = (tid: string) => {
    const t = trainers.find((x) => x.id === tid)
    return t ? fullName(t) : "—"
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <PersonAvatar person={member} className="size-14 text-lg" />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight uppercase [font-stretch:115%]">{fullName(member)}</h1>
              <MembershipBadge status={status} />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {member.code} · member since {formatDate(member.joinedAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={status === "expired" || checkedInToday}
            onClick={() => {
              checkIn(member.id)
              toast.success(`${member.firstName} checked in`)
            }}
          >
            <ScanLine /> {checkedInToday ? "Checked in today" : "Check in"}
          </Button>
          <RenewDialog
            member={member}
            trigger={
              <Button>
                <RefreshCcw /> Renew
              </Button>
            }
          />
          <Button variant="outline" asChild>
            <Link href={`/admin/members/${member.id}/edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" aria-label="Delete member">
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {fullName(member)}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the profile, check-ins, sessions and progress logs. Payment records are kept for accounting.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    deleteMember(member.id)
                    toast.success("Member deleted")
                    router.push("/admin/members")
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance ({checkIns.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="sessions">PT sessions ({sessions.length})</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Membership</CardTitle>
              <CardDescription>
                {plan?.name ?? "Unknown plan"} · {formatDate(member.startDate)} → {formatDate(member.endDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-black [font-stretch:120%]">{left < 0 ? 0 : left}</div>
                  <div className="text-sm text-muted-foreground">
                    {left < 0 ? `days left · expired ${-left} days ago` : "days left"}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {checkIns.length} check-ins · {formatPeso(totalPaid)} paid lifetime
                </div>
              </div>
              <Progress value={used} />
              {status !== "active" && (
                <p className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
                  <ShieldAlert className="size-4" />
                  {status === "expired" ? "Membership expired: check-ins are blocked until renewed." : "Membership expires within a week."}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trainer</CardTitle>
            </CardHeader>
            <CardContent>
              {trainer ? (
                <Link href={`/admin/trainers/${trainer.id}`} className="flex items-center gap-3 rounded-lg hover:opacity-80">
                  <PersonAvatar person={trainer} className="size-10" />
                  <div className="flex flex-col">
                    <span className="font-semibold">{fullName(trainer)}</span>
                    <span className="text-xs text-muted-foreground">{trainer.specializations.join(", ")}</span>
                  </div>
                </Link>
              ) : (
                <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <UserCog className="size-4" /> No trainer assigned
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/members/${member.id}/edit`}>Assign trainer</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" /> {member.phone}
              </span>
              <span className="flex items-center gap-2 break-all">
                <Mail className="size-4 shrink-0 text-muted-foreground" /> {member.email}
              </span>
              <span className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {member.address}
              </span>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Emergency: </span>
                {member.emergencyName} · {member.emergencyPhone}
              </div>
              <div>
                <span className="text-muted-foreground">Birth date: </span>
                {formatDate(member.birthDate)}
              </div>
              <div className="capitalize">
                <span className="text-muted-foreground">Gender: </span>
                {member.gender}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{member.notes || "No notes."}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date &amp; time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.length === 0 && (
                  <TableRow>
                    <TableCell className="h-20 text-center text-muted-foreground">No check-ins yet.</TableCell>
                  </TableRow>
                )}
                {checkIns.slice(0, 50).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="flex items-center gap-2">
                      <CalendarCheck className="size-4 text-muted-foreground" /> {formatDateTime(c.at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Receipt</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/admin/payments/${p.id}`)}>
                    <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                    <TableCell>{formatDate(p.paidAt)}</TableCell>
                    <TableCell>{paymentTypeLabel[p.type]}</TableCell>
                    <TableCell className="hidden sm:table-cell">{paymentMethodLabel[p.method]}</TableCell>
                    <TableCell className="text-right font-semibold">{formatPeso(p.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead className="hidden sm:table-cell">Focus</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      No personal training sessions.
                    </TableCell>
                  </TableRow>
                )}
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      {formatDate(s.date)} <span className="text-muted-foreground">· {formatClock(s.time)}</span>
                    </TableCell>
                    <TableCell>{trainerName(s.trainerId)}</TableCell>
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
        </TabsContent>

        <TabsContent value="progress">
          <ProgressPanel memberId={member.id} loggedBy="staff" canDelete />
        </TabsContent>
      </Tabs>
    </>
  )
}
