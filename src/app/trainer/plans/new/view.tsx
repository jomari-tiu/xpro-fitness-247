"use client"

import { PageHeader } from "@/components/shared"
import { WorkoutPlanForm } from "@/components/trainer/workout-plan-form"

export default function NewWorkoutPlanPage() {
  return (
    <>
      <PageHeader title="New workout plan" description="Add exercises in order, then pick the clients who should follow it." />
      <WorkoutPlanForm />
    </>
  )
}
