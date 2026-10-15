"use client"

import { useParams } from "next/navigation"
import { NotFound, PageHeader } from "@/components/shared"
import { WorkoutPlanForm } from "@/components/trainer/workout-plan-form"
import { useCurrentTrainer } from "@/hooks/use-current"
import { useDb } from "@/lib/store/db"

export default function EditWorkoutPlanPage() {
  const { id } = useParams<{ id: string }>()
  const trainer = useCurrentTrainer()!
  const plan = useDb((s) => s.workoutPlans.find((p) => p.id === id && p.trainerId === trainer.id))
  if (!plan) return <NotFound what="workout plan" />
  return (
    <>
      <PageHeader title="Edit workout plan" description={plan.title} />
      <WorkoutPlanForm plan={plan} />
    </>
  )
}
