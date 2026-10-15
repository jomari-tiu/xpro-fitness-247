"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { NumberField, SelectField, TextField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { useActorName } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { formatDate, formatPeso, fullName, paymentMethodLabel } from "@/lib/format"
import { renewalSchema, type RenewalValues } from "@/lib/schemas"
import { membershipEnd, renewalStart } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import type { Member } from "@/lib/types"

const methodOptions = Object.entries(paymentMethodLabel).map(([value, label]) => ({ value, label }))

export function RenewDialog({ member, trigger }: { member: Member; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renew membership</DialogTitle>
          <DialogDescription>
            {fullName(member)} · current period ends {formatDate(member.endDate)}
          </DialogDescription>
        </DialogHeader>
        {open && <RenewForm member={member} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function RenewForm({ member, onDone }: { member: Member; onDone: () => void }) {
  const router = useRouter()
  const now = useNow()
  const actor = useActorName()
  const plans = useDb((s) => s.plans)
  const renew = useDb((s) => s.renewMembership)
  const current = plans.find((p) => p.id === member.planId)

  const form = useForm<RenewalValues>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      memberId: member.id,
      planId: member.planId,
      startDate: renewalStart(member, now),
      amount: current?.price ?? Number.NaN,
      method: "cash",
    },
  })
  const [planId, startDate] = useWatch({ control: form.control, name: ["planId", "startDate"] })
  const plan = plans.find((p) => p.id === planId)

  const onSubmit = (v: RenewalValues) => {
    const paymentId = renew(v, actor)
    toast.success("Membership renewed", {
      description: `${fullName(member)} is active until ${formatDate(membershipEnd(v.startDate, plan!.durationDays))}.`,
      action: { label: "Receipt", onClick: () => router.push(`/admin/payments/${paymentId}`) },
    })
    onDone()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <SelectField
          control={form.control}
          name="planId"
          label="Plan"
          options={plans.filter((p) => p.active).map((p) => ({ value: p.id, label: `${p.name} · ${formatPeso(p.price)}` }))}
        />
        <TextField
          control={form.control}
          name="startDate"
          label="New period starts"
          type="date"
          description="Defaults to the day after the current period ends, or today if already expired."
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberField control={form.control} name="amount" label="Amount (₱)" step="1" />
          <SelectField control={form.control} name="method" label="Method" options={methodOptions} />
        </div>
        {plan && /^\d{4}-\d{2}-\d{2}$/.test(startDate) && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm">
            New expiry: <strong>{formatDate(membershipEnd(startDate, plan.durationDays))}</strong>
          </p>
        )}
      </FieldGroup>
      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (plan) form.setValue("amount", plan.price, { shouldValidate: true })
          }}
        >
          Use plan price
        </Button>
        <Button type="submit">Renew &amp; record payment</Button>
      </DialogFooter>
    </form>
  )
}
