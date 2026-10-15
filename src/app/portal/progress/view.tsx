"use client"

import { ProgressPanel } from "@/components/progress/progress-panel"
import { PageHeader } from "@/components/shared"
import { useCurrentMember } from "@/hooks/use-current"

export default function PortalProgressPage() {
  const member = useCurrentMember()!
  return (
    <>
      <PageHeader title="My progress" description="Track your weight and body measurements. Your coach sees these too." />
      <ProgressPanel memberId={member.id} loggedBy="member" />
    </>
  )
}
