"use client"

import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMounted } from "@/hooks/use-now"
import { useDb } from "@/lib/store/db"

/**
 * The demo database lives in localStorage, so anything that reads it renders on the client only.
 * Seeds the database the first time the app is opened.
 */
export function DbGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const mounted = useMounted()
  const seeded = useDb((s) => s.seeded)

  useEffect(() => {
    if (!useDb.getState().seeded) useDb.getState().resetDemo()
  }, [])

  if (!mounted || !seeded) return fallback ?? <PageSkeleton />
  return children
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}
