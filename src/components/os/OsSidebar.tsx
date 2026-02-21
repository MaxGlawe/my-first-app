"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserCog,
  Dumbbell,
  ClipboardList,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Settings,
  Link2,
  LogOut,
  Activity,
  ClipboardCheck,
  FileText,
  Calendar,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useUserRole } from "@/hooks/use-user-role"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export function OsSidebar() {
  const pathname = usePathname()
  const { role, isAdmin, isTrainer, isPraxismanagement } = useUserRole()

  // ── Praxis section (visible to all OS roles) ──
  const praxisNav: NavItem[] = [
    { label: "Dashboard", href: "/os/dashboard", icon: LayoutDashboard },
    { label: "Patienten", href: "/os/patients", icon: Users },
  ]

  // Praxismanagement doesn't have Nachrichten write access, but can read
  // All other roles get Nachrichten
  if (!isPraxismanagement) {
    praxisNav.push({ label: "Nachrichten", href: "/os/chat", icon: MessageCircle })
  }

  // ── Therapie-Tools section ──
  // Only shown for clinical roles + trainer roles (NOT praxismanagement)
  const showTherapieTools = !isPraxismanagement

  const therapieToolsNav: NavItem[] = []
  if (showTherapieTools) {
    therapieToolsNav.push(
      { label: "Übungsdatenbank", href: "/os/exercises", icon: Dumbbell },
      { label: "Trainingspläne", href: "/os/training-plans", icon: ClipboardList },
      { label: "Hausaufgaben", href: "/os/hausaufgaben", icon: BookOpen },
      { label: "Kurse", href: "/os/courses", icon: GraduationCap },
    )
  }

  // ── Admin section ──
  const adminNav: NavItem[] = isAdmin
    ? [
        { label: "Admin-Dashboard", href: "/os/admin/dashboard", icon: Settings },
        { label: "Nutzerverwaltung", href: "/os/admin/users", icon: UserCog },
        { label: "Integrationen", href: "/os/admin/integrations", icon: Link2 },
      ]
    : []

  // Subtitle based on role
  const roleSubtitle =
    isPraxismanagement
      ? "Praxismanagement"
      : isTrainer
      ? "Trainer-Bereich"
      : isAdmin
      ? "Administration"
      : "Therapeuten-Bereich"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/os/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
                  P
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Praxis OS</span>
                  <span className="truncate text-xs text-muted-foreground">{roleSubtitle}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Praxis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {praxisNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {therapieToolsNav.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Therapie-Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {therapieToolsNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {adminNav.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action="/api/auth/signout" method="post">
              <SidebarMenuButton type="submit" tooltip="Abmelden">
                <LogOut />
                <span>Abmelden</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
