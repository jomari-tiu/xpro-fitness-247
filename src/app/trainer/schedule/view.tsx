"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, format, startOfWeek } from "date-fns"
import { useMemo } from "react"
import { Controller, useFieldArray, useForm, useWatch, type Control } from "react-hook-form"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCurrentTrainer } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { DAY_NAMES, formatClock, fullName, isoDate } from "@/lib/format"
import { availabilitySchema, type AvailabilityValues } from "@/lib/schemas"
import { useDb } from "@/lib/store/db"
import { cn } from "@/lib/utils"

const ORDER = [1, 2, 3, 4, 5, 6, 0] // Monday first
// Sessions are booked in one-hour slots, so availability is picked by the hour.
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`)
const shortClock = (hhmm: string) => formatClock(hhmm).replace(":00", "")

export default function TrainerSchedulePage() {
  const trainer = useCurrentTrainer()!
  const setAvailability = useDb((s) => s.setAvailability)
  const form = useForm<AvailabilityValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { days: [...trainer.availability].sort((a, b) => a.day - b.day) },
  })
  const { fields } = useFieldArray({ control: form.control, name: "days" })
  const days = useWatch({ control: form.control, name: "days" })

  const onSubmit = (v: AvailabilityValues) => {
    setAvailability(trainer.id, v)
    form.reset(v)
    toast.success("Availability saved", { description: "Members can now book within these hours." })
  }

  return (
    <>
      <PageHeader title="Availability" description="Set the hours members can book you. Sessions are one hour long." />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Card>
            <CardHeader>
              <CardTitle>Weekly hours</CardTitle>
              <CardDescription>Toggle a day off, or pick the start and end hour.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y">
              {ORDER.map((day) => {
                const i = fields.findIndex((f) => f.day === day)
                const enabled = days?.[i]?.enabled
                const err = form.formState.errors.days?.[i]
                return (
                  <div key={fields[i].id} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <label className="flex min-w-32 cursor-pointer items-center gap-3">
                        <Controller
                          control={form.control}
                          name={`days.${i}.enabled`}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-label={`${DAY_NAMES[day]} available`}
                            />
                          )}
                        />
                        <span className={cn("text-sm font-medium", !enabled && "text-muted-foreground")}>
                          {DAY_NAMES[day]}
                        </span>
                      </label>
                      {enabled ? (
                        <div className="flex items-center gap-2">
                          <HourSelect control={form.control} name={`days.${i}.start`} label={`${DAY_NAMES[day]} start`} />
                          <span className="text-sm text-muted-foreground">to</span>
                          <HourSelect control={form.control} name={`days.${i}.end`} label={`${DAY_NAMES[day]} end`} />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unavailable</span>
                      )}
                    </div>
                    {enabled && (err?.end || err?.start) && <FieldError errors={[err.end ?? err.start]} />}
                  </div>
                )
              })}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button type="button" variant="ghost" disabled={!form.formState.isDirty} onClick={() => form.reset()}>
                Discard
              </Button>
              <Button type="submit" disabled={!form.formState.isDirty}>
                Save availability
              </Button>
            </CardFooter>
          </Card>
        </form>
        <WeekView trainerId={trainer.id} />
      </div>
    </>
  )
}

function HourSelect({
  control,
  name,
  label,
}: {
  control: Control<AvailabilityValues>
  name: `days.${number}.start` | `days.${number}.end`
  label: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger className="w-32" aria-label={label} aria-invalid={fieldState.invalid}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {HOURS.map((h) => (
              <SelectItem key={h} value={h}>
                {formatClock(h)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )
}

function WeekView({ trainerId }: { trainerId: string }) {
  const now = useNow()
  const trainer = useDb((s) => s.trainers.find((t) => t.id === trainerId))!
  const sessions = useDb((s) => s.sessions)
  const members = useDb((s) => s.members)
  const name = useMemo(() => new Map(members.map((m) => [m.id, fullName(m)])), [members])
  const monday = startOfWeek(now, { weekStartsOn: 1 })
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const booked = sessions.filter((s) => s.trainerId === trainerId && s.status !== "cancelled")

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>
          {format(monday, "MMM d")} – {format(addDays(monday, 6), "MMM d")} · saved availability and bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {week.map((d) => {
          const a = trainer.availability.find((x) => x.day === d.getDay())
          const key = isoDate(d)
          const list = booked.filter((s) => s.date === key).sort((x, y) => x.time.localeCompare(y.time))
          const isToday = key === isoDate(now)
          return (
            <div
              key={key}
              className={cn(
                "flex items-start gap-4 rounded-lg border p-3",
                isToday && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="flex w-12 shrink-0 flex-col items-center leading-none">
                <span className="text-xs text-muted-foreground uppercase">{format(d, "EEE")}</span>
                <span className="mt-1 text-xl font-bold">{format(d, "d")}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {a?.enabled ? (
                    <span className="font-medium">
                      {shortClock(a.start)} – {shortClock(a.end)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Day off</span>
                  )}
                  {isToday && <Badge className="bg-primary/15 text-primary">Today</Badge>}
                  {list.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      · {list.length} session{list.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                {list.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((s) => (
                      <span
                        key={s.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs whitespace-nowrap",
                          s.status === "booked" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <span className="font-semibold">{shortClock(s.time)}</span>
                        <span>{name.get(s.memberId)?.split(" ")[0] ?? "—"}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
