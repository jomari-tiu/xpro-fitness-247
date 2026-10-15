"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { CheckboxGroupField, NumberField, TextField, TextareaField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { useCurrentTrainer } from "@/hooks/use-current"
import { fullName } from "@/lib/format"
import { workoutPlanSchema, type WorkoutPlanValues } from "@/lib/schemas"
import { useDb } from "@/lib/store/db"
import type { WorkoutPlan } from "@/lib/types"

const blankExercise = { name: "", sets: 3, reps: "10", rest: "60 s", notes: "" }

export function WorkoutPlanForm({ plan }: { plan?: WorkoutPlan }) {
  const router = useRouter()
  const trainer = useCurrentTrainer()!
  const members = useDb((s) => s.members)
  const save = useDb((s) => s.saveWorkoutPlan)
  const clients = members.filter((m) => m.trainerId === trainer.id)

  const form = useForm<WorkoutPlanValues>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: plan
      ? { title: plan.title, goal: plan.goal, description: plan.description, daysPerWeek: plan.daysPerWeek, exercises: plan.exercises, memberIds: plan.memberIds }
      : { title: "", goal: "", description: "", daysPerWeek: 3, exercises: [blankExercise], memberIds: [] },
  })
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: "exercises" })

  const onSubmit = (v: WorkoutPlanValues) => {
    save(plan?.id ?? null, trainer.id, v)
    toast.success(plan ? "Plan updated" : "Plan created", {
      description: v.memberIds.length ? `Assigned to ${v.memberIds.length} client(s).` : undefined,
    })
    router.push("/trainer/plans")
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="title" label="Title" placeholder="e.g. Strength Base 5x5" className="sm:col-span-2" />
              <TextField control={form.control} name="goal" label="Goal" placeholder="e.g. Build strength" />
              <NumberField control={form.control} name="daysPerWeek" label="Days per week" step="1" />
              <TextareaField control={form.control} name="description" label="Instructions" rows={3} className="sm:col-span-2" />
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Exercises</CardTitle>
            <CardDescription>Order matters: members follow this list top to bottom.</CardDescription>
            <CardAction>
              <Button type="button" size="sm" variant="outline" onClick={() => append(blankExercise)}>
                <Plus /> Add exercise
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {fields.map((f, i) => (
              <div key={f.id} className="rounded-xl border p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon-xs" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Move down"
                      disabled={i === fields.length - 1}
                      onClick={() => move(i, i + 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label="Remove exercise" onClick={() => remove(i)}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-[2fr_80px_100px_100px]">
                  <TextField control={form.control} name={`exercises.${i}.name`} label="Exercise" placeholder="Back squat" />
                  <NumberField control={form.control} name={`exercises.${i}.sets`} label="Sets" step="1" />
                  <TextField control={form.control} name={`exercises.${i}.reps`} label="Reps" placeholder="8-10" />
                  <TextField control={form.control} name={`exercises.${i}.rest`} label="Rest" placeholder="90 s" />
                  <TextField control={form.control} name={`exercises.${i}.notes`} label="Coaching notes" className="sm:col-span-4" />
                </div>
              </div>
            ))}
            {form.formState.errors.exercises?.root && <FieldError errors={[form.formState.errors.exercises.root]} />}
            {form.formState.errors.exercises?.message && <FieldError>{form.formState.errors.exercises.message}</FieldError>}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Assign to clients</CardTitle>
            <CardDescription>Assigned members get a notification and see this plan in their portal.</CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have no clients yet. Ask the front desk to assign members to you.</p>
            ) : (
              <CheckboxGroupField
                control={form.control}
                name="memberIds"
                label="Clients"
                columns={1}
                options={clients.map((m) => ({ value: m.id, label: fullName(m), hint: m.code }))}
              />
            )}
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {plan ? "Save plan" : "Create plan"}
          </Button>
        </div>
      </div>
    </form>
  )
}
