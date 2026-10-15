"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Megaphone, Pencil, Pin, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { SelectField, SwitchField, TextField, TextareaField } from "@/components/form-fields"
import { EmptyState, PageHeader } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { useActorName } from "@/hooks/use-current"
import { formatDateTime } from "@/lib/format"
import { announcementSchema, type AnnouncementValues } from "@/lib/schemas"
import { useDb } from "@/lib/store/db"
import type { Announcement } from "@/lib/types"

const audienceLabel = { all: "Everyone", members: "Members", trainers: "Trainers" }

export default function AnnouncementsPage() {
  const announcements = useDb((s) => s.announcements)
  const remove = useDb((s) => s.deleteAnnouncement)
  const sorted = [...announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Posts appear in the member portal and trainer hub, depending on the audience."
        actions={
          <AnnouncementDialog
            trigger={
              <Button>
                <Plus /> New announcement
              </Button>
            }
          />
        }
      />
      {sorted.length === 0 && <EmptyState icon={Megaphone} title="No announcements" description="Post gym news, promos and schedule changes." />}
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {a.pinned && <Pin className="size-4 text-primary" />} {a.title}
              </CardTitle>
              <CardDescription>
                {formatDateTime(a.createdAt)} · {a.author}
              </CardDescription>
              <CardAction className="flex gap-1">
                <AnnouncementDialog
                  announcement={a}
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="Edit announcement">
                      <Pencil />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete announcement"
                  onClick={() => {
                    remove(a.id)
                    toast.success("Announcement deleted")
                  }}
                >
                  <Trash2 />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm whitespace-pre-line text-muted-foreground">{a.body}</p>
              <Badge variant="outline">{audienceLabel[a.audience]}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

function AnnouncementDialog({ announcement, trigger }: { announcement?: Announcement; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit announcement" : "New announcement"}</DialogTitle>
          <DialogDescription>Keep it short. Members see this on their portal home.</DialogDescription>
        </DialogHeader>
        {open && <AnnouncementForm announcement={announcement} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function AnnouncementForm({ announcement, onDone }: { announcement?: Announcement; onDone: () => void }) {
  const save = useDb((s) => s.saveAnnouncement)
  const actor = useActorName()
  const form = useForm<AnnouncementValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: announcement ?? { title: "", body: "", audience: "all", pinned: false },
  })
  const onSubmit = (v: AnnouncementValues) => {
    save(announcement?.id ?? null, v, actor === "Gym Owner" ? "XPRO Management" : actor)
    toast.success(announcement ? "Announcement updated" : "Announcement posted")
    onDone()
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FieldGroup>
        <TextField control={form.control} name="title" label="Title" />
        <TextareaField control={form.control} name="body" label="Message" rows={5} />
        <SelectField
          control={form.control}
          name="audience"
          label="Audience"
          options={Object.entries(audienceLabel).map(([value, label]) => ({ value, label }))}
        />
        <SwitchField control={form.control} name="pinned" label="Pin to top" />
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">{announcement ? "Save" : "Post announcement"}</Button>
      </DialogFooter>
    </form>
  )
}
