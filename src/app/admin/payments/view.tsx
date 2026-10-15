"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { BadgeDollarSign, Plus, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { DataTable } from "@/components/data-table"
import { NumberField, SelectField, TextField } from "@/components/form-fields"
import { PageHeader, StatCard } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActorName } from "@/hooks/use-current"
import { useNow } from "@/hooks/use-now"
import { formatDateTime, formatPeso, fullName, paymentMethodLabel, paymentTypeLabel } from "@/lib/format"
import { paymentSchema, type PaymentValues } from "@/lib/schemas"
import { isToday, sumThisMonth } from "@/lib/selectors"
import { useDb } from "@/lib/store/db"
import type { Payment, PaymentType } from "@/lib/types"

interface Row extends Payment {
  member: string
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "receiptNo", header: "Receipt", cell: ({ getValue }) => <span className="font-mono text-xs">{String(getValue())}</span> },
  { accessorKey: "paidAt", header: "Date", cell: ({ getValue }) => formatDateTime(String(getValue())) },
  { accessorKey: "member", header: "Member", cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="secondary">{paymentTypeLabel[row.original.type]}</Badge>,
  },
  { accessorKey: "method", header: "Method", cell: ({ row }) => paymentMethodLabel[row.original.method] },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <span className="font-semibold">{formatPeso(row.original.amount)}</span>,
  },
]

export default function PaymentsPage() {
  const router = useRouter()
  const now = useNow()
  const payments = useDb((s) => s.payments)
  const members = useDb((s) => s.members)
  const [type, setType] = useState<"all" | PaymentType>("all")

  const rows = useMemo<Row[]>(() => {
    const name = new Map(members.map((m) => [m.id, fullName(m)]))
    return payments
      .filter((p) => type === "all" || p.type === type)
      .map((p) => ({ ...p, member: name.get(p.memberId) ?? "Deleted member" }))
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
  }, [payments, members, type])

  const today = payments.filter((p) => isToday(p.paidAt, now)).reduce((s, p) => s + p.amount, 0)
  const month = sumThisMonth(payments, now)
  const all = payments.reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every payment recorded at the front desk, with printable receipts."
        actions={<RecordPaymentDialog />}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected today" value={formatPeso(today)} icon={Receipt} tone="success" />
        <StatCard label="This month" value={formatPeso(month)} icon={BadgeDollarSign} tone="primary" />
        <StatCard label="All time" value={formatPeso(all)} hint={`${payments.length} receipts`} icon={BadgeDollarSign} />
      </div>
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search receipt, member…"
        onRowClick={(r) => router.push(`/admin/payments/${r.id}`)}
        toolbar={
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger className="w-48" aria-label="Filter by type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(paymentTypeLabel).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </>
  )
}

function RecordPaymentDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>For PT packages, merchandise or other fees. Use Renewals for membership extensions.</DialogDescription>
        </DialogHeader>
        {open && <RecordPaymentForm onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function RecordPaymentForm({ onDone }: { onDone: () => void }) {
  const router = useRouter()
  const actor = useActorName()
  const members = useDb((s) => s.members)
  const record = useDb((s) => s.recordPayment)
  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { memberId: "", type: "personal-training", amount: Number.NaN, method: "cash", description: "" },
  })
  const onSubmit = (v: PaymentValues) => {
    const id = record(v, actor)
    toast.success("Payment recorded")
    onDone()
    router.push(`/admin/payments/${id}`)
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <SelectField
          control={form.control}
          name="memberId"
          label="Member"
          placeholder="Select member"
          options={[...members]
            .sort((a, b) => fullName(a).localeCompare(fullName(b)))
            .map((m) => ({ value: m.id, label: `${fullName(m)} · ${m.code}` }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            control={form.control}
            name="type"
            label="Type"
            options={Object.entries(paymentTypeLabel).map(([value, label]) => ({ value, label }))}
          />
          <SelectField
            control={form.control}
            name="method"
            label="Method"
            options={Object.entries(paymentMethodLabel).map(([value, label]) => ({ value, label }))}
          />
        </div>
        <NumberField control={form.control} name="amount" label="Amount (₱)" step="1" />
        <TextField control={form.control} name="description" label="Description" placeholder="e.g. 10-session PT package" />
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">Save &amp; view receipt</Button>
      </DialogFooter>
    </form>
  )
}
