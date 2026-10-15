"use client"

import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Receipt } from "@/components/receipt"
import { NotFound } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { useDb } from "@/lib/store/db"

export default function PaymentReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const payment = useDb((s) => s.payments.find((p) => p.id === id))
  if (!payment) return <NotFound what="payment" />
  return (
    <>
      <Button variant="ghost" className="no-print self-start" onClick={() => router.back()}>
        <ArrowLeft /> Back
      </Button>
      <Receipt payment={payment} />
    </>
  )
}
