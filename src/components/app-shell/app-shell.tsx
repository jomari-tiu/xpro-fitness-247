"use client"

import { ChevronsUpDown, ExternalLink, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense, useEffect, useMemo } from "react"
import { DbGate, PageSkeleton } from "@/components/db-gate"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useNow } from "@/hooks/use-now"
import { useDb, useSession } from "@/lib/store/db"
import { membershipStatus } from "@/lib/selectors"
import { AREA_ROLES, AREA_TITLE, NAV, type Area, type NavItem } from "./nav"

export function AppShell({ area, children }: { area: Area; children: React.ReactNode }) {
  return (
    <DbGate fallback={<PageSkeleton />}>
      <Guarded area={area}>
        <SidebarProvider>
          <AppSidebar area={area} />
          <SidebarInset>
            <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
              <span className="font-mono text-xs tracking-[.08em] text-muted-foreground uppercase">{AREA_TITLE[area]}</span>
            </header>
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6">
              <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </Guarded>
    </DbGate>
  )
}

function Guarded({ area, children }: { area: Area; children: React.ReactNode }) {
  const user = useSession((s) => s.user)
  const router = useRouter()
  const exists = useDb((s) => {
    if (!user) return false
    if (user.role === "member") return s.members.some((m) => m.id === user.memberId)
    if (user.role === "trainer") return s.trainers.some((t) => t.id === user.trainerId)
    return true
  })
  const allowed = !!user && exists && AREA_ROLES[area].includes(user.role)

  useEffect(() => {
    if (!allowed) router.replace("/login")
  }, [allowed, router])

  if (!allowed) return <PageSkeleton />
  return children
}

function useBadgeCount(badge: NavItem["badge"]) {
  const now = useNow()
  const memberId = useSession((s) => s.user?.memberId)
  const members = useDb((s) => s.members)
  const notifications = useDb((s) => s.notifications)
  return useMemo(() => {
    if (badge === "alerts") return members.filter((m) => membershipStatus(m, now) !== "active").length
    if (badge === "notifications") return notifications.filter((n) => n.memberId === memberId && !n.read).length
    return 0
  }, [badge, members, notifications, memberId, now])
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const count = useBadgeCount(item.badge)
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
        <Link href={item.href} onClick={() => setOpenMobile(false)}>
          <item.icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
      {count > 0 && <SidebarMenuBadge className="bg-primary/15 text-primary">{count}</SidebarMenuBadge>}
    </SidebarMenuItem>
  )
}

function AppSidebar({ area }: { area: Area }) {
  const pathname = usePathname()
  const user = useSession((s) => s.user)!
  const signOut = useSession((s) => s.signOut)
  const router = useRouter()
  const root = `/${area}`
  const isActive = (href: string) => (href === root ? pathname === root : pathname.startsWith(href))

  return (
    <Sidebar collapsible="icon" className="no-print">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={root}>
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-black">
                  <Image
                    src="/images/logo.jpg"
                    alt=""
                    width={64}
                    height={64}
                    className="size-8 scale-[1.9] object-cover object-[46%_50%] mix-blend-lighten"
                  />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-black tracking-tight uppercase [font-stretch:125%]">XPRO 24/7</span>
                  <span className="text-xs text-muted-foreground">{AREA_TITLE[area]}</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV[area].map((group) => {
          const items = group.items.filter((i) => !i.roles || i.roles.includes(user.role))
          if (!items.length) return null
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {items.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(item.href)} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/15 text-xs font-bold text-primary">
                      {user.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-col text-left leading-tight">
                    <span className="truncate text-sm font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground capitalize">{user.role}</span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <ExternalLink /> View public site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    signOut()
                    router.replace("/login")
                  }}
                >
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
