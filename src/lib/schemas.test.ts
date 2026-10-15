import { describe, expect, it } from "vitest"
import { memberSchema, planSchema } from "./schemas"

const validMember = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan@example.com",
  phone: "09171234567",
  gender: "male",
  birthDate: "1995-04-12",
  address: "Brookside Lane, General Trias",
  emergencyName: "Maria Dela Cruz",
  emergencyPhone: "+639171234567",
  planId: "plan-monthly",
  startDate: "2026-10-15",
  trainerId: "",
  notes: "",
}

describe("memberSchema", () => {
  it("accepts a valid member", () => {
    expect(memberSchema.safeParse(validMember).success).toBe(true)
  })
  it("rejects a non-PH phone number", () => {
    const result = memberSchema.safeParse({ ...validMember, phone: "12345" })
    expect(result.success).toBe(false)
  })
})

describe("planSchema", () => {
  it("rejects a zero price and NaN duration", () => {
    const result = planSchema.safeParse({
      name: "Monthly", durationDays: Number.NaN, price: 0, description: "", perks: "", active: true,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues.map((i) => i.path[0])).toEqual(expect.arrayContaining(["durationDays", "price"]))
  })
})
