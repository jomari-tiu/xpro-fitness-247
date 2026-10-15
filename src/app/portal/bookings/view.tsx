"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { addDays } from "date-fns"
import { CalendarX, X } from "lucide-react"
import { useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { SelectField, TextField } from "@/components/form-fields"
import { PageHeader, PersonAvatar, SessionBadge } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useCurrentMember } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { formatClock, formatDate, formatPeso, fullName, isoDate } from "@/lib/format"
import { bookingSchema, type BookingValues } from "@/lib/schemas"
import { availableSlots, membershipStatus, sessionDateTime } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import { cn } from "@/lib/utils"

const FOCUS = ["Lower body strength", "Upper body push", "Pull day", "Conditioning", "Technique: squat", "Technique: deadlift", "Mobility", "Full body", "Fat loss", "Boxing pads"]

export default function PortalBookingsPage() {
  const now = useNow()
  const member = useCurrentMember()!
  const trainers = useDb((s) => s.trainers)
  const sessions = useDb((s) => s.sessions)
  const book = useDb((s) => s.bookSession)
  const cancel = useDb((s) => s.cancelSession)
  const expired = membershipStatus(member, now) === "expired"

  const activeTrainers = trainers.filter((t) => t.active)
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      trainerId: member.trainerId ?? activeTrainers[0]?.id ?? "",
      date: isoDate(addDays(now, 1)),
      time: "",
      focus: FOCUS[0],
    },
  })
  const [trainerId, date] = useWatch({ control: form.control, name: ["trainerId", "date"] })
  const trainer = trainers.find((t) => t.id === trainerId)
  const slots = useMemo(
    () => (trainer && /^\d{4}-\d{2}-\d{2}$/.test(date) ? availableSlots(trainer.availability, sessions, trainer.id, date, now) : []),
    [trainer, sessions, date, now]
  )

  const mine = useMemo(() => sessions.filter((s) => s.memberId === member.id), [sessions, member.id])
  const upcoming = mine.filter((s) => s.status === "booked" && sessionDateTime(s) > now).sort((a, b) => sessionDateTime(a) - sessionDateTime(b))
  const history = mine.filter((s) => !(s.status === "booked" && sessionDateTime(s) > now)).sort((a, b) => sessionDateTime(b) - sessionDateTime(a))
  const trainerName = (id: string) => {
    const t = trainers.find((x) => x.id === id)
    return t ? fullName(t) : "—"
  }

  const onSubmit = (v: BookingValues) => {
    if (!availableSlots(trainer!.availability, sessions, v.trainerId, v.date, now).includes(v.time)) {
      form.setError("time", { message: "That slot was just taken. Pick another." })
      return
    }
    book(member.id, v)
    toast.success("Session booked", { description: `${formatDate(v.date)} at ${formatClock(v.time)} with ${trainerName(v.trainerId)}` })
    form.reset({ ...v, time: "" })
  }

  return (
    <>
      <PageHeader title="Book a trainer" description="Pick a coach, a day and an open one-hour slot." />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>New booking</CardTitle>
            <CardDescription>
              {expired ? "Your membership has expired. Renew to book sessions." : "Sessions are paid at the front desk after training."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
              <fieldset disabled={expired} className="contents">
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                      control={form.control}
                      name="trainerId"
                      label="Trainer"
                      disabled={expired}
                      options={activeTrainers.map((t) => ({
                        value: t.id,
                        label: `${fullName(t)}${t.id === member.trainerId ? " (your coach)" : ""}`,
                      }))}
                    />
                    <TextField control={form.control} name="date" label="Date" type="date" min={isoDate(now)} max={isoDate(addDays(now, 30))} />
                  </div>
                  {trainer && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {trainer.specializations.map((s) => (
                        <Badge key={s} variant="outline">
                          {s}
                        </Badge>
                      ))}
                      <span>· {formatPeso(trainer.ratePerSession)} / session</span>
                    </div>
                  )}
                  <Controller
                    control={form.control}
                    name="time"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Available slots</FieldLabel>
                        {slots.length === 0 ? (
                          <p className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            <CalendarX className="size-4" /> No open slots that day. Try another date or trainer.
                          </p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {slots.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => field.onChange(t)}
                                aria-pressed={field.value === t}
                                className={cn(
                                  "rounded-lg border px-3 py-2 font-mono text-sm transition-colors hover:border-primary/50",
                                  field.value === t && "border-primary bg-primary text-primary-foreground hover:border-primary"
                                )}
                              >
                                {formatClock(t)}
                              </button>
                            ))}
                          </div>
                        )}
                        <FieldDescription>One-hour sessions.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <SelectField
                    control={form.control}
                    name="focus"
                    label="What do you want to work on?"
                    options={FOCUS.map((f) => ({ value: f, label: f }))}
                  />
                </FieldGroup>
                <Button type="submit" className="self-end" disabled={expired}>
                  Book session
                </Button>
              </fieldset>
            </form>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming sessions.</p>}
            {upcoming.map((s) => {
              const t = trainers.find((x) => x.id === s.trainerId)
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {t && <PersonAvatar person={t} />}
                  <div className="flex flex-1 flex-col">
                    <span className="font-medium">
                      {formatDate(s.date)} · {formatClock(s.time)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {trainerName(s.trainerId)} · {s.focus}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Cancel booking"
                    onClick={() => {
                      cancel(s.id)
                      toast.success("Booking cancelled")
                    }}
                  >
                    <X />
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Session history</CardTitle>
          <CardDescription>Notes from your coach after each session</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {history.length === 0 && <p className="text-sm text-muted-foreground">No past sessions.</p>}
          {history.map((s) => (
            <div key={s.id} className="flex flex-wrap items-start gap-3 rounded-lg border p-3">
              <div className="flex flex-1 flex-col">
                <span className="font-medium">
                  {formatDate(s.date)} · {formatClock(s.time)} · {trainerName(s.trainerId)}
                </span>
                <span className="text-sm text-muted-foreground">{s.focus}</span>
                {s.notes && <span className="mt-1 text-sm">“{s.notes}”</span>}
              </div>
              <SessionBadge status={s.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
