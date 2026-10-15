"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { buildSeed, type Db } from "../mock/seed"
import { membershipEnd } from "../selectors"
import type {
  AnnouncementValues,
  AvailabilityValues,
  BookingValues,
  CompleteSessionValues,
  MemberRegistrationValues,
  MemberValues,
  PaymentValues,
  PlanValues,
  ProgressValues,
  RenewalValues,
  TrainerValues,
  WorkoutPlanValues,
} from "../schemas"
import type { Payment, ProgressLog, SessionUser } from "../types"

const uid = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`
const nowIso = () => new Date().toISOString()

function nextReceiptNo(payments: Payment[]) {
  const year = new Date().getFullYear()
  const max = payments.reduce((m, p) => Math.max(m, Number(p.receiptNo.split("-")[2]) || 0), 0)
  return `OR-${year}-${String(max + 1).padStart(5, "0")}`
}

const parsePerks = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

interface Actions {
  resetDemo: () => void

  addMember: (v: MemberRegistrationValues, by: string) => { memberId: string; paymentId: string | null }
  updateMember: (id: string, v: MemberValues) => void
  deleteMember: (id: string) => void

  savePlan: (id: string | null, v: PlanValues) => void
  deletePlan: (id: string) => boolean

  renewMembership: (v: RenewalValues, by: string) => string
  recordPayment: (v: PaymentValues, by: string) => string

  checkIn: (memberId: string) => void

  saveTrainer: (id: string | null, v: TrainerValues) => string
  setAvailability: (trainerId: string, v: AvailabilityValues) => void
  assignClients: (trainerId: string, memberIds: string[]) => void

  saveWorkoutPlan: (id: string | null, trainerId: string, v: WorkoutPlanValues) => void
  deleteWorkoutPlan: (id: string) => void

  bookSession: (memberId: string, v: BookingValues) => void
  cancelSession: (id: string) => void
  completeSession: (id: string, v: CompleteSessionValues) => void

  logProgress: (memberId: string, v: ProgressValues, by: ProgressLog["loggedBy"]) => void
  deleteProgress: (id: string) => void

  saveAnnouncement: (id: string | null, v: AnnouncementValues, author: string) => void
  deleteAnnouncement: (id: string) => void

  sendReminder: (memberId: string, title: string, body: string) => void
  markNotificationsRead: (memberId: string) => void
}

export type DbState = Db & { seeded: boolean } & Actions

const empty: Db & { seeded: boolean } = {
  seeded: false,
  plans: [],
  members: [],
  payments: [],
  checkIns: [],
  trainers: [],
  workoutPlans: [],
  sessions: [],
  progress: [],
  announcements: [],
  notifications: [],
}

export const useDb = create<DbState>()(
  persist(
    (set, get) => ({
      ...empty,

      resetDemo: () => set({ ...buildSeed(Date.now()), seeded: true }),

      addMember: (v, by) => {
        const { paymentMethod, recordPayment, ...rest } = v
        const plan = get().plans.find((p) => p.id === v.planId)!
        const id = uid("mem")
        const maxCode = get().members.reduce((m, x) => Math.max(m, Number(x.code.slice(3)) || 0), 1000)
        const payment: Payment | null = recordPayment
          ? {
              id: uid("pay"),
              receiptNo: nextReceiptNo(get().payments),
              memberId: id,
              planId: plan.id,
              amount: plan.price,
              method: paymentMethod,
              type: "new",
              paidAt: nowIso(),
              description: `${plan.name} membership`,
              recordedBy: by,
            }
          : null
        set((s) => ({
          members: [
            ...s.members,
            {
              ...rest,
              id,
              code: `XP-${maxCode + 1}`,
              trainerId: rest.trainerId || null,
              endDate: membershipEnd(v.startDate, plan.durationDays),
              joinedAt: nowIso(),
            },
          ],
          payments: payment ? [...s.payments, payment] : s.payments,
        }))
        return { memberId: id, paymentId: payment?.id ?? null }
      },

      updateMember: (id, v) =>
        set((s) => ({
          members: s.members.map((m) => {
            if (m.id !== id) return m
            const plan = s.plans.find((p) => p.id === v.planId)!
            const periodChanged = m.planId !== v.planId || m.startDate !== v.startDate
            return {
              ...m,
              ...v,
              trainerId: v.trainerId || null,
              endDate: periodChanged ? membershipEnd(v.startDate, plan.durationDays) : m.endDate,
            }
          }),
        })),

      deleteMember: (id) =>
        set((s) => ({
          members: s.members.filter((m) => m.id !== id),
          checkIns: s.checkIns.filter((c) => c.memberId !== id),
          sessions: s.sessions.filter((x) => x.memberId !== id),
          progress: s.progress.filter((p) => p.memberId !== id),
          notifications: s.notifications.filter((n) => n.memberId !== id),
          workoutPlans: s.workoutPlans.map((w) => ({ ...w, memberIds: w.memberIds.filter((m) => m !== id) })),
        })),

      savePlan: (id, v) => {
        const plan = { ...v, perks: parsePerks(v.perks) }
        set((s) => ({
          plans: id ? s.plans.map((p) => (p.id === id ? { ...p, ...plan } : p)) : [...s.plans, { ...plan, id: uid("plan") }],
        }))
      },

      deletePlan: (id) => {
        if (get().members.some((m) => m.planId === id)) return false
        set((s) => ({ plans: s.plans.filter((p) => p.id !== id) }))
        return true
      },

      renewMembership: (v, by) => {
        const plan = get().plans.find((p) => p.id === v.planId)!
        const paymentId = uid("pay")
        set((s) => ({
          members: s.members.map((m) =>
            m.id === v.memberId
              ? { ...m, planId: v.planId, startDate: v.startDate, endDate: membershipEnd(v.startDate, plan.durationDays) }
              : m
          ),
          payments: [
            ...s.payments,
            {
              id: paymentId,
              receiptNo: nextReceiptNo(s.payments),
              memberId: v.memberId,
              planId: v.planId,
              amount: v.amount,
              method: v.method,
              type: "renewal",
              paidAt: nowIso(),
              description: `${plan.name} membership renewal`,
              recordedBy: by,
            },
          ],
          notifications: [
            ...s.notifications,
            {
              id: uid("ntf"),
              memberId: v.memberId,
              title: "Membership renewed",
              body: `Your ${plan.name} membership is active until ${membershipEnd(v.startDate, plan.durationDays)}. Thank you!`,
              createdAt: nowIso(),
              read: false,
            },
          ],
        }))
        return paymentId
      },

      recordPayment: (v, by) => {
        const id = uid("pay")
        set((s) => ({
          payments: [
            ...s.payments,
            { ...v, id, receiptNo: nextReceiptNo(s.payments), planId: null, paidAt: nowIso(), recordedBy: by },
          ],
        }))
        return id
      },

      checkIn: (memberId) =>
        set((s) => ({ checkIns: [{ id: uid("chk"), memberId, at: nowIso() }, ...s.checkIns] })),

      saveTrainer: (id, v) => {
        const trainerId = id ?? uid("tr")
        set((s) => ({
          trainers: id
            ? s.trainers.map((t) => (t.id === id ? { ...t, ...v } : t))
            : [
                ...s.trainers,
                {
                  ...v,
                  id: trainerId,
                  joinedAt: nowIso(),
                  availability: Array.from({ length: 7 }, (_, day) => ({
                    day,
                    enabled: day >= 1 && day <= 5,
                    start: "09:00",
                    end: "17:00",
                  })),
                },
              ],
        }))
        return trainerId
      },

      setAvailability: (trainerId, v) =>
        set((s) => ({ trainers: s.trainers.map((t) => (t.id === trainerId ? { ...t, availability: v.days } : t)) })),

      assignClients: (trainerId, memberIds) =>
        set((s) => ({
          members: s.members.map((m) => {
            if (memberIds.includes(m.id)) return { ...m, trainerId }
            if (m.trainerId === trainerId) return { ...m, trainerId: null }
            return m
          }),
        })),

      saveWorkoutPlan: (id, trainerId, v) => {
        const before = id ? get().workoutPlans.find((w) => w.id === id)?.memberIds ?? [] : []
        const newlyAssigned = v.memberIds.filter((m) => !before.includes(m))
        const trainer = get().trainers.find((t) => t.id === trainerId)
        set((s) => ({
          workoutPlans: id
            ? s.workoutPlans.map((w) => (w.id === id ? { ...w, ...v } : w))
            : [...s.workoutPlans, { ...v, id: uid("wp"), trainerId, createdAt: nowIso() }],
          notifications: [
            ...s.notifications,
            ...newlyAssigned.map((memberId) => ({
              id: uid("ntf"),
              memberId,
              title: "New workout plan assigned",
              body: `Coach ${trainer?.firstName ?? ""} assigned you "${v.title}".`,
              createdAt: nowIso(),
              read: false,
            })),
          ],
        }))
      },

      deleteWorkoutPlan: (id) => set((s) => ({ workoutPlans: s.workoutPlans.filter((w) => w.id !== id) })),

      bookSession: (memberId, v) =>
        set((s) => ({
          sessions: [
            ...s.sessions,
            {
              id: uid("ses"),
              memberId,
              trainerId: v.trainerId,
              date: v.date,
              time: v.time,
              durationMin: 60,
              focus: v.focus,
              status: "booked",
              notes: "",
              createdAt: nowIso(),
              completedAt: null,
            },
          ],
        })),

      cancelSession: (id) =>
        set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)) })),

      completeSession: (id, v) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === id ? { ...x, status: v.status, notes: v.notes, completedAt: nowIso() } : x
          ),
        })),

      logProgress: (memberId, v, by) =>
        set((s) => ({ progress: [...s.progress, { ...v, id: uid("prg"), memberId, loggedBy: by }] })),

      deleteProgress: (id) => set((s) => ({ progress: s.progress.filter((p) => p.id !== id) })),

      saveAnnouncement: (id, v, author) =>
        set((s) => ({
          announcements: id
            ? s.announcements.map((a) => (a.id === id ? { ...a, ...v } : a))
            : [{ ...v, id: uid("ann"), createdAt: nowIso(), author }, ...s.announcements],
        })),

      deleteAnnouncement: (id) => set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) })),

      sendReminder: (memberId, title, body) =>
        set((s) => ({
          notifications: [
            ...s.notifications,
            { id: uid("ntf"), memberId, title, body, createdAt: nowIso(), read: false },
          ],
        })),

      markNotificationsRead: (memberId) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.memberId === memberId ? { ...n, read: true } : n)),
        })),
    }),
    {
      name: "xpro-db-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ seeded, plans, members, payments, checkIns, trainers, workoutPlans, sessions, progress, announcements, notifications }) => ({
        seeded, plans, members, payments, checkIns, trainers, workoutPlans, sessions, progress, announcements, notifications,
      }),
    }
  )
)

// ---------- Session (mock auth) ----------

interface SessionState {
  user: SessionUser | null
  signIn: (user: SessionUser) => void
  signOut: () => void
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    { name: "xpro-session-v1", storage: createJSONStorage(() => localStorage) }
  )
)
