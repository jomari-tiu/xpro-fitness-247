"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LineChart as LineChartIcon, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { NumberField, TextField, TextareaField } from "@/components/form-fields"
import { EmptyState } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useNow } from "@/hooks/use-now"
import { formatDate, formatShortDate, isoDate } from "@/lib/format"
import { progressSchema, type ProgressValues } from "@/lib/schemas"
import { useDb } from "@/lib/store/db"
import type { ProgressLog } from "@/lib/types"

const weightConfig = { weight: { label: "Weight (kg)", color: "var(--chart-1)" } } satisfies ChartConfig
const measureConfig = {
  waist: { label: "Waist", color: "var(--chart-1)" },
  chest: { label: "Chest", color: "var(--chart-2)" },
  hips: { label: "Hips", color: "var(--chart-3)" },
  arms: { label: "Arms", color: "var(--chart-4)" },
} satisfies ChartConfig

function delta(logs: ProgressLog[], key: "weight" | "waist" | "bodyFat") {
  const values = logs.map((l) => l[key]).filter((v): v is number => v != null)
  if (values.length < 2) return null
  return Math.round((values[values.length - 1] - values[0]) * 10) / 10
}

/** Progress charts + history + "log measurements" form. Used by admin, trainer and member views. */
export function ProgressPanel({
  memberId,
  loggedBy,
  canDelete = false,
}: {
  memberId: string
  loggedBy: ProgressLog["loggedBy"]
  canDelete?: boolean
}) {
  const all = useDb((s) => s.progress)
  const deleteProgress = useDb((s) => s.deleteProgress)
  const logs = useMemo(
    () => all.filter((p) => p.memberId === memberId).sort((a, b) => a.date.localeCompare(b.date)),
    [all, memberId]
  )
  const chartData = logs.map((l) => ({ ...l, label: formatShortDate(l.date) }))
  const latest = logs.at(-1)

  if (!logs.length) {
    return (
      <EmptyState
        icon={LineChartIcon}
        title="No progress logged yet"
        description="Log weight and body measurements to start tracking changes over time."
        action={<LogProgressDialog memberId={memberId} loggedBy={loggedBy} />}
      />
    )
  }

  const stats = [
    { label: "Current weight", value: `${latest!.weight} kg`, change: delta(logs, "weight"), unit: "kg" },
    { label: "Waist", value: latest!.waist ? `${latest!.waist} cm` : "—", change: delta(logs, "waist"), unit: "cm" },
    { label: "Body fat", value: latest!.bodyFat ? `${latest!.bodyFat}%` : "—", change: delta(logs, "bodyFat"), unit: "%" },
    { label: "Check-ins logged", value: String(logs.length), change: null, unit: "" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className="font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">{s.label}</div>
            <div className="mt-1 text-2xl font-extrabold [font-stretch:115%]">{s.value}</div>
            {s.change != null && (
              <div className={s.change <= 0 ? "text-xs text-success" : "text-xs text-warning"}>
                {s.change > 0 ? "+" : ""}
                {s.change} {s.unit} since start
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weight</CardTitle>
            <CardDescription>Kilograms over time</CardDescription>
            <CardAction>
              <LogProgressDialog memberId={memberId} loggedBy={loggedBy} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weightConfig} className="aspect-auto h-56 w-full">
              <LineChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="weight" type="monotone" stroke="var(--color-weight)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Measurements</CardTitle>
            <CardDescription>Centimeters</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={measureConfig} className="aspect-auto h-56 w-full">
              <LineChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {Object.keys(measureConfig).map((k) => (
                  <Line key={k} dataKey={k} type="monotone" stroke={`var(--color-${k})`} strokeWidth={2} dot={false} connectNulls />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="hidden sm:table-cell">Body fat</TableHead>
              <TableHead className="hidden md:table-cell">Chest / Waist / Hips</TableHead>
              <TableHead className="hidden md:table-cell">Arms / Thighs</TableHead>
              <TableHead className="hidden lg:table-cell">Notes</TableHead>
              <TableHead className="hidden sm:table-cell">By</TableHead>
              {canDelete && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...logs].reverse().map((l) => (
              <TableRow key={l.id}>
                <TableCell>{formatDate(l.date)}</TableCell>
                <TableCell className="font-semibold">{l.weight} kg</TableCell>
                <TableCell className="hidden sm:table-cell">{l.bodyFat != null ? `${l.bodyFat}%` : "—"}</TableCell>
                <TableCell className="hidden font-mono text-xs md:table-cell">
                  {l.chest ?? "—"} / {l.waist ?? "—"} / {l.hips ?? "—"}
                </TableCell>
                <TableCell className="hidden font-mono text-xs md:table-cell">
                  {l.arms ?? "—"} / {l.thighs ?? "—"}
                </TableCell>
                <TableCell className="hidden max-w-xs truncate text-muted-foreground lg:table-cell">{l.notes || "—"}</TableCell>
                <TableCell className="hidden text-xs text-muted-foreground capitalize sm:table-cell">{l.loggedBy}</TableCell>
                {canDelete && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete entry"
                      onClick={() => {
                        deleteProgress(l.id)
                        toast.success("Entry deleted")
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export function LogProgressDialog({ memberId, loggedBy }: { memberId: string; loggedBy: ProgressLog["loggedBy"] }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Log progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log progress</DialogTitle>
          <DialogDescription>Weight is required. Measurements are optional, in centimeters.</DialogDescription>
        </DialogHeader>
        {open && <LogProgressForm memberId={memberId} loggedBy={loggedBy} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function LogProgressForm({
  memberId,
  loggedBy,
  onDone,
}: {
  memberId: string
  loggedBy: ProgressLog["loggedBy"]
  onDone: () => void
}) {
  const now = useNow()
  const logProgress = useDb((s) => s.logProgress)
  const last = useDb((s) =>
    s.progress.filter((p) => p.memberId === memberId).sort((a, b) => b.date.localeCompare(a.date))[0]
  )
  const form = useForm<ProgressValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      date: isoDate(now),
      weight: last?.weight ?? Number.NaN,
      bodyFat: null,
      chest: null,
      waist: null,
      hips: null,
      arms: null,
      thighs: null,
      notes: "",
    },
  })

  const onSubmit = (v: ProgressValues) => {
    logProgress(memberId, v, loggedBy)
    toast.success("Progress logged")
    onDone()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <TextField control={form.control} name="date" label="Date" type="date" max={isoDate(now)} />
          <NumberField control={form.control} name="weight" label="Weight (kg)" step="0.1" />
          <NumberField control={form.control} name="bodyFat" label="Body fat %" step="0.1" nullable />
        </div>
        <FieldSet>
          <FieldLegend variant="label">Measurements (cm)</FieldLegend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <NumberField control={form.control} name="chest" label="Chest" nullable />
            <NumberField control={form.control} name="waist" label="Waist" nullable />
            <NumberField control={form.control} name="hips" label="Hips" nullable />
            <NumberField control={form.control} name="arms" label="Arms" nullable />
            <NumberField control={form.control} name="thighs" label="Thighs" nullable />
          </div>
        </FieldSet>
        <TextareaField control={form.control} name="notes" label="Notes" rows={2} placeholder="How did the week go?" />
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">Save entry</Button>
      </DialogFooter>
    </form>
  )
}
