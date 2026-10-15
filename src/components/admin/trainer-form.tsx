"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { CheckboxGroupField, NumberField, SwitchField, TextField, TextareaField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { SPECIALIZATIONS, trainerSchema, type TrainerValues } from "@/lib/schemas"
import { useDb } from "@/lib/store/db"
import type { Trainer } from "@/lib/types"

export function TrainerForm({ trainer }: { trainer?: Trainer }) {
  const router = useRouter()
  const saveTrainer = useDb((s) => s.saveTrainer)
  const form = useForm<TrainerValues>({
    resolver: zodResolver(trainerSchema),
    defaultValues: trainer ?? {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specializations: [],
      bio: "",
      ratePerSession: 500,
      active: true,
    },
  })

  const onSubmit = (v: TrainerValues) => {
    const id = saveTrainer(trainer?.id ?? null, v)
    toast.success(trainer ? "Trainer updated" : "Trainer added", {
      description: trainer ? undefined : "Default availability is Mon–Fri, 9 AM–5 PM. The trainer can change it.",
    })
    router.push(`/admin/trainers/${id}`)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Shown to members when they book a session.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <TextField control={form.control} name="firstName" label="First name" />
            <TextField control={form.control} name="lastName" label="Last name" />
            <TextField control={form.control} name="email" label="Email (login)" type="email" />
            <TextField control={form.control} name="phone" label="Mobile number" type="tel" placeholder="09171234567" />
            <TextareaField control={form.control} name="bio" label="Bio" rows={4} className="sm:col-span-2" />
            <CheckboxGroupField
              control={form.control}
              name="specializations"
              label="Specializations"
              options={SPECIALIZATIONS.map((s) => ({ value: s, label: s }))}
              className="sm:col-span-2"
            />
          </FieldGroup>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Rates &amp; status</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <NumberField control={form.control} name="ratePerSession" label="Rate per session (₱)" step="1" />
              <SwitchField control={form.control} name="active" label="Active" description="Inactive trainers can't be booked." />
            </FieldGroup>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {trainer ? "Save changes" : "Add trainer"}
          </Button>
        </div>
      </div>
    </form>
  )
}
