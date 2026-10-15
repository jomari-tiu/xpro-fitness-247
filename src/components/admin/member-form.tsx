"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { SelectField, SwitchField, TextField, TextareaField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { useActorName } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { formatDate, formatPeso, fullName, isoDate, paymentMethodLabel } from "@/lib/format"
import { memberRegistrationSchema, memberSchema, type MemberRegistrationValues } from "@/lib/schemas"
import { membershipEnd } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import type { Member } from "@/lib/types"

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other / prefer not to say" },
]
const methodOptions = Object.entries(paymentMethodLabel).map(([value, label]) => ({ value, label }))

export function MemberForm({ member }: { member?: Member }) {
  const router = useRouter()
  const now = useNow()
  const actor = useActorName()
  const plans = useDb((s) => s.plans)
  const trainers = useDb((s) => s.trainers)
  const addMember = useDb((s) => s.addMember)
  const updateMember = useDb((s) => s.updateMember)
  const isEdit = !!member

  const form = useForm<MemberRegistrationValues>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: member
      ? { ...member, trainerId: member.trainerId ?? "", paymentMethod: "cash", recordPayment: false }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          gender: "male",
          birthDate: "",
          address: "",
          emergencyName: "",
          emergencyPhone: "",
          planId: plans.find((p) => p.active)?.id ?? "",
          startDate: isoDate(now),
          trainerId: "",
          notes: "",
          paymentMethod: "cash",
          recordPayment: true,
        },
  })

  const [planId, startDate, recordPayment] = useWatch({ control: form.control, name: ["planId", "startDate", "recordPayment"] })
  const plan = plans.find((p) => p.id === planId)

  const onSubmit = (values: MemberRegistrationValues) => {
    if (isEdit) {
      // memberSchema strips the registration-only payment fields
      updateMember(member.id, memberSchema.parse(values))
      toast.success("Member updated")
      router.push(`/admin/members/${member.id}`)
      return
    }
    const { memberId, paymentId } = addMember(values, actor)
    toast.success(`${values.firstName} ${values.lastName} registered`, {
      description: paymentId ? "Payment recorded. Receipt is ready to print." : undefined,
      action: paymentId ? { label: "Receipt", onClick: () => router.push(`/admin/payments/${paymentId}`) } : undefined,
    })
    router.push(`/admin/members/${memberId}`)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Basic profile used for check-ins and receipts.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="firstName" label="First name" autoComplete="given-name" />
              <TextField control={form.control} name="lastName" label="Last name" autoComplete="family-name" />
              <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
              <TextField control={form.control} name="phone" label="Mobile number" type="tel" placeholder="09171234567" />
              <SelectField control={form.control} name="gender" label="Gender" options={genderOptions} />
              <TextField control={form.control} name="birthDate" label="Birth date" type="date" max={isoDate(now)} />
              <TextField control={form.control} name="address" label="Address" className="sm:col-span-2" />
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Emergency contact</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="emergencyName" label="Contact name" />
              <TextField control={form.control} name="emergencyPhone" label="Contact number" type="tel" placeholder="09171234567" />
              <TextareaField control={form.control} name="notes" label="Notes" placeholder="Injuries, goals, preferences…" className="sm:col-span-2" />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Membership</CardTitle>
            <CardDescription>
              {isEdit ? "Changing the plan or start date recalculates the expiry." : "Choose a plan and start date."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <SelectField
                control={form.control}
                name="planId"
                label="Plan"
                options={plans
                  .filter((p) => p.active || p.id === member?.planId)
                  .map((p) => ({ value: p.id, label: `${p.name} · ${formatPeso(p.price)}` }))}
              />
              <TextField control={form.control} name="startDate" label="Start date" type="date" />
              {plan && /^\d{4}-\d{2}-\d{2}$/.test(startDate) && (
                <p className="rounded-lg bg-muted px-3 py-2 text-sm">
                  Valid until <strong>{formatDate(membershipEnd(startDate, plan.durationDays))}</strong>
                  <span className="text-muted-foreground"> · {plan.durationDays} days</span>
                </p>
              )}
              <SelectField
                control={form.control}
                name="trainerId"
                label="Personal trainer"
                noneLabel="No trainer"
                options={trainers.filter((t) => t.active).map((t) => ({ value: t.id, label: fullName(t) }))}
              />
            </FieldGroup>
          </CardContent>
        </Card>
        {!isEdit && (
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <SwitchField
                  control={form.control}
                  name="recordPayment"
                  label="Record payment now"
                  description={plan ? `Collect ${formatPeso(plan.price)} and issue a receipt.` : undefined}
                />
                {recordPayment && <SelectField control={form.control} name="paymentMethod" label="Payment method" options={methodOptions} />}
              </FieldGroup>
            </CardContent>
          </Card>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {isEdit ? "Save changes" : "Register member"}
          </Button>
        </div>
      </div>
    </form>
  )
}
