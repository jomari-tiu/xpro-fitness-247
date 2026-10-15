"use client"

import { X } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { PageHeader, PersonAvatar, SessionBadge } from "@/components/shared"
import { CompleteSessionDialog } from "@/components/trainer/complete-session-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentTrainer } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { formatClock, formatDate, fullName } from "@/lib/format"
import { sessionDateTime } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"

export default function TrainerSessionsPage() {
  const now = useNow()
  const trainer = useCurrentTrainer()!
  const members = useDb((s) => s.members)
  const allSessions = useDb((s) => s.sessions)
  const cancel = useDb((s) => s.cancelSession)
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const sessions = useMemo(() => {
    const mine = allSessions.filter((s) => s.trainerId === trainer.id)
    const up = mine.filter((s) => s.status === "booked").sort((a, b) => sessionDateTime(a) - sessionDateTime(b))
    const past = mine.filter((s) => s.status !== "booked").sort((a, b) => sessionDateTime(b) - sessionDateTime(a))
    return tab === "upcoming" ? up : past
  }, [allSessions, trainer.id, tab])

  return (
    <>
      <PageHeader title="Sessions" description="Record completed sessions with notes. Members book from their portal." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="upcoming">Booked</TabsTrigger>
          <TabsTrigger value="past">History</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card>
        <CardContent className="flex flex-col gap-2">
          {sessions.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nothing here.</p>}
          {sessions.map((s) => {
            const m = memberById.get(s.memberId)
            if (!m) return null
            const started = sessionDateTime(s) <= now
            return (
              <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <div className="w-32 font-mono text-xs">
                  <div>{formatDate(s.date)}</div>
                  <div className="text-primary">{formatClock(s.time)}</div>
                </div>
                <PersonAvatar person={m} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{fullName(m)}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {s.focus}
                    {s.notes && ` — ${s.notes}`}
                  </span>
                </div>
                {s.status === "booked" ? (
                  <div className="flex gap-2">
                    {!started && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          cancel(s.id)
                          toast.success("Session cancelled")
                        }}
                      >
                        <X /> Cancel
                      </Button>
                    )}
                    {started ? <CompleteSessionDialog session={s} memberName={fullName(m)} /> : <SessionBadge status="booked" />}
                  </div>
                ) : (
                  <SessionBadge status={s.status} />
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </>
  )
}
