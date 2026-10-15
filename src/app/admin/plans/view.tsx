"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { NumberField, SwitchField, TextField, TextareaField } from "@/components/form-fields"
import { PageHeader } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { formatPeso } from "@/lib/format"
import { planSchema, type PlanValues } from "@/lib/schemas"
import { useDb } from "@/lib/store/db"
import type { Plan } from "@/lib/types"

export default function PlansPage() {
  const plans = useDb((s) => s.plans)
  const members = useDb((s) => s.members)
  const deletePlan = useDb((s) => s.deletePlan)

  return (
    <>
      <PageHeader
        title="Membership plans"
        description="Pricing and duration used for registrations and renewals."
        actions={
          <PlanDialog
            trigger={
              <Button>
                <Plus /> New plan
              </Button>
            }
          />
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => {
          const count = members.filter((m) => m.planId === p.id).length
          return (
            <Card key={p.id} className={p.active ? undefined : "opacity-60"}>
              <CardHeader>
                <CardTitle className="text-lg uppercase [font-stretch:115%]">{p.name}</CardTitle>
                <CardDescription>{p.description}</CardDescription>
                <CardAction className="flex gap-1">
                  <PlanDialog
                    plan={p}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Edit ${p.name}`}>
                        <Pencil />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${p.name}`}
                    onClick={() => {
                      if (deletePlan(p.id)) toast.success("Plan deleted")
                      else toast.error("Plan is in use", { description: "Deactivate it instead, or move members to another plan first." })
                    }}
                  >
                    <Trash2 />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black [font-stretch:120%]">{formatPeso(p.price)}</span>
                  <span className="text-sm text-muted-foreground">/ {p.durationDays} days</span>
                </div>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Check className="size-4 text-primary" /> {perk}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="justify-between text-sm text-muted-foreground">
                <span>{count} member{count === 1 ? "" : "s"}</span>
                {!p.active && <Badge variant="secondary">Inactive</Badge>}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </>
  )
}

function PlanDialog({ plan, trigger }: { plan?: Plan; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? "Edit plan" : "New plan"}</DialogTitle>
          <DialogDescription>Changes apply to new registrations and renewals.</DialogDescription>
        </DialogHeader>
        {open && <PlanForm plan={plan} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function PlanForm({ plan, onDone }: { plan?: Plan; onDone: () => void }) {
  const savePlan = useDb((s) => s.savePlan)
  const form = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: plan
      ? { ...plan, perks: plan.perks.join("\n") }
      : { name: "", durationDays: 30, price: Number.NaN, description: "", perks: "", active: true },
  })
  const onSubmit = (v: PlanValues) => {
    savePlan(plan?.id ?? null, v)
    toast.success(plan ? "Plan updated" : "Plan created")
    onDone()
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <TextField control={form.control} name="name" label="Plan name" placeholder="e.g. Monthly" />
        <div className="grid grid-cols-2 gap-4">
          <NumberField control={form.control} name="durationDays" label="Duration (days)" step="1" />
          <NumberField control={form.control} name="price" label="Price (₱)" step="1" />
        </div>
        <TextField control={form.control} name="description" label="Short description" />
        <TextareaField control={form.control} name="perks" label="Perks" description="One per line." rows={4} />
        <SwitchField control={form.control} name="active" label="Active" description="Inactive plans are hidden from registration." />
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">{plan ? "Save plan" : "Create plan"}</Button>
      </DialogFooter>
    </form>
  )
}
