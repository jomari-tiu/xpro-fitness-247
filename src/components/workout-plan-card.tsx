"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { WorkoutPlan } from "@/lib/types"

export function WorkoutPlanCard({
  plan,
  subtitle,
  actions,
  footer,
}: {
  plan: WorkoutPlan
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="text-lg uppercase [font-stretch:115%]">{plan.title}</CardTitle>
        <CardDescription>
          {subtitle ?? (
            <>
              {plan.goal} · {plan.daysPerWeek}x per week
            </>
          )}
        </CardDescription>
        {actions && <CardAction className="flex gap-1">{actions}</CardAction>}
      </CardHeader>
      {(plan.description || footer) && (
        <CardContent className="flex flex-col gap-3">
          {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
          {footer}
        </CardContent>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Exercise</TableHead>
            <TableHead>Sets</TableHead>
            <TableHead>Reps</TableHead>
            <TableHead className="hidden sm:table-cell">Rest</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plan.exercises.map((e, i) => (
            <TableRow key={i}>
              <TableCell className="pl-6">
                <div className="font-medium">{e.name}</div>
                {e.notes && <div className="text-xs whitespace-normal text-muted-foreground">{e.notes}</div>}
              </TableCell>
              <TableCell className="font-mono">{e.sets}</TableCell>
              <TableCell className="font-mono">{e.reps}</TableCell>
              <TableCell className="hidden font-mono text-muted-foreground sm:table-cell">{e.rest || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
