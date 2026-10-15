"use client"

import { Dumbbell } from "lucide-react"
import { useMemo } from "react"
import { EmptyState, PageHeader } from "@/components/shared"
import { WorkoutPlanCard } from "@/components/workout-plan-card"
import { useCurrentMember } from "@/hooks/use-current"
import { formatDate, fullName } from "@/lib/format"
import { useDb } from "@/lib/store/db"

export default function PortalWorkoutsPage() {
  const member = useCurrentMember()!
  const allPlans = useDb((s) => s.workoutPlans)
  const trainers = useDb((s) => s.trainers)
  const plans = useMemo(
    () => allPlans.filter((p) => p.memberIds.includes(member.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allPlans, member.id]
  )

  return (
    <>
      <PageHeader title="My workouts" description="Routines your coach assigned to you." />
      {plans.length === 0 && (
        <EmptyState
          icon={Dumbbell}
          title="No routines yet"
          description="Book a session with a trainer and they'll build a plan for you."
        />
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        {plans.map((p) => {
          const t = trainers.find((x) => x.id === p.trainerId)
          return (
            <WorkoutPlanCard
              key={p.id}
              plan={p}
              subtitle={
                <>
                  {p.goal} · {p.daysPerWeek}x per week · by {t ? fullName(t) : "your coach"} · {formatDate(p.createdAt)}
                </>
              }
            />
          )
        })}
      </div>
    </>
  )
}
