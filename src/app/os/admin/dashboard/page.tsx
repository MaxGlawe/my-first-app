import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { UserCog, Users, Link2, BarChart3 } from "lucide-react"

export const metadata = {
  title: "Admin Dashboard | Praxis OS",
}

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Willkommen bei Praxis OS. Verwalte deine Praxis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-emerald-600" />
              Nutzerverwaltung
            </CardTitle>
            <CardDescription>Therapeuten anlegen und Rollen vergeben</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/os/admin/users">
              <Button className="w-full">Nutzer verwalten</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Patienten
            </CardTitle>
            <CardDescription>Alle Patienten der Praxis einsehen und verwalten</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/os/patients">
              <Button className="w-full">Zur Patientenliste</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-green-600" />
              Integrationen
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                Aktiv
              </Badge>
            </CardTitle>
            <CardDescription>Buchungstool verbinden und Webhook konfigurieren</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/os/admin/integrations">
              <Button variant="outline" className="w-full">Integrationen verwalten</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-400" />
              Statistiken
            </CardTitle>
            <CardDescription>Auslastung und Praxisberichte</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Kommt bald
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
