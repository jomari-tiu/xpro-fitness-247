"use client"

import { TrainerForm } from "@/components/admin/trainer-form"
import { PageHeader } from "@/components/shared"

export default function NewTrainerPage() {
  return (
    <>
      <PageHeader title="Add trainer" description="Trainers sign in to the Trainer Hub with this email and the demo password trainer123." />
      <TrainerForm />
    </>
  )
}
