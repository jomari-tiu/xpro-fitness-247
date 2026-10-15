"use client"

import { useDb, useSession } from "@/lib/store/db"

export function useCurrentUser() {
  return useSession((s) => s.user)
}

/** "Gym Owner", "Front Desk" or the person's name: used for recordedBy / author fields */
export function useActorName() {
  return useSession((s) => s.user?.name ?? "System")
}

export function useCurrentMember() {
  const id = useSession((s) => s.user?.memberId)
  return useDb((s) => s.members.find((m) => m.id === id) ?? null)
}

export function useCurrentTrainer() {
  const id = useSession((s) => s.user?.trainerId)
  return useDb((s) => s.trainers.find((t) => t.id === id) ?? null)
}
