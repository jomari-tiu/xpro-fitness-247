import { describe, expect, it } from "vitest"
import { toDate } from "./format"
import { availableSlots, membershipEnd, membershipStatus, renewalStart } from "./selectors"
import type { Availability } from "./types"

const now = toDate("2026-10-15T10:30").getTime()

describe("membershipStatus", () => {
  it("is active when more than 7 days remain", () => {
    expect(membershipStatus({ endDate: "2026-11-01" }, now)).toBe("active")
  })
  it("is expiring within 7 days, including today", () => {
    expect(membershipStatus({ endDate: "2026-10-22" }, now)).toBe("expiring")
    expect(membershipStatus({ endDate: "2026-10-15" }, now)).toBe("expiring")
  })
  it("is expired once the end date has passed", () => {
    expect(membershipStatus({ endDate: "2026-10-14" }, now)).toBe("expired")
  })
})

describe("membershipEnd / renewalStart", () => {
  it("counts the start day as day one", () => {
    expect(membershipEnd("2026-10-01", 30)).toBe("2026-10-30")
  })
  it("renews from the day after the current period when still active", () => {
    expect(renewalStart({ endDate: "2026-10-20" }, now)).toBe("2026-10-21")
  })
  it("renews from today when already expired", () => {
    expect(renewalStart({ endDate: "2026-10-01" }, now)).toBe("2026-10-15")
  })
})

describe("availableSlots", () => {
  // 2026-10-15 is a Thursday (day 4)
  const availability: Availability[] = [{ day: 4, enabled: true, start: "09:00", end: "13:00" }]

  it("skips past hours and already-booked slots", () => {
    const sessions = [
      {
        id: "s1", memberId: "m1", trainerId: "t1", date: "2026-10-15", time: "12:00", durationMin: 60,
        focus: "", status: "booked" as const, notes: "", createdAt: "", completedAt: null,
      },
    ]
    expect(availableSlots(availability, sessions, "t1", "2026-10-15", now)).toEqual(["11:00"])
  })
  it("returns nothing on a day off", () => {
    expect(availableSlots(availability, [], "t1", "2026-10-16", now)).toEqual([])
  })
})
