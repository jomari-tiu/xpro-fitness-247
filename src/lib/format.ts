import { format, parseISO } from "date-fns"
import type { Member, PaymentMethod, PaymentType, Trainer } from "./types"

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })
const pesoExact = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 })

export const formatPeso = (n: number) => peso.format(n)
export const formatPesoExact = (n: number) => pesoExact.format(n)

/** Accepts yyyy-MM-dd or ISO strings */
export const toDate = (s: string) => parseISO(s)
export const formatDate = (s: string) => format(toDate(s), "MMM d, yyyy")
export const formatShortDate = (s: string) => format(toDate(s), "MMM d")
export const formatDateTime = (s: string) => format(toDate(s), "MMM d, yyyy · h:mm a")
export const formatTime = (s: string) => format(toDate(s), "h:mm a")
export const isoDate = (d: Date | number) => format(d, "yyyy-MM-dd")

/** "14:30" -> "2:30 PM" */
export function formatClock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  const suffix = h >= 12 ? "PM" : "AM"
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`
}

export const fullName = (p: Pick<Member | Trainer, "firstName" | "lastName">) => `${p.firstName} ${p.lastName}`
export const initials = (p: Pick<Member | Trainer, "firstName" | "lastName">) =>
  `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`.toUpperCase()

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  gcash: "GCash",
  maya: "Maya",
  card: "Card",
  bank: "Bank transfer",
}

export const paymentTypeLabel: Record<PaymentType, string> = {
  new: "New membership",
  renewal: "Renewal",
  "personal-training": "Personal training",
  other: "Other",
}
