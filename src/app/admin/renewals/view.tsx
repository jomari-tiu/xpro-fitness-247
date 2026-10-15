"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { RefreshCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { RenewDialog } from "@/components/admin/renew-dialog"
import { DataTable } from "@/components/data-table"
import { MembershipBadge, PageHeader, PersonAvatar } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNow } from "@/hooks/use-now"
import { formatDate, formatPeso, fullName } from "@/lib/format"
import { daysLeft, membershipStatus } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import type { Member, MembershipStatus } from "@/lib/types"

interface Row {
  member: Member
  name: string
  plan: string
  price: number
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
        <PersonAvatar person={row.original.member} />
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="font-mono text-xs text-muted-foreground">{row.original.member.code}</span>
        </div>
      </div>
    ),
  },
  { accessorKey: "plan", header: "Current plan", cell: ({ row }) => `${row.original.plan} · ${formatPeso(row.original.price)}` },
  {
    accessorKey: "daysLeft",
    header: "Expires",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{formatDate(row.original.endDate)}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.daysLeft < 0 ? `expired ${-row.original.daysLeft}d ago` : `${row.original.daysLeft}d left`}
        </span>
      </div>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <MembershipBadge status={row.original.status} /> },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="text-right">
        <RenewDialog
          member={row.original.member}
          trigger={
            <Button size="sm" variant={row.original.status === "active" ? "outline" : "default"}>
              <RefreshCcw /> Renew
            </Button>
          }
        />
      </div>
    ),
  },
]

export default function RenewalsPage() {
  const now = useNow()
  const members = useDb((s) => s.members)
  const plans = useDb((s) => s.plans)
  const [tab, setTab] = useState<"due" | "all">("due")

  const rows = useMemo<Row[]>(() => {
    const planById = new Map(plans.map((p) => [p.id, p]))
    return members
      .map((m) => ({
        member: m,
        name: fullName(m),
        plan: planById.get(m.planId)?.name ?? "—",
        price: planById.get(m.planId)?.price ?? 0,
        endDate: m.endDate,
        daysLeft: daysLeft(m, now),
        status: membershipStatus(m, now),
      }))
      .filter((r) => tab === "all" || r.daysLeft <= 14)
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [members, plans, now, tab])

  return (
    <>
      <PageHeader title="Renewals" description="Extend memberships and record the payment in one step." />
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search member…"
        initialSorting={[{ id: "daysLeft", desc: false }]}
        toolbar={
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="due">Due in 14 days / expired</TabsTrigger>
              <TabsTrigger value="all">All members</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
    </>
  )
}
