"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateTime, formatPesoExact, fullName, paymentMethodLabel, paymentTypeLabel } from "@/lib/format"
import { useDb } from "@/lib/store/db"
import type { Payment } from "@/lib/types"

/** Printable official receipt. */
export function Receipt({ payment }: { payment: Payment }) {
  const member = useDb((s) => s.members.find((m) => m.id === payment.memberId))
  const plan = useDb((s) => s.plans.find((p) => p.id === payment.planId))

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="no-print flex w-full max-w-xl justify-end">
        <Button onClick={() => window.print()}>
          <Printer /> Print receipt
        </Button>
      </div>
      <div className="w-full max-w-xl rounded-2xl border bg-white p-8 text-neutral-900 shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <div className="text-2xl font-black tracking-tight uppercase [font-stretch:125%]">XPRO Fitness 24/7</div>
            <div className="mt-1 text-xs leading-relaxed text-neutral-500">
              B29/B30 Lot 7 Brookside Lane, San Francisco
              <br />
              General Trias, Cavite 4107 · 0920 539 0952
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[11px] tracking-[.08em] text-neutral-500 uppercase">Official receipt</div>
            <div className="font-mono text-sm font-semibold">{payment.receiptNo}</div>
          </div>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 py-5 text-sm">
          <dt className="text-neutral-500">Date</dt>
          <dd>{formatDateTime(payment.paidAt)}</dd>
          <dt className="text-neutral-500">Received from</dt>
          <dd className="font-semibold">
            {member ? fullName(member) : "Deleted member"}
            {member && <span className="ml-2 font-mono text-xs font-normal text-neutral-500">{member.code}</span>}
          </dd>
          <dt className="text-neutral-500">Payment for</dt>
          <dd>{paymentTypeLabel[payment.type]}</dd>
          <dt className="text-neutral-500">Method</dt>
          <dd>{paymentMethodLabel[payment.method]}</dd>
        </dl>
        <table className="w-full border-y border-neutral-200 text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500 uppercase">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-neutral-100">
              <td className="py-3">
                {payment.description}
                {plan && <div className="text-xs text-neutral-500">{plan.durationDays}-day membership</div>}
              </td>
              <td className="py-3 text-right font-mono">{formatPesoExact(payment.amount)}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center justify-between py-4">
          <span className="text-sm font-semibold uppercase">Total paid</span>
          <span className="font-mono text-xl font-bold">{formatPesoExact(payment.amount)}</span>
        </div>
        <div className="flex items-end justify-between border-t border-neutral-200 pt-5 text-xs text-neutral-500">
          <span>Received by: {payment.recordedBy}</span>
          <span>Thank you for training with us!</span>
        </div>
      </div>
    </div>
  )
}
