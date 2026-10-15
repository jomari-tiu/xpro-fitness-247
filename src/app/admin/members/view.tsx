"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { DataTable } from "@/components/data-table"
import { MembershipBadge, PageHeader, PersonAvatar } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNow } from "@/hooks/use-now"
import { formatDate, fullName } from "@/lib/format"
import { daysLeft, membershipStatus } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import type { MembershipStatus } from "@/lib/types"

interface Row {
  id: string
  name: string
  firstName: string
  lastName: string
  code: string
  phone: string
  email: string
  plan: string
  trainer: string
  endDate: string
  daysLeft: number
  status: MembershipStatus
}

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <PersonAvatar person={row.original} />
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  { accessorKey: "code", header: "ID", cell: ({ getValue }) => <span className="font-mono text-xs">{String(getValue())}</span> },
  { accessorKey: "phone", header: "Phone", enableSorting: false },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "trainer", header: "Trainer", cell: ({ getValue }) => getValue() || <span className="text-muted-foreground">—</span> },
  {
    accessorKey: "endDate",
    header: "Expires",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{formatDate(row.original.endDate)}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.daysLeft < 0 ? `${-row.original.daysLeft}d ago` : `${row.original.daysLeft}d left`}
        </span>
      </div>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <MembershipBadge status={row.original.status} /> },
]

export default function MembersPage() {
  const router = useRouter()
  const now = useNow()
  const members = useDb((s) => s.members)
  const plans = useDb((s) => s.plans)
  const trainers = useDb((s) => s.trainers)
  const [status, setStatus] = useState<"all" | MembershipStatus>("all")

  const rows = useMemo<Row[]>(() => {
    const planName = new Map(plans.map((p) => [p.id, p.name]))
    const trainerName = new Map(trainers.map((t) => [t.id, fullName(t)]))
    return members
      .map((m) => ({
        id: m.id,
        name: fullName(m),
        firstName: m.firstName,
        lastName: m.lastName,
        code: m.code,
        phone: m.phone,
        email: m.email,
        plan: planName.get(m.planId) ?? "—",
        trainer: m.trainerId ? trainerName.get(m.trainerId) ?? "" : "",
        endDate: m.endDate,
        daysLeft: daysLeft(m, now),
        status: membershipStatus(m, now),
      }))
      .filter((r) => status === "all" || r.status === status)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [members, plans, trainers, now, status])

  return (
    <>
      <PageHeader
        title="Members"
        description={`${members.length} registered members`}
        actions={
          <Button asChild>
            <Link href="/admin/members/new">
              <UserPlus /> Register member
            </Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search name, ID, phone, plan…"
        onRowClick={(r) => router.push(`/admin/members/${r.id}`)}
        toolbar={
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </>
  )
}
