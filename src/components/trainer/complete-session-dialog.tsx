"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { TextareaField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatClock, formatDate } from "@/lib/format"
import { completeSessionSchema, type CompleteSessionValues } from "@/lib/schemas"
import { useDb } from "@/lib/store/db"
import type { TrainingSession } from "@/lib/types"

export function CompleteSessionDialog({ session, memberName }: { session: TrainingSession; memberName: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CheckCircle2 /> Record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record session</DialogTitle>
          <DialogDescription>
            {memberName} · {formatDate(session.date)} at {formatClock(session.time)} · {session.focus}
          </DialogDescription>
        </DialogHeader>
        {open && <CompleteForm session={session} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function CompleteForm({ session, onDone }: { session: TrainingSession; onDone: () => void }) {
  const complete = useDb((s) => s.completeSession)
  const form = useForm<CompleteSessionValues>({
    resolver: zodResolver(completeSessionSchema),
    defaultValues: { status: "completed", notes: "" },
  })
  const onSubmit = (v: CompleteSessionValues) => {
    complete(session.id, v)
    toast.success(v.status === "completed" ? "Session recorded as completed" : "Marked as no-show")
    onDone()
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Field>
              <FieldLabel>Outcome</FieldLabel>
              <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-2">
                {[
                  { value: "completed", label: "Completed" },
                  { value: "no-show", label: "No-show" },
                ].map((o) => (
                  <label
                    key={o.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/5"
                  >
                    <RadioGroupItem value={o.value} /> {o.label}
                  </label>
                ))}
              </RadioGroup>
            </Field>
          )}
        />
        <TextareaField
          control={form.control}
          name="notes"
          label="Session notes"
          rows={4}
          placeholder="What you worked on, loads used, cues, next steps…"
          description="Visible to the member and gym staff."
        />
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}
