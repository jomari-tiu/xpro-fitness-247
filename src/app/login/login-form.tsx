"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { DbGate } from "@/components/db-gate"
import { TextField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { DEMO_ACCOUNTS, ROLE_HOME, authenticate } from "@/lib/auth"
import { loginSchema, type LoginValues } from "@/lib/schemas"
import { useDb, useSession } from "@/lib/store/db"

export function LoginForm() {
  return (
    <DbGate fallback={<Skeleton className="h-96 w-full bg-white/5" />}>
      <Form />
    </DbGate>
  )
}

function Form() {
  const router = useRouter()
  const user = useSession((s) => s.user)
  const signIn = useSession((s) => s.signIn)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (values: LoginValues) => {
    const session = authenticate(useDb.getState(), values.email, values.password)
    if (!session) {
      form.setError("password", { message: "Invalid email or password" })
      return
    }
    signIn(session)
    toast.success(`Welcome back, ${session.name.split(" ")[0]}!`)
    router.push(ROLE_HOME[session.role])
  }

  return (
    <div className="flex flex-col gap-6">
      {user && (
        <button
          type="button"
          onClick={() => router.push(ROLE_HOME[user.role])}
          className="flex items-center justify-between rounded-xl border border-xp-amber/30 bg-xp-amber/10 px-4 py-3 text-left text-sm transition-colors hover:bg-xp-amber/15"
        >
          <span>
            Continue as <strong>{user.name}</strong> <span className="text-xp-ash capitalize">({user.role})</span>
          </span>
          <ArrowRight className="size-4" />
        </button>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <FieldGroup>
          <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
          <TextField control={form.control} name="password" label="Password" type="password" autoComplete="current-password" />
        </FieldGroup>
        <Button type="submit" size="lg" className="h-11 rounded-full font-bold uppercase" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>
      <div className="flex flex-col gap-3">
        <span className="xp-eyebrow text-xp-smoke">Demo accounts · click to fill</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.role}
              type="button"
              onClick={() => {
                form.reset({ email: a.email, password: a.password })
              }}
              className="flex flex-col gap-0.5 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5 text-left transition-colors hover:border-xp-flame/60"
            >
              <span className="text-sm font-semibold">{a.label}</span>
              <span className="truncate font-mono text-[11px] text-xp-ash">{a.email}</span>
              <span className="font-mono text-[11px] text-xp-smoke">pw: {a.password}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
