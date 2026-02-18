import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Dashboard | Praxis OS",
}

export default function TherapistDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Therapeuten-Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Willkommen bei Praxis OS. Hier siehst du deine heutigen Termine und Patienten.
          </p>
        </div>
        <form action="/api/auth/signout" method="post">
          <Button variant="outline" type="submit">Abmelden</Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Patienten</CardTitle>
            <CardDescription>Stammdaten und Behandlungshistorie</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/os/patients">
              <Button className="w-full">
                Zur Patientenliste
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anamnese & Untersuchung</CardTitle>
            <CardDescription>Dokumentation erstellen</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Kommt bald (PROJ-3)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Behandlungsdokumentation</CardTitle>
            <CardDescription>Behandlungen dokumentieren</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Kommt bald (PROJ-5)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Übungsdatenbank</CardTitle>
            <CardDescription>Übungen verwalten und durchsuchen</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/os/exercises">
              <Button className="w-full">
                Zur Übungsdatenbank
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trainingspläne</CardTitle>
            <CardDescription>Trainingspläne erstellen und zuweisen</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/os/training-plans">
              <Button className="w-full">
                Zu den Trainingsplänen
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Termine</CardTitle>
            <CardDescription>Buchungstool-Integration</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Kommt bald (PROJ-7)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
