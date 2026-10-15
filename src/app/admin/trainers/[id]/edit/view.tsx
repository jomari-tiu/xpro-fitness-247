"use client"

import { useParams } from "next/navigation"
import { TrainerForm } from "@/components/admin/trainer-form"
import { NotFound, PageHeader } from "@/components/shared"
import { fullName } from "@/lib/format"
import { useDb } from "@/lib/store/db"

export default function EditTrainerPage() {
  const { id } = useParams<{ id: string }>()
  const trainer = useDb((s) => s.trainers.find((t) => t.id === id))
  if (!trainer) return <NotFound what="trainer" />
  return (
    <>
      <PageHeader title="Edit trainer" description={fullName(trainer)} />
      <TrainerForm trainer={trainer} />
    </>
  )
}
