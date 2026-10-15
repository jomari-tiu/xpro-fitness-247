"use client"

import { Megaphone, Pin } from "lucide-react"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { useDb } from "@/lib/store/db"
import type { Audience } from "@/lib/types"

export function AnnouncementFeed({ audience, limit = 5 }: { audience: Exclude<Audience, "all">; limit?: number }) {
  const all = useDb((s) => s.announcements)
  const items = useMemo(
    () =>
      all
        .filter((a) => a.audience === "all" || a.audience === audience)
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit),
    [all, audience, limit]
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="size-4 text-primary" /> Announcements
        </CardTitle>
        <CardDescription>From XPRO management</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No announcements.</p>}
        {items.map((a) => (
          <div key={a.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 font-semibold">
              {a.pinned && <Pin className="size-3.5 text-primary" />}
              {a.title}
            </div>
            <p className="text-sm text-muted-foreground">{a.body}</p>
            <span className="font-mono text-[11px] text-muted-foreground">{formatDate(a.createdAt)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
