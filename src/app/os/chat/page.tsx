import { MessageCircle } from "lucide-react"
import { ChatPosteingang } from "@/components/chat/ChatPosteingang"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Nachrichten | Praxis OS",
}

export default function TherapeuthChatPostfachPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nachrichten</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Alle Gespräche mit deinen Patienten
          </p>
        </div>
      </div>

      {/* Conversation list */}
      <Card className="overflow-hidden p-0">
        <ChatPosteingang />
      </Card>
    </div>
  )
}
