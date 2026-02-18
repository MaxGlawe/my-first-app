import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Admin Dashboard | Praxis OS",
}

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Willkommen bei Praxis OS. Verwalte deine Praxis.
          </p>
        </div>
        <form action="/api/auth/signout" method="post">
          <Button variant="outline" type="submit">Abmelden</Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Nutzerverwaltung</CardTitle>
            <CardDescription>Therapeuten anlegen und Rollen vergeben</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/os/admin/users">
              <Button className="w-full">Nutzer verwalten</Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patienten</CardTitle>
            <CardDescription>Alle Patienten der Praxis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Kommt bald (PROJ-2)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiken</CardTitle>
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
