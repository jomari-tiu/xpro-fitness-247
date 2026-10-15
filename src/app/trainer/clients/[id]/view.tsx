"use client"

import { ArrowLeft, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { ProgressPanel } from "@/components/progress/progress-panel"
import { MembershipBadge, NotFound, PersonAvatar, SessionBadge } from "@/components/shared"
import { CompleteSessionDialog } from "@/components/trainer/complete-session-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutPlanCard } from "@/components/workout-plan-card"
import { useCurrentTrainer } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { formatClock, formatDate, fullName } from "@/lib/format"
import { membershipStatus, sessionDateTime } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"

export default function TrainerClientPage() {
  const { id } = useParams<{ id: string }>()
  const now = useNow()
  const trainer = useCurrentTrainer()!
  const member = useDb((s) => s.members.find((m) => m.id === id && m.trainerId === trainer.id))
  const allPlans = useDb((s) => s.workoutPlans)
  const allSessions = useDb((s) => s.sessions)
  const plans = useMemo(() => allPlans.filter((p) => p.memberIds.includes(id)), [allPlans, id])
  const sessions = useMemo(
    () =>
      allSessions
        .filter((s) => s.memberId === id && s.trainerId === trainer.id)
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [allSessions, id, trainer.id]
  )

  if (!member) return <NotFound what="client" />

  return (
    <>
      <Button variant="ghost" asChild className="self-start">
        <Link href="/trainer/clients">
          <ArrowLeft /> All clients
        </Link>
      </Button>
      <div className="flex flex-wrap items-center gap-4">
        <PersonAvatar person={member} className="size-14 text-lg" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight uppercase [font-stretch:115%]">{fullName(member)}</h1>
            <MembershipBadge status={membershipStatus(member, now)} />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" /> {member.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5" /> {member.email}
            </span>
          </div>
        </div>
      </div>
      {member.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes from the front desk</CardTitle>
            <CardDescription>{member.notes}</CardDescription>
          </CardHeader>
        </Card>
      )}
      <Tabs defaultValue="progress" className="gap-4">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="plans">Workout plans ({plans.length})</TabsTrigger>
          <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="progress">
          <ProgressPanel memberId={member.id} loggedBy="trainer" canDelete />
        </TabsContent>
        <TabsContent value="plans" className="flex flex-col gap-4">
          {plans.length === 0 && (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No plan assigned.{" "}
              <Link href="/trainer/plans/new" className="text-primary underline">
                Create one
              </Link>
            </p>
          )}
          {plans.map((p) => (
            <WorkoutPlanCard key={p.id} plan={p} />
          ))}
        </TabsContent>
        <TabsContent value="sessions">
          <Card>
            <CardContent className="flex flex-col gap-2">
              {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
              {sessions.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                  <div className="flex flex-1 flex-col">
                    <span className="font-medium">
                      {formatDate(s.date)} · {formatClock(s.time)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.focus}
                      {s.notes && ` — ${s.notes}`}
                    </span>
                  </div>
                  {s.status === "booked" && sessionDateTime(s) <= now ? (
                    <CompleteSessionDialog session={s} memberName={fullName(member)} />
                  ) : (
                    <SessionBadge status={s.status} />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
