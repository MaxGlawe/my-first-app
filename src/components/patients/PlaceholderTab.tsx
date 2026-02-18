import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface PlaceholderTabProps {
  title: string
  description: string
  projId: string
}

export function PlaceholderTab({ title, description, projId }: PlaceholderTabProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
        <p className="text-xs text-muted-foreground mt-3 font-mono">{projId}</p>
      </CardContent>
    </Card>
  )
}
