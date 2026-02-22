import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { OsSidebar } from "@/components/os/OsSidebar"

export default function OsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <OsSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200/60 bg-white/60 backdrop-blur-sm px-6">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1" style={{ backgroundColor: "#faf9f7" }}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
