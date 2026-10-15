import { addDays, differenceInCalendarDays, format, startOfDay, startOfMonth, subDays, subMonths } from "date-fns"
import { isoDate, toDate } from "./format"
import type { Availability, CheckIn, Member, MembershipStatus, Payment, TrainingSession } from "./types"

export const EXPIRING_WINDOW_DAYS = 7

export function daysLeft(member: Pick<Member, "endDate">, now: number) {
  return differenceInCalendarDays(toDate(member.endDate), now)
}

export function membershipStatus(member: Pick<Member, "endDate">, now: number): MembershipStatus {
  const d = daysLeft(member, now)
  if (d < 0) return "expired"
  if (d <= EXPIRING_WINDOW_DAYS) return "expiring"
  return "active"
}

/** End date for a membership that starts on `start` and lasts `durationDays` (inclusive of the start day). */
export function membershipEnd(start: string, durationDays: number) {
  return isoDate(addDays(toDate(start), durationDays - 1))
}

/** If renewing before expiry, the new period starts the day after the current one ends. */
export function renewalStart(member: Pick<Member, "endDate">, now: number) {
  const nextDay = addDays(toDate(member.endDate), 1)
  return nextDay.getTime() > now ? isoDate(nextDay) : isoDate(now)
}

export function revenueByMonth(payments: Payment[], now: number, months = 6) {
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = startOfMonth(subMonths(now, months - 1 - i))
    return { key: format(d, "yyyy-MM"), month: format(d, "MMM"), revenue: 0, memberships: 0, training: 0 }
  })
  const index = new Map(buckets.map((b, i) => [b.key, i]))
  for (const p of payments) {
    const i = index.get(p.paidAt.slice(0, 7))
    if (i == null) continue
    buckets[i].revenue += p.amount
    if (p.type === "personal-training") buckets[i].training += p.amount
    else buckets[i].memberships += p.amount
  }
  return buckets
}

export function checkInsByDay(checkIns: CheckIn[], now: number, days = 14) {
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = subDays(startOfDay(now), days - 1 - i)
    return { key: isoDate(d), day: format(d, "MMM d"), checkIns: 0 }
  })
  const index = new Map(buckets.map((b, i) => [b.key, i]))
  for (const c of checkIns) {
    const i = index.get(isoDate(toDate(c.at)))
    if (i != null) buckets[i].checkIns++
  }
  return buckets
}

export function isToday(iso: string, now: number) {
  return isoDate(toDate(iso)) === isoDate(now)
}

export function sumThisMonth(payments: Payment[], now: number) {
  const key = format(now, "yyyy-MM")
  return payments.filter((p) => p.paidAt.startsWith(key)).reduce((s, p) => s + p.amount, 0)
}

/** Hourly slots a trainer offers on a given date, minus already-booked ones and past times. */
export function availableSlots(
  availability: Availability[],
  sessions: TrainingSession[],
  trainerId: string,
  date: string,
  now: number
) {
  const day = toDate(date).getDay()
  const window = availability.find((a) => a.day === day && a.enabled)
  if (!window) return []
  const taken = new Set(
    sessions.filter((s) => s.trainerId === trainerId && s.date === date && s.status === "booked").map((s) => s.time)
  )
  const [sh] = window.start.split(":").map(Number)
  const [eh] = window.end.split(":").map(Number)
  const slots: string[] = []
  for (let h = sh; h < eh; h++) {
    const time = `${String(h).padStart(2, "0")}:00`
    const slotAt = toDate(`${date}T${time}`).getTime()
    if (slotAt <= now || taken.has(time)) continue
    slots.push(time)
  }
  return slots
}

export const sessionDateTime = (s: Pick<TrainingSession, "date" | "time">) => toDate(`${s.date}T${s.time}`).getTime()
