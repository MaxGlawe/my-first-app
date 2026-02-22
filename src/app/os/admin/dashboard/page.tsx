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
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Willkommen bei Praxis OS. Verwalte deine Praxis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <UserCog className="h-5 w-5 text-emerald-600" />
              </div>
              Nutzerverwaltung
            </CardTitle>
            <CardDescription>Therapeuten anlegen und Rollen vergeben</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/os/admin/users">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0">Nutzer verwalten</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              Patienten
            </CardTitle>
            <CardDescription>Alle Patienten der Praxis einsehen und verwalten</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/os/patients">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0">Zur Patientenliste</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Link2 className="h-5 w-5 text-green-600" />
              </div>
              Integrationen
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                Aktiv
              </Badge>
            </CardTitle>
            <CardDescription>Buchungstool verbinden und Webhook konfigurieren</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/os/admin/integrations">
              <Button variant="outline" className="w-full hover:border-emerald-300 hover:text-emerald-700">Integrationen verwalten</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <BarChart3 className="h-5 w-5 text-slate-400" />
              </div>
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
