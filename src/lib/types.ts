export type Role = "admin" | "staff" | "trainer" | "member"

export type Gender = "male" | "female" | "other"
export type PaymentMethod = "cash" | "gcash" | "maya" | "card" | "bank"
export type PaymentType = "new" | "renewal" | "personal-training" | "other"
export type SessionStatus = "booked" | "completed" | "cancelled" | "no-show"
export type MembershipStatus = "active" | "expiring" | "expired"
export type Audience = "all" | "members" | "trainers"

export interface Plan {
  id: string
  name: string
  durationDays: number
  price: number
  description: string
  perks: string[]
  active: boolean
}

export interface Member {
  id: string
  code: string
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: Gender
  birthDate: string // yyyy-MM-dd
  address: string
  emergencyName: string
  emergencyPhone: string
  planId: string
  startDate: string // yyyy-MM-dd
  endDate: string // yyyy-MM-dd
  trainerId: string | null
  joinedAt: string // ISO
  notes: string
}

export interface Payment {
  id: string
  receiptNo: string
  memberId: string
  planId: string | null
  amount: number
  method: PaymentMethod
  type: PaymentType
  paidAt: string // ISO
  description: string
  recordedBy: string
}

export interface CheckIn {
  id: string
  memberId: string
  at: string // ISO
}

export interface Availability {
  day: number // 0 = Sunday
  enabled: boolean
  start: string // HH:mm
  end: string // HH:mm
}

export interface Trainer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specializations: string[]
  bio: string
  ratePerSession: number
  availability: Availability[]
  active: boolean
  joinedAt: string
}

export interface Exercise {
  name: string
  sets: number
  reps: string
  rest: string
  notes: string
}

export interface WorkoutPlan {
  id: string
  trainerId: string
  title: string
  goal: string
  description: string
  daysPerWeek: number
  exercises: Exercise[]
  memberIds: string[]
  createdAt: string
}

export interface TrainingSession {
  id: string
  memberId: string
  trainerId: string
  date: string // yyyy-MM-dd
  time: string // HH:mm
  durationMin: number
  focus: string
  status: SessionStatus
  notes: string
  createdAt: string
  completedAt: string | null
}

export interface ProgressLog {
  id: string
  memberId: string
  date: string // yyyy-MM-dd
  weight: number
  bodyFat: number | null
  chest: number | null
  waist: number | null
  hips: number | null
  arms: number | null
  thighs: number | null
  notes: string
  loggedBy: "member" | "trainer" | "staff"
}

export interface Announcement {
  id: string
  title: string
  body: string
  audience: Audience
  pinned: boolean
  createdAt: string
  author: string
}

export interface Notification {
  id: string
  memberId: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export interface SessionUser {
  role: Role
  name: string
  email: string
  memberId?: string
  trainerId?: string
}
