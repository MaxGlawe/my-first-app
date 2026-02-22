import { UserListTable } from "@/components/admin/UserListTable"
import { UserCog } from "lucide-react"

export const metadata = {
  title: "Nutzerverwaltung | Praxis OS Admin",
  description: "Nutzer anlegen, Rollen zuweisen und Konten verwalten",
}

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-100/60 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <UserCog className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nutzerverwaltung</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Verwalte Therapeuten, Admins und Patienten. Weise Rollen zu und deaktiviere Konten.
            </p>
          </div>
        </div>
      </div>

      <UserListTable />
    </div>
  )
}
