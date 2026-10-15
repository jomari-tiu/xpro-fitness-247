"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { DataTable } from "@/components/data-table"
import { PageHeader, SessionBadge } from "@/components/shared"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatClock, formatDate, fullName } from "@/lib/format"
import { useDb } from "@/lib/store/db"
import type { SessionStatus, TrainingSession } from "@/lib/types"

interface Row extends TrainingSession {
  member: string
  trainer: string
  when: string
}

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "when",
    header: "Date",
    cell: ({ row }) => (
      <span>
        {formatDate(row.original.date)} <span className="text-muted-foreground">· {formatClock(row.original.time)}</span>
      </span>
    ),
  },
  { accessorKey: "member", header: "Member", cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
  { accessorKey: "trainer", header: "Trainer" },
  { accessorKey: "focus", header: "Focus" },
  { accessorKey: "notes", header: "Notes", enableSorting: false, cell: ({ getValue }) => <span className="line-clamp-1 max-w-xs text-muted-foreground">{String(getValue() || "—")}</span> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <SessionBadge status={row.original.status} /> },
]

export default function AdminSessionsPage() {
  const sessions = useDb((s) => s.sessions)
  const members = useDb((s) => s.members)
  const trainers = useDb((s) => s.trainers)
  const [status, setStatus] = useState<"all" | SessionStatus>("all")
  const [trainerId, setTrainerId] = useState("all")

  const rows = useMemo<Row[]>(() => {
    const m = new Map(members.map((x) => [x.id, fullName(x)]))
    const t = new Map(trainers.map((x) => [x.id, fullName(x)]))
    return sessions
      .filter((s) => (status === "all" || s.status === status) && (trainerId === "all" || s.trainerId === trainerId))
      .map((s) => ({ ...s, member: m.get(s.memberId) ?? "—", trainer: t.get(s.trainerId) ?? "—", when: `${s.date} ${s.time}` }))
  }, [sessions, members, trainers, status, trainerId])

  return (
    <>
      <PageHeader title="PT sessions" description="Every personal training session booked, completed or cancelled." />
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search member, trainer, focus…"
        initialSorting={[{ id: "when", desc: true }]}
        toolbar={
          <>
            <Select value={trainerId} onValueChange={setTrainerId}>
              <SelectTrigger className="w-44" aria-label="Filter by trainer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All trainers</SelectItem>
                {trainers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {fullName(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-36" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no-show">No-show</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
    </>
  )
}
