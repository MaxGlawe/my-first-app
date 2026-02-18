import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MeineTermineKarte } from "@/components/app/MeineTermineKarte"

export const metadata = {
  title: "Mein Dashboard | Praxis OS",
}

export default function PatientDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mein Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Willkommen in der Praxis OS Patienten-App.
          </p>
        </div>
        <form action="/api/auth/signout" method="post">
          <Button variant="outline" type="submit">Abmelden</Button>
        </form>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mein Trainingsplan</CardTitle>
            <CardDescription>Deine Übungen und Hausaufgaben</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Kommt bald (PROJ-11)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nachrichten</CardTitle>
            <CardDescription>Chat mit deinem Therapeuten</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Kommt bald (PROJ-12)
            </Button>
          </CardContent>
        </Card>

        <MeineTermineKarte />

        <Card>
          <CardHeader>
            <CardTitle>Kurse</CardTitle>
            <CardDescription>An Gruppenkursen teilnehmen</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Kommt bald (PROJ-13)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
