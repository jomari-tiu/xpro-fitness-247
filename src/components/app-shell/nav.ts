import {
  BadgeDollarSign,
  BellRing,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Home,
  LayoutDashboard,
  LineChart,
  Megaphone,
  RefreshCcw,
  ScanLine,
  Settings,
  Tags,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "@/lib/types"

export type Area = "admin" | "trainer" | "portal"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  roles?: Role[]
  badge?: "alerts" | "notifications"
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const AREA_ROLES: Record<Area, Role[]> = {
  admin: ["admin", "staff"],
  trainer: ["trainer"],
  portal: ["member"],
}

export const AREA_TITLE: Record<Area, string> = {
  admin: "Gym Management",
  trainer: "Trainer Hub",
  portal: "Member Portal",
}

export const NAV: Record<Area, NavGroup[]> = {
  admin: [
    {
      label: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Members",
      items: [
        { href: "/admin/members", label: "Members", icon: Users },
        { href: "/admin/attendance", label: "Check-ins", icon: ScanLine },
        { href: "/admin/renewals", label: "Renewals", icon: RefreshCcw },
        { href: "/admin/alerts", label: "Expiration alerts", icon: BellRing, badge: "alerts" },
      ],
    },
    {
      label: "Billing",
      items: [
        { href: "/admin/payments", label: "Payments", icon: BadgeDollarSign },
        { href: "/admin/plans", label: "Membership plans", icon: Tags },
      ],
    },
    {
      label: "Training",
      items: [
        { href: "/admin/trainers", label: "Trainers", icon: UserCog },
        { href: "/admin/sessions", label: "PT sessions", icon: CalendarCheck },
      ],
    },
    {
      label: "Gym",
      items: [
        { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
        { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin"] },
      ],
    },
  ],
  trainer: [
    {
      label: "Coaching",
      items: [
        { href: "/trainer", label: "Today", icon: LayoutDashboard },
        { href: "/trainer/clients", label: "My clients", icon: Users },
        { href: "/trainer/plans", label: "Workout plans", icon: ClipboardList },
      ],
    },
    {
      label: "Schedule",
      items: [
        { href: "/trainer/sessions", label: "Sessions", icon: CalendarCheck },
        { href: "/trainer/schedule", label: "Availability", icon: CalendarClock },
      ],
    },
  ],
  portal: [
    {
      label: "My gym",
      items: [
        { href: "/portal", label: "Home", icon: Home, badge: "notifications" },
        { href: "/portal/workouts", label: "Workouts", icon: Dumbbell },
        { href: "/portal/progress", label: "Progress", icon: LineChart },
        { href: "/portal/bookings", label: "Book a trainer", icon: CalendarDays },
        { href: "/portal/payments", label: "Payments", icon: BadgeDollarSign },
      ],
    },
  ],
}
