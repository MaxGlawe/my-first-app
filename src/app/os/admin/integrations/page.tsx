import { WebhookConfigCard } from "@/components/admin/WebhookConfigCard"
import { WebhookEventLog } from "@/components/admin/WebhookEventLog"
import { Badge } from "@/components/ui/badge"
import { Plug } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Integrationen | Praxis OS Admin",
  description:
    "Buchungstool-Webhook konfigurieren und Event-Log überwachen",
}

export default async function AdminIntegrationsPage() {
  // Server-side role guard — non-admins are redirected
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/os")
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 text-blue-700">
            <Plug className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Integrationen</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">
                Buchungstool
              </Badge>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                Webhook-basiert
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Verbinde das Buchungstool mit Praxis OS. Patienten- und Termindaten
          werden automatisch per Webhook synchronisiert — kein manueller Import
          notwendig.
        </p>
      </div>

      {/* How it works info */}
      <div className="mb-6 rounded-lg border bg-muted/50 p-4">
        <h2 className="text-sm font-semibold mb-2">So funktioniert die Integration</h2>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Trage die Webhook-URL und das Secret im Buchungstool ein.</li>
          <li>
            Das Buchungstool sendet automatisch Events bei neuen Patienten und
            Terminen.
          </li>
          <li>
            Praxis OS prüft die HMAC-Signatur und verarbeitet die Events sicher.
          </li>
          <li>
            Termine erscheinen in der Patientenakte unter dem Tab &quot;Termine&quot;.
          </li>
        </ol>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        <WebhookConfigCard />
        <WebhookEventLog />
      </div>
    </div>
  )
}
