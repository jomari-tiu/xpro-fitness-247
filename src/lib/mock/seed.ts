import { addDays, setHours, setMinutes, startOfDay, subDays } from "date-fns"
import { isoDate, toDate } from "../format"
import { membershipEnd } from "../selectors"
import type {
  Announcement,
  Availability,
  CheckIn,
  Member,
  Notification,
  Payment,
  PaymentMethod,
  Plan,
  ProgressLog,
  Trainer,
  TrainingSession,
  WorkoutPlan,
} from "../types"

export interface Db {
  plans: Plan[]
  members: Member[]
  payments: Payment[]
  checkIns: CheckIn[]
  trainers: Trainer[]
  workoutPlans: WorkoutPlan[]
  sessions: TrainingSession[]
  progress: ProgressLog[]
  announcements: Announcement[]
  notifications: Notification[]
}

export const DEMO_PASSWORDS = { admin: "admin123", staff: "staff123", trainer: "trainer123", member: "member123" }
export const DEMO_MEMBER_EMAIL = "juan.delacruz@gmail.com"
export const DEMO_TRAINER_EMAIL = "marco.santos@xpro.ph"

// Small deterministic PRNG so the demo data is the same on every reset.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_M = ["Juan", "Miguel", "Carlo", "Paolo", "Rafael", "Jerome", "Kevin", "Mark", "Christian", "Joshua", "Gabriel", "Adrian", "Ramon", "Noel", "Bryan", "Daniel", "Enzo", "Luis", "Vince", "Arvin", "Jomar"]
const FIRST_F = ["Maria", "Angelica", "Kristine", "Patricia", "Camille", "Bea", "Nicole", "Jasmine", "Ella", "Andrea", "Sofia", "Trisha", "Rica", "Joanna", "Mika", "Janelle", "Aira", "Liza", "Grace", "Hazel", "Pia"]
const LAST = ["Dela Cruz", "Reyes", "Santos", "Garcia", "Mendoza", "Bautista", "Villanueva", "Ramos", "Aquino", "Castillo", "Navarro", "Flores", "Gonzales", "Rivera", "Torres", "Lopez", "Cruz", "Salazar", "Domingo", "Pascual", "Mercado", "Fernandez", "Soriano", "Manalo"]
const STREETS = ["Brookside Lane", "Arnaldo Hwy", "Governor's Dr", "Tejero Rd", "Manggahan St", "Pasong Kawayan Rd", "Buenavista Ave", "Sampaguita St"]
const BARANGAYS = ["San Francisco", "Pasong Camachile", "Santiago", "Biclatan", "Manggahan", "Tejero", "Buenavista", "Navarro"]

export function buildSeed(nowMs: number): Db {
  const rand = mulberry32(247)
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1))
  const phone = () => `09${int(15, 99)}${String(int(0, 9999999)).padStart(7, "0")}`
  const today = startOfDay(nowMs)
  const at = (d: Date, h: number, m = 0) => setMinutes(setHours(d, h), m).toISOString()

  // ---------- Plans ----------
  const plans: Plan[] = [
    { id: "plan-monthly", name: "Monthly", durationDays: 30, price: 1500, description: "Full 24/7 floor access for 30 days.", perks: ["24/7 access", "Locker use", "Free fitness assessment"], active: true },
    { id: "plan-student", name: "Student Monthly", durationDays: 30, price: 1200, description: "Monthly access for students with a valid ID.", perks: ["24/7 access", "Locker use"], active: true },
    { id: "plan-quarterly", name: "Quarterly", durationDays: 90, price: 4000, description: "Three months of 24/7 access.", perks: ["24/7 access", "Locker use", "1 free PT session"], active: true },
    { id: "plan-semi", name: "Semi-Annual", durationDays: 180, price: 7500, description: "Six months of 24/7 access.", perks: ["24/7 access", "Locker use", "2 free PT sessions", "XPRO shaker"], active: true },
    { id: "plan-annual", name: "Annual (12 + 2 promo)", durationDays: 425, price: 18000, description: "Pay 12 months, get 2 months free.", perks: ["24/7 access", "Locker use", "4 free PT sessions", "Limited edition XPRO cap"], active: true },
  ]
  const planById = new Map(plans.map((p) => [p.id, p]))

  // ---------- Trainers ----------
  const weekdays = (start: string, end: string, days: number[]): Availability[] =>
    Array.from({ length: 7 }, (_, day) => ({ day, enabled: days.includes(day), start, end }))
  const trainers: Trainer[] = [
    { id: "tr-1", firstName: "Marco", lastName: "Santos", email: DEMO_TRAINER_EMAIL, phone: "09175550101", specializations: ["Strength & Conditioning", "Powerlifting"], bio: "Former collegiate powerlifter. Helps lifters build a strong base with simple, progressive programs.", ratePerSession: 600, availability: weekdays("06:00", "12:00", [1, 2, 3, 4, 5, 6]), active: true, joinedAt: subDays(today, 700).toISOString() },
    { id: "tr-2", firstName: "Bianca", lastName: "Reyes", email: "bianca.reyes@xpro.ph", phone: "09175550102", specializations: ["Weight Loss", "HIIT", "Functional Training"], bio: "Certified coach focused on sustainable fat loss and conditioning.", ratePerSession: 550, availability: weekdays("15:00", "21:00", [1, 2, 3, 4, 5]), active: true, joinedAt: subDays(today, 520).toISOString() },
    { id: "tr-3", firstName: "Jerome", lastName: "Villanueva", email: "jerome.villanueva@xpro.ph", phone: "09175550103", specializations: ["Bodybuilding", "Strength & Conditioning"], bio: "Physique competitor. Hypertrophy programming and posing prep.", ratePerSession: 650, availability: weekdays("17:00", "23:00", [0, 1, 3, 5, 6]), active: true, joinedAt: subDays(today, 410).toISOString() },
    { id: "tr-4", firstName: "Andrea", lastName: "Castillo", email: "andrea.castillo@xpro.ph", phone: "09175550104", specializations: ["Mobility & Rehab", "Senior Fitness"], bio: "Physical therapy background. Mobility, injury prevention and safe return to training.", ratePerSession: 700, availability: weekdays("08:00", "14:00", [1, 3, 5, 6]), active: true, joinedAt: subDays(today, 300).toISOString() },
    { id: "tr-5", firstName: "Paolo", lastName: "Mercado", email: "paolo.mercado@xpro.ph", phone: "09175550105", specializations: ["Boxing", "HIIT", "Sports Performance"], bio: "Amateur boxing coach. Conditioning, footwork and pad work.", ratePerSession: 500, availability: weekdays("18:00", "22:00", [1, 2, 4, 6]), active: true, joinedAt: subDays(today, 180).toISOString() },
  ]

  // ---------- Members ----------
  const members: Member[] = []
  const payments: Payment[] = []
  const methods: PaymentMethod[] = ["cash", "cash", "gcash", "gcash", "maya", "card", "bank"]
  const planPool = ["plan-monthly", "plan-monthly", "plan-monthly", "plan-student", "plan-quarterly", "plan-quarterly", "plan-semi", "plan-annual"]
  const usedNames = new Set<string>()

  for (let i = 0; i < 42; i++) {
    const isDemo = i === 0
    const gender = isDemo ? "male" : rand() < 0.55 ? "male" : "female"
    let firstName = isDemo ? "Juan" : pick(gender === "male" ? FIRST_M : FIRST_F)
    let lastName = isDemo ? "Dela Cruz" : pick(LAST)
    while (!isDemo && usedNames.has(`${firstName} ${lastName}`)) {
      firstName = pick(gender === "male" ? FIRST_M : FIRST_F)
      lastName = pick(LAST)
    }
    usedNames.add(`${firstName} ${lastName}`)

    const planId = isDemo ? "plan-quarterly" : pick(planPool)
    const plan = planById.get(planId)!
    // Days until the current period ends: a handful expired, a handful expiring, the rest active.
    const remaining = isDemo
      ? 50
      : i % 9 === 1
        ? -int(1, 40)
        : i % 9 === 2
          ? int(0, 7)
          : int(8, Math.max(9, plan.durationDays - 1))
    const end = addDays(today, remaining)
    const startDate = isoDate(subDays(end, plan.durationDays - 1))
    const hadPrevious = isDemo || rand() < 0.55
    const joined = hadPrevious ? subDays(toDate(startDate), plan.durationDays + int(0, 60)) : toDate(startDate)

    const id = `mem-${String(i + 1).padStart(3, "0")}`
    const slug = `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, "")
    members.push({
      id,
      code: `XP-${String(1001 + i)}`,
      firstName,
      lastName,
      email: isDemo ? DEMO_MEMBER_EMAIL : `${slug}${int(1, 99)}@gmail.com`,
      phone: isDemo ? "09171234567" : phone(),
      gender,
      birthDate: isoDate(subDays(today, int(18 * 365, 52 * 365))),
      address: `${int(1, 120)} ${pick(STREETS)}, ${pick(BARANGAYS)}, General Trias, Cavite`,
      emergencyName: `${pick([...FIRST_M, ...FIRST_F])} ${lastName}`,
      emergencyPhone: phone(),
      planId,
      startDate,
      endDate: membershipEnd(startDate, plan.durationDays),
      trainerId: isDemo ? "tr-1" : rand() < 0.5 ? pick(trainers).id : null,
      joinedAt: joined.toISOString(),
      notes: isDemo ? "Wants to hit a 140 kg deadlift by year end." : "",
    })

    const method = pick(methods)
    if (hadPrevious) {
      payments.push({
        id: `pay-${id}-prev`,
        receiptNo: "",
        memberId: id,
        planId,
        amount: plan.price,
        method,
        type: "new",
        paidAt: at(joined, int(7, 21), int(0, 59)),
        description: `${plan.name} membership`,
        recordedBy: "Front desk",
      })
    }
    payments.push({
      id: `pay-${id}`,
      receiptNo: "",
      memberId: id,
      planId,
      amount: plan.price,
      method,
      type: hadPrevious ? "renewal" : "new",
      paidAt: at(toDate(startDate), int(7, 21), int(0, 59)),
      description: `${plan.name} membership`,
      recordedBy: "Front desk",
    })
  }

  // ---------- Sessions (PT) ----------
  const sessions: TrainingSession[] = []
  const taken = new Set<string>()
  const trainerById = new Map(trainers.map((t) => [t.id, t]))
  const focuses = ["Lower body strength", "Upper body push", "Pull day", "Conditioning", "Technique: squat", "Technique: deadlift", "Mobility", "Full body"]
  const bookSlot = (memberId: string, trainerId: string, dayOffset: number, status: TrainingSession["status"]) => {
    const t = trainerById.get(trainerId)!
    for (let tries = 0; tries < 14; tries++) {
      const d = addDays(today, dayOffset + tries * (dayOffset < 0 ? -1 : 1))
      const window = t.availability.find((a) => a.day === d.getDay() && a.enabled)
      if (!window) continue
      const sh = Number(window.start.slice(0, 2))
      const eh = Number(window.end.slice(0, 2))
      const hour = int(sh, eh - 1)
      const time = `${String(hour).padStart(2, "0")}:00`
      const key = `${trainerId}|${isoDate(d)}|${time}`
      if (taken.has(key)) continue
      if (status === "booked" && setHours(d, hour).getTime() <= nowMs) continue
      taken.add(key)
      sessions.push({
        id: `ses-${sessions.length + 1}`,
        memberId,
        trainerId,
        date: isoDate(d),
        time,
        durationMin: 60,
        focus: pick(focuses),
        status,
        notes: status === "completed" ? pick(["Good session, increased load by 5 kg.", "Worked on bracing. Form improving.", "Conditioning circuit completed, solid pace.", "Focused on depth and tempo."]) : "",
        createdAt: subDays(d, int(1, 5)).toISOString(),
        completedAt: status === "completed" ? setHours(d, hour + 1).toISOString() : null,
      })
      return
    }
  }
  for (const m of members) {
    if (!m.trainerId) continue
    const past = m.id === "mem-001" ? 6 : int(1, 4)
    for (let k = 0; k < past; k++) bookSlot(m.id, m.trainerId, -int(1, 28), rand() < 0.9 ? "completed" : "no-show")
    if (m.id === "mem-001" || rand() < 0.6) bookSlot(m.id, m.trainerId, int(0, 6), "booked")
  }
  // PT payments for completed sessions, bundled per member
  for (const m of members) {
    const done = sessions.filter((s) => s.memberId === m.id && s.status === "completed")
    if (!done.length || !m.trainerId) continue
    const rate = trainerById.get(m.trainerId)!.ratePerSession
    payments.push({
      id: `pay-${m.id}-pt`,
      receiptNo: "",
      memberId: m.id,
      planId: null,
      amount: rate * done.length,
      method: pick(methods),
      type: "personal-training",
      paidAt: done[0].createdAt,
      description: `${done.length} personal training session${done.length > 1 ? "s" : ""}`,
      recordedBy: "Front desk",
    })
  }

  // receipt numbers in chronological order
  payments.sort((a, b) => a.paidAt.localeCompare(b.paidAt))
  payments.forEach((p, i) => (p.receiptNo = `OR-${p.paidAt.slice(0, 4)}-${String(i + 1).padStart(5, "0")}`))

  // ---------- Check-ins ----------
  const checkIns: CheckIn[] = []
  for (const m of members) {
    for (let d = 29; d >= 0; d--) {
      const day = subDays(today, d)
      if (isoDate(day) < m.startDate || isoDate(day) > m.endDate) continue
      if (rand() > (m.id === "mem-001" ? 0.6 : 0.33)) continue
      const hour = pick([5, 6, 6, 7, 11, 12, 17, 18, 18, 19, 19, 20, 21, 22, 23, 1])
      const time = setMinutes(setHours(day, hour), int(0, 59))
      if (time.getTime() > nowMs) continue
      checkIns.push({ id: `chk-${checkIns.length + 1}`, memberId: m.id, at: time.toISOString() })
    }
  }
  checkIns.sort((a, b) => b.at.localeCompare(a.at))

  // ---------- Workout plans ----------
  const workoutPlans: WorkoutPlan[] = [
    {
      id: "wp-1", trainerId: "tr-1", title: "Strength Base 5x5", goal: "Build strength", daysPerWeek: 3,
      description: "Linear progression on the big lifts. Add 2.5 kg each session while form stays clean.",
      exercises: [
        { name: "Back squat", sets: 5, reps: "5", rest: "3 min", notes: "Belt optional on last 2 sets" },
        { name: "Bench press", sets: 5, reps: "5", rest: "3 min", notes: "" },
        { name: "Barbell row", sets: 5, reps: "5", rest: "2 min", notes: "Strict, no body English" },
        { name: "Deadlift", sets: 1, reps: "5", rest: "-", notes: "Fridays only" },
      ],
      memberIds: [], createdAt: subDays(today, 60).toISOString(),
    },
    {
      id: "wp-2", trainerId: "tr-1", title: "Deadlift Specialization", goal: "Deadlift PR", daysPerWeek: 4,
      description: "Six-week block to push the deadlift with accessory work for the posterior chain.",
      exercises: [
        { name: "Conventional deadlift", sets: 4, reps: "3", rest: "3-4 min", notes: "RPE 8" },
        { name: "Romanian deadlift", sets: 3, reps: "8", rest: "2 min", notes: "" },
        { name: "Hip thrust", sets: 3, reps: "10", rest: "90 s", notes: "" },
        { name: "Hanging leg raise", sets: 3, reps: "12", rest: "60 s", notes: "" },
      ],
      memberIds: [], createdAt: subDays(today, 20).toISOString(),
    },
    {
      id: "wp-3", trainerId: "tr-2", title: "Fat Loss Circuit", goal: "Lose fat", daysPerWeek: 4,
      description: "Full-body circuits with short rests. Pair with a daily step goal of 8,000.",
      exercises: [
        { name: "Goblet squat", sets: 3, reps: "15", rest: "30 s", notes: "" },
        { name: "Push-up", sets: 3, reps: "AMRAP", rest: "30 s", notes: "" },
        { name: "Kettlebell swing", sets: 3, reps: "20", rest: "30 s", notes: "" },
        { name: "Rower", sets: 3, reps: "250 m", rest: "60 s", notes: "Hard pace" },
      ],
      memberIds: [], createdAt: subDays(today, 45).toISOString(),
    },
    {
      id: "wp-4", trainerId: "tr-3", title: "Push / Pull / Legs", goal: "Build muscle", daysPerWeek: 6,
      description: "Classic hypertrophy split, 8-12 rep range, progressive overload weekly.",
      exercises: [
        { name: "Incline dumbbell press", sets: 4, reps: "8-10", rest: "2 min", notes: "" },
        { name: "Lat pulldown", sets: 4, reps: "10-12", rest: "90 s", notes: "" },
        { name: "Leg press", sets: 4, reps: "12", rest: "2 min", notes: "" },
        { name: "Cable lateral raise", sets: 3, reps: "15", rest: "60 s", notes: "" },
      ],
      memberIds: [], createdAt: subDays(today, 30).toISOString(),
    },
    {
      id: "wp-5", trainerId: "tr-4", title: "Mobility Reset", goal: "Move better", daysPerWeek: 3,
      description: "Joint-friendly mobility and stability work for desk workers.",
      exercises: [
        { name: "90/90 hip switch", sets: 2, reps: "10/side", rest: "30 s", notes: "" },
        { name: "Thoracic open book", sets: 2, reps: "8/side", rest: "30 s", notes: "" },
        { name: "Dead bug", sets: 3, reps: "10", rest: "45 s", notes: "" },
      ],
      memberIds: [], createdAt: subDays(today, 15).toISOString(),
    },
    {
      id: "wp-6", trainerId: "tr-5", title: "Fight Conditioning", goal: "Conditioning", daysPerWeek: 3,
      description: "Rounds-based conditioning to build gas tank and footwork.",
      exercises: [
        { name: "Shadow boxing", sets: 3, reps: "3 min", rest: "1 min", notes: "" },
        { name: "Heavy bag", sets: 5, reps: "2 min", rest: "1 min", notes: "" },
        { name: "Jump rope", sets: 3, reps: "3 min", rest: "1 min", notes: "" },
      ],
      memberIds: [], createdAt: subDays(today, 10).toISOString(),
    },
  ]
  for (const m of members) {
    if (!m.trainerId) continue
    const options = workoutPlans.filter((w) => w.trainerId === m.trainerId)
    if (!options.length) continue
    const plan = m.id === "mem-001" ? workoutPlans[0] : pick(options)
    plan.memberIds.push(m.id)
  }
  workoutPlans[1].memberIds.push("mem-001")

  // ---------- Progress ----------
  const progress: ProgressLog[] = []
  for (const m of members) {
    if (!m.trainerId && m.id !== "mem-001") continue
    const startWeight = m.id === "mem-001" ? 86 : m.gender === "male" ? int(68, 98) : int(52, 80)
    const trend = m.id === "mem-001" ? -0.9 : rand() < 0.7 ? -(rand() * 1.2 + 0.2) : rand() * 0.8 + 0.2
    for (let k = 5; k >= 0; k--) {
      const step = 5 - k
      const waistBase = m.gender === "male" ? 92 : 76
      progress.push({
        id: `prg-${m.id}-${k}`,
        memberId: m.id,
        date: isoDate(subDays(today, k * 21 + 2)),
        weight: Math.round((startWeight + trend * step * 1.4 + (rand() - 0.5)) * 10) / 10,
        bodyFat: Math.round((m.gender === "male" ? 24 : 30) * 10 + trend * step * 4 + (rand() - 0.5) * 5) / 10,
        chest: Math.round((m.gender === "male" ? 102 : 88) + trend * step * 0.3),
        waist: Math.round(waistBase + trend * step * 0.9),
        hips: Math.round((m.gender === "male" ? 98 : 100) + trend * step * 0.5),
        arms: Math.round((m.gender === "male" ? 34 : 28) - trend * step * 0.15),
        thighs: Math.round((m.gender === "male" ? 58 : 56) + trend * step * 0.2),
        notes: step === 0 ? "Starting measurements" : "",
        loggedBy: step % 2 ? "member" : "trainer",
      })
    }
  }

  // ---------- Announcements & notifications ----------
  const announcements: Announcement[] = [
    { id: "ann-1", title: "New cable towers are in!", body: "Two new multi-station cable towers were installed beside the rigs. Please re-rack attachments after use.", audience: "all", pinned: true, createdAt: subDays(today, 2).toISOString(), author: "XPRO Management" },
    { id: "ann-2", title: "Refer a friend promo", body: "Bring a friend to sign up this month and get one month of membership free. Ask the front desk for details.", audience: "members", pinned: false, createdAt: subDays(today, 6).toISOString(), author: "XPRO Management" },
    { id: "ann-3", title: "Deep cleaning schedule", body: "The locker room will be deep cleaned every Wednesday 2:00 AM to 3:00 AM. The gym floor stays open.", audience: "all", pinned: false, createdAt: subDays(today, 12).toISOString(), author: "XPRO Management" },
    { id: "ann-4", title: "Trainer meeting", body: "Monthly trainer meeting this Saturday at 1:00 PM. We will review client progress reports.", audience: "trainers", pinned: false, createdAt: subDays(today, 3).toISOString(), author: "XPRO Management" },
  ]
  const notifications: Notification[] = [
    { id: "ntf-1", memberId: "mem-001", title: "PT session confirmed", body: "Your session with Coach Marco is confirmed. See you on the floor!", createdAt: subDays(today, 1).toISOString(), read: false },
    { id: "ntf-2", memberId: "mem-001", title: "New workout plan assigned", body: "Coach Marco assigned you \"Deadlift Specialization\".", createdAt: subDays(today, 20).toISOString(), read: true },
  ]

  return { plans, members, payments, checkIns, trainers, workoutPlans, sessions, progress, announcements, notifications }
}
