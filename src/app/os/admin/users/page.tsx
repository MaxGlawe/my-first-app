import { UserListTable } from "@/components/admin/UserListTable"

export const metadata = {
  title: "Nutzerverwaltung | Praxis OS Admin",
  description: "Nutzer anlegen, Rollen zuweisen und Konten verwalten",
}

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Nutzerverwaltung</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte Therapeuten, Admins und Patienten. Weise Rollen zu und deaktiviere Konten.
        </p>
      </div>

      <UserListTable />
    </div>
  )
}
