"use client"

import { MemberForm } from "@/components/admin/member-form"
import { PageHeader } from "@/components/shared"

export default function NewMemberPage() {
  return (
    <>
      <PageHeader title="Register member" description="Create a profile, start a membership and record the first payment." />
      <MemberForm />
    </>
  )
}
