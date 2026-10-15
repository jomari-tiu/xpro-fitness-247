import { fullName } from "./format"
import { DEMO_MEMBER_EMAIL, DEMO_PASSWORDS, DEMO_TRAINER_EMAIL, type Db } from "./mock/seed"
import type { Role, SessionUser } from "./types"

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  staff: "/admin",
  trainer: "/trainer",
  member: "/portal",
}

export const DEMO_ACCOUNTS: { role: Role; label: string; email: string; password: string }[] = [
  { role: "admin", label: "Gym owner / Admin", email: "admin@xpro.ph", password: DEMO_PASSWORDS.admin },
  { role: "staff", label: "Front desk staff", email: "staff@xpro.ph", password: DEMO_PASSWORDS.staff },
  { role: "trainer", label: "Trainer", email: DEMO_TRAINER_EMAIL, password: DEMO_PASSWORDS.trainer },
  { role: "member", label: "Member", email: DEMO_MEMBER_EMAIL, password: DEMO_PASSWORDS.member },
]

/** Mock authentication against the local demo database. Replace with a real API call later. */
export function authenticate(db: Pick<Db, "members" | "trainers">, email: string, password: string): SessionUser | null {
  const e = email.trim().toLowerCase()
  if (e === "admin@xpro.ph" && password === DEMO_PASSWORDS.admin) return { role: "admin", name: "Gym Owner", email: e }
  if (e === "staff@xpro.ph" && password === DEMO_PASSWORDS.staff) return { role: "staff", name: "Front Desk", email: e }

  const trainer = db.trainers.find((t) => t.email.toLowerCase() === e)
  if (trainer && password === DEMO_PASSWORDS.trainer)
    return { role: "trainer", name: fullName(trainer), email: trainer.email, trainerId: trainer.id }

  const member = db.members.find((m) => m.email.toLowerCase() === e)
  if (member && password === DEMO_PASSWORDS.member)
    return { role: "member", name: fullName(member), email: member.email, memberId: member.id }

  return null
}
