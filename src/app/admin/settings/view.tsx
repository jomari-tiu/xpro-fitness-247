"use client"

import { Database, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useShallow } from "zustand/react/shallow"
import { PageHeader } from "@/components/shared"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/use-current"
import { DEMO_ACCOUNTS } from "@/lib/auth"
import { useDb } from "@/lib/store/db"

export default function SettingsPage() {
  const resetDemo = useDb((s) => s.resetDemo)
  const user = useCurrentUser()
  const counts = useDb(
    useShallow((s) => ({
      members: s.members.length,
      payments: s.payments.length,
      checkIns: s.checkIns.length,
      sessions: s.sessions.length,
    }))
  )

  if (user?.role !== "admin") {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Only the gym owner can change settings.
      </p>
    )
  }

  return (
    <>
      <PageHeader title="Settings" description="Demo environment controls. There is no backend yet." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4" /> Demo data
            </CardTitle>
            <CardDescription>All data is stored in this browser&apos;s localStorage.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(counts).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-muted p-3">
                <div className="text-xl font-bold">{v}</div>
                <div className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <RotateCcw /> Reset demo data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Every member, payment, check-in and session you created will be replaced with fresh sample data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => {
                      resetDemo()
                      toast.success("Demo data restored")
                    }}
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Demo accounts</CardTitle>
            <CardDescription>Any member can sign in with member123; any trainer with trainer123.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {DEMO_ACCOUNTS.map((a) => (
              <div key={a.role} className="flex flex-wrap justify-between gap-2 rounded-lg border p-3">
                <span className="font-medium">{a.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {a.email} / {a.password}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
