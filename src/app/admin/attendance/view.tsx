"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, ScanLine, Search, XCircle } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/data-table"
import { MembershipBadge, PageHeader, PersonAvatar, StatCard } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useNow } from "@/hooks/use-now"
import { formatDate, formatDateTime, formatTime, fullName } from "@/lib/format"
import { daysLeft, isToday, membershipStatus } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import type { Member } from "@/lib/types"

interface Row {
  id: string
  name: string
  code: string
  at: string
  member: Member
}

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => (
      <Link href={`/admin/members/${row.original.member.id}`} className="flex items-center gap-3 hover:underline">
        <PersonAvatar person={row.original.member} />
        <span className="font-medium">{row.original.name}</span>
      </Link>
    ),
  },
  { accessorKey: "code", header: "ID", cell: ({ getValue }) => <span className="font-mono text-xs">{String(getValue())}</span> },
  { accessorKey: "at", header: "Checked in", cell: ({ getValue }) => formatDateTime(String(getValue())) },
]

export default function AttendancePage() {
  const now = useNow()
  const members = useDb((s) => s.members)
  const checkIns = useDb((s) => s.checkIns)
  const checkIn = useDb((s) => s.checkIn)
  const [query, setQuery] = useState("")

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const today = useMemo(() => checkIns.filter((c) => isToday(c.at, now)), [checkIns, now])
  const checkedInToday = useMemo(() => new Set(today.map((c) => c.memberId)), [today])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return members
      .filter((m) => `${fullName(m)} ${m.code} ${m.phone}`.toLowerCase().includes(q))
      .slice(0, 6)
  }, [members, query])

  const rows = useMemo<Row[]>(
    () =>
      checkIns.flatMap((c) => {
        const m = memberById.get(c.memberId)
        return m ? [{ id: c.id, name: fullName(m), code: m.code, at: c.at, member: m }] : []
      }),
    [checkIns, memberById]
  )

  const doCheckIn = (m: Member) => {
    checkIn(m.id)
    toast.success(`${fullName(m)} checked in`, { description: formatTime(new Date().toISOString()) })
    setQuery("")
  }

  return (
    <>
      <PageHeader title="Check-in desk" description="Search a member by name, ID or phone and check them in." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Check in a member</CardTitle>
            <CardDescription>Expired memberships are blocked until renewed.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Juan, XP-1001, 0917…"
                className="h-11 pl-9 text-base"
                aria-label="Search member to check in"
              />
            </div>
            {query && matches.length === 0 && <p className="px-1 text-sm text-muted-foreground">No member matches “{query}”.</p>}
            <div className="flex flex-col gap-2">
              {matches.map((m) => {
                const status = membershipStatus(m, now)
                const already = checkedInToday.has(m.id)
                const left = daysLeft(m, now)
                return (
                  <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
                    <PersonAvatar person={m} className="size-10" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="font-semibold">{fullName(m)}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.code} · valid until {formatDate(m.endDate)} {left >= 0 && `(${left}d left)`}
                      </span>
                    </div>
                    <MembershipBadge status={status} />
                    {status === "expired" ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/renewals">
                          <XCircle /> Renew first
                        </Link>
                      </Button>
                    ) : already ? (
                      <Button size="sm" variant="secondary" disabled>
                        <CheckCircle2 /> In today
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => doCheckIn(m)}>
                        <ScanLine /> Check in
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <StatCard label="Check-ins today" value={today.length} icon={ScanLine} tone="success" />
          <StatCard
            label="Unique members today"
            value={checkedInToday.size}
            hint={`${checkIns.length} check-ins all time`}
            icon={CheckCircle2}
            tone="primary"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Attendance log</h2>
        <DataTable columns={columns} data={rows} searchPlaceholder="Search name or ID…" pageSize={15} />
      </div>
    </>
  )
}
