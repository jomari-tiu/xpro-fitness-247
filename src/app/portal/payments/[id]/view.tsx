"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Receipt } from "@/components/receipt"
import { NotFound } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { useCurrentMember } from "@/hooks/use-current"
import { useDb } from "@/lib/store/db"

export default function PortalReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const member = useCurrentMember()!
  const payment = useDb((s) => s.payments.find((p) => p.id === id && p.memberId === member.id))
  if (!payment) return <NotFound what="receipt" />
  return (
    <>
      <Button variant="ghost" className="no-print self-start" asChild>
        <Link href="/portal/payments">
          <ArrowLeft /> Payment history
        </Link>
      </Button>
      <Receipt payment={payment} />
    </>
  )
}
