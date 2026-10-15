"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Search, UserPlus } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fullName } from "@/lib/format"
import { assignClientsSchema, type AssignClientsValues } from "@/lib/schemas"
import { useDb } from "@/lib/store/db"
import type { Trainer } from "@/lib/types"

export function AssignClientsDialog({ trainer }: { trainer: Trainer }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus /> Assign clients
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign clients to {trainer.firstName}</DialogTitle>
          <DialogDescription>Members can only have one trainer. Assigning moves them from their current trainer.</DialogDescription>
        </DialogHeader>
        {open && <AssignForm trainer={trainer} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function AssignForm({ trainer, onDone }: { trainer: Trainer; onDone: () => void }) {
  const members = useDb((s) => s.members)
  const trainers = useDb((s) => s.trainers)
  const assign = useDb((s) => s.assignClients)
  const [query, setQuery] = useState("")
  const form = useForm<AssignClientsValues>({
    resolver: zodResolver(assignClientsSchema),
    defaultValues: { memberIds: members.filter((m) => m.trainerId === trainer.id).map((m) => m.id) },
  })
  const selected = useWatch({ control: form.control, name: "memberIds" })
  const trainerName = new Map(trainers.map((t) => [t.id, t.firstName]))
  const list = useMemo(() => {
    const q = query.toLowerCase()
    return [...members]
      .filter((m) => `${fullName(m)} ${m.code}`.toLowerCase().includes(q))
      .sort((a, b) => fullName(a).localeCompare(fullName(b)))
  }, [members, query])

  const onSubmit = (v: AssignClientsValues) => {
    assign(trainer.id, v.memberIds)
    toast.success(`${trainer.firstName} now has ${v.memberIds.length} client${v.memberIds.length === 1 ? "" : "s"}`)
    onDone()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search members…" className="pl-8" />
      </div>
      <Controller
        control={form.control}
        name="memberIds"
        render={({ field }) => (
          <ScrollArea className="h-72 rounded-lg border">
            <div className="flex flex-col p-1">
              {list.map((m) => {
                const checked = field.value.includes(m.id)
                const other = m.trainerId && m.trainerId !== trainer.id ? trainerName.get(m.trainerId) : null
                return (
                  <label key={m.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) =>
                        field.onChange(c === true ? [...field.value, m.id] : field.value.filter((x) => x !== m.id))
                      }
                    />
                    <span className="flex-1 text-sm">
                      {fullName(m)} <span className="font-mono text-xs text-muted-foreground">{m.code}</span>
                    </span>
                    {other && <span className="text-xs text-muted-foreground">with {other}</span>}
                  </label>
                )
              })}
            </div>
          </ScrollArea>
        )}
      />
      <DialogFooter>
        <span className="mr-auto self-center text-sm text-muted-foreground">
          {selected.length} selected
        </span>
        <Button type="submit">Save assignments</Button>
      </DialogFooter>
    </form>
  )
}
