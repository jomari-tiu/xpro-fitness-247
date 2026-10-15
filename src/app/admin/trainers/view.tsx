"use client"

import { CalendarCheck, Plus, Users } from "lucide-react"
import Link from "next/link"
import { PageHeader, PersonAvatar } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DAY_NAMES, formatPeso, fullName } from "@/lib/format"
import { useDb } from "@/lib/store/db"

export default function TrainersPage() {
  const trainers = useDb((s) => s.trainers)
  const members = useDb((s) => s.members)
  const sessions = useDb((s) => s.sessions)

  return (
    <>
      <PageHeader
        title="Trainers"
        description="Profiles, specializations, clients and schedules."
        actions={
          <Button asChild>
            <Link href="/admin/trainers/new">
              <Plus /> Add trainer
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {trainers.map((t) => {
          const clients = members.filter((m) => m.trainerId === t.id).length
          const completed = sessions.filter((s) => s.trainerId === t.id && s.status === "completed").length
          const days = t.availability.filter((a) => a.enabled).map((a) => DAY_NAMES[a.day].slice(0, 3))
          return (
            <Card key={t.id} className={t.active ? "transition-colors hover:border-primary/40" : "opacity-60"}>
              <CardHeader className="flex flex-row items-center gap-3">
                <PersonAvatar person={t} className="size-12 text-base" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/admin/trainers/${t.id}`} className="truncate text-lg font-bold hover:underline">
                    {fullName(t)}
                  </Link>
                  <span className="text-sm text-muted-foreground">{formatPeso(t.ratePerSession)} / session</span>
                </div>
                {!t.active && <Badge variant="secondary">Inactive</Badge>}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {t.specializations.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{t.bio}</p>
                <p className="font-mono text-xs text-muted-foreground">{days.join(" · ") || "No availability set"}</p>
              </CardContent>
              <CardFooter className="justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <Users className="size-4 text-muted-foreground" /> {clients} clients
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarCheck className="size-4 text-muted-foreground" /> {completed} sessions done
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/trainers/${t.id}`}>Open</Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </>
  )
}
