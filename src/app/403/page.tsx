import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Kein Zugriff | Praxis OS",
}

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-6xl font-bold text-muted-foreground">403</h1>
        <h2 className="text-2xl font-semibold">Kein Zugriff</h2>
        <p className="text-muted-foreground">
          Du hast keine Berechtigung, diese Seite aufzurufen. Diese Funktion erfordert
          erweiterte Rechte (Heilpraktiker oder Admin).
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/os/dashboard">
            <Button>Zurück zum Dashboard</Button>
          </a>
        </div>
      </div>
    </main>
  )
}
