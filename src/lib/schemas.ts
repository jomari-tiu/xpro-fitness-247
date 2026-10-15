import { z } from "zod"

const PH_PHONE = /^(09\d{9}|\+639\d{9})$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

const required = (label: string) => z.string().trim().min(1, `${label} is required`)
const phone = (label = "Phone") =>
  z
    .string()
    .trim()
    .regex(PH_PHONE, `${label} must look like 09171234567 or +639171234567`)
const date = (label: string) => z.string().regex(DATE, `${label} is required`)
const money = (label: string) =>
  z.number({ error: `${label} is required` }).positive(`${label} must be greater than 0`)
const optionalMeasure = z.number().positive("Must be greater than 0").max(400).nullable()

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
export type LoginValues = z.infer<typeof loginSchema>

export const memberSchema = z.object({
  firstName: required("First name").max(60),
  lastName: required("Last name").max(60),
  email: z.email("Enter a valid email"),
  phone: phone(),
  gender: z.enum(["male", "female", "other"], { error: "Select a gender" }),
  birthDate: date("Birth date"),
  address: required("Address").max(200),
  emergencyName: required("Emergency contact").max(100),
  emergencyPhone: phone("Emergency phone"),
  planId: required("Plan"),
  startDate: date("Start date"),
  trainerId: z.string(),
  notes: z.string().max(500),
})
export type MemberValues = z.infer<typeof memberSchema>

export const memberRegistrationSchema = memberSchema.extend({
  paymentMethod: z.enum(["cash", "gcash", "maya", "card", "bank"]),
  recordPayment: z.boolean(),
})
export type MemberRegistrationValues = z.infer<typeof memberRegistrationSchema>

export const planSchema = z.object({
  name: required("Name").max(60),
  durationDays: z
    .number({ error: "Duration is required" })
    .int("Whole days only")
    .min(1, "At least 1 day")
    .max(730, "At most 730 days"),
  price: money("Price"),
  description: z.string().max(240),
  perks: z.string().max(1000),
  active: z.boolean(),
})
export type PlanValues = z.infer<typeof planSchema>

export const renewalSchema = z.object({
  memberId: required("Member"),
  planId: required("Plan"),
  startDate: date("Start date"),
  amount: money("Amount"),
  method: z.enum(["cash", "gcash", "maya", "card", "bank"]),
})
export type RenewalValues = z.infer<typeof renewalSchema>

export const paymentSchema = z.object({
  memberId: required("Member"),
  type: z.enum(["new", "renewal", "personal-training", "other"]),
  amount: money("Amount"),
  method: z.enum(["cash", "gcash", "maya", "card", "bank"]),
  description: required("Description").max(160),
})
export type PaymentValues = z.infer<typeof paymentSchema>

export const SPECIALIZATIONS = [
  "Strength & Conditioning",
  "Powerlifting",
  "Bodybuilding",
  "Weight Loss",
  "Functional Training",
  "HIIT",
  "Mobility & Rehab",
  "Boxing",
  "Senior Fitness",
  "Sports Performance",
] as const

export const trainerSchema = z.object({
  firstName: required("First name").max(60),
  lastName: required("Last name").max(60),
  email: z.email("Enter a valid email"),
  phone: phone(),
  specializations: z.array(z.string()).min(1, "Pick at least one specialization"),
  bio: z.string().max(600),
  ratePerSession: money("Rate"),
  active: z.boolean(),
})
export type TrainerValues = z.infer<typeof trainerSchema>

export const availabilitySchema = z.object({
  days: z
    .array(
      z
        .object({
          day: z.number(),
          enabled: z.boolean(),
          start: z.string().regex(TIME, "HH:mm"),
          end: z.string().regex(TIME, "HH:mm"),
        })
        .refine((d) => !d.enabled || d.end > d.start, { message: "End must be after start", path: ["end"] })
    )
    .length(7),
})
export type AvailabilityValues = z.infer<typeof availabilitySchema>

export const workoutPlanSchema = z.object({
  title: required("Title").max(80),
  goal: required("Goal").max(80),
  description: z.string().max(600),
  daysPerWeek: z.number({ error: "Required" }).int().min(1, "At least 1").max(7, "At most 7"),
  exercises: z
    .array(
      z.object({
        name: required("Exercise").max(80),
        sets: z.number({ error: "Required" }).int().min(1, "Min 1").max(20, "Max 20"),
        reps: required("Reps").max(20),
        rest: z.string().max(20),
        notes: z.string().max(160),
      })
    )
    .min(1, "Add at least one exercise"),
  memberIds: z.array(z.string()),
})
export type WorkoutPlanValues = z.infer<typeof workoutPlanSchema>

export const progressSchema = z.object({
  date: date("Date"),
  weight: z.number({ error: "Weight is required" }).min(25, "Too low").max(300, "Too high"),
  bodyFat: z.number().min(2, "Too low").max(70, "Too high").nullable(),
  chest: optionalMeasure,
  waist: optionalMeasure,
  hips: optionalMeasure,
  arms: optionalMeasure,
  thighs: optionalMeasure,
  notes: z.string().max(300),
})
export type ProgressValues = z.infer<typeof progressSchema>

export const bookingSchema = z.object({
  trainerId: required("Trainer"),
  date: date("Date"),
  time: z.string().regex(TIME, "Pick a time slot"),
  focus: required("Focus").max(80),
})
export type BookingValues = z.infer<typeof bookingSchema>

export const completeSessionSchema = z.object({
  status: z.enum(["completed", "no-show"]),
  notes: z.string().max(500),
})
export type CompleteSessionValues = z.infer<typeof completeSessionSchema>

export const announcementSchema = z.object({
  title: required("Title").max(100),
  body: required("Message").max(1000),
  audience: z.enum(["all", "members", "trainers"]),
  pinned: z.boolean(),
})
export type AnnouncementValues = z.infer<typeof announcementSchema>

export const assignClientsSchema = z.object({
  memberIds: z.array(z.string()),
})
export type AssignClientsValues = z.infer<typeof assignClientsSchema>
