import { KomplianzDashboard } from "@/components/hausaufgaben/KomplianzDashboard"

export const metadata = {
  title: "Hausaufgaben-Compliance | Praxis OS",
}

export default function HausaufgabenDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <KomplianzDashboard />
    </div>
  )
}
