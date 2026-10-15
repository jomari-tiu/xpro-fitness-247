"use client"

import { BadgeDollarSign, ReceiptText } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { EmptyState, PageHeader, StatCard } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCurrentMember } from "@/hooks/use-current"
import { formatDate, formatPeso, paymentMethodLabel, paymentTypeLabel } from "@/lib/format"
import { useDb } from "@/lib/store/db"

export default function PortalPaymentsPage() {
  const member = useCurrentMember()!
  const all = useDb((s) => s.payments)
  const payments = useMemo(
    () => all.filter((p) => p.memberId === member.id).sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    [all, member.id]
  )
  const total = payments.reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <PageHeader title="Payment history" description="All payments made at XPRO. Open any receipt to print it." />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total paid" value={formatPeso(total)} icon={BadgeDollarSign} tone="primary" />
        <StatCard label="Receipts" value={payments.length} hint={payments[0] ? `Last on ${formatDate(payments[0].paidAt)}` : undefined} icon={ReceiptText} />
      </div>
      {payments.length === 0 ? (
        <EmptyState icon={ReceiptText} title="No payments yet" />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.paidAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{p.description}</span>
                      <Badge variant="secondary">{paymentTypeLabel[p.type]}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{paymentMethodLabel[p.method]}</TableCell>
                  <TableCell className="text-right font-semibold">{formatPeso(p.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/portal/payments/${p.id}`}>Receipt</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  )
}
