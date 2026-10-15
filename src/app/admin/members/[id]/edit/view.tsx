"use client"

import { useParams } from "next/navigation"
import { MemberForm } from "@/components/admin/member-form"
import { NotFound, PageHeader } from "@/components/shared"
import { fullName } from "@/lib/format"
import { useDb } from "@/lib/store/db"

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>()
  const member = useDb((s) => s.members.find((m) => m.id === id))
  if (!member) return <NotFound what="member" />
  return (
    <>
      <PageHeader title="Edit member" description={fullName(member)} />
      <MemberForm member={member} />
    </>
  )
}
