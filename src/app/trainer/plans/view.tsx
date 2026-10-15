"use client"

import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { EmptyState, PageHeader } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WorkoutPlanCard } from "@/components/workout-plan-card"
import { useCurrentTrainer } from "@/hooks/use-current"
import { fullName } from "@/lib/format"
import { useDb } from "@/lib/store/db"

export default function TrainerPlansPage() {
  const trainer = useCurrentTrainer()!
  const allPlans = useDb((s) => s.workoutPlans)
  const members = useDb((s) => s.members)
  const remove = useDb((s) => s.deleteWorkoutPlan)
  const plans = allPlans.filter((p) => p.trainerId === trainer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const name = new Map(members.map((m) => [m.id, fullName(m)]))

  return (
    <>
      <PageHeader
        title="Workout plans"
        description="Build training programs and assign them to your clients."
        actions={
          <Button asChild>
            <Link href="/trainer/plans/new">
              <Plus /> New plan
            </Link>
          </Button>
        }
      />
      {plans.length === 0 && (
        <EmptyState icon={ClipboardList} title="No plans yet" description="Create your first workout plan and assign it to clients." />
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        {plans.map((p) => (
          <WorkoutPlanCard
            key={p.id}
            plan={p}
            actions={
              <>
                <Button variant="ghost" size="icon-sm" asChild aria-label="Edit plan">
                  <Link href={`/trainer/plans/${p.id}/edit`}>
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete plan"
                  onClick={() => {
                    remove(p.id)
                    toast.success("Plan deleted")
                  }}
                >
                  <Trash2 />
                </Button>
              </>
            }
            footer={
              <div className="flex flex-wrap gap-1.5">
                {p.memberIds.length === 0 && <span className="text-xs text-muted-foreground">Not assigned</span>}
                {p.memberIds.map((id) => (
                  <Badge key={id} variant="secondary">
                    {name.get(id) ?? "Removed member"}
                  </Badge>
                ))}
              </div>
            }
          />
        ))}
      </div>
    </>
  )
}
