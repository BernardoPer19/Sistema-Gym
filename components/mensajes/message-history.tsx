import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Mail, Calendar, Gift } from "lucide-react"
import type { Message } from "@/lib/types"

interface MessageHistoryProps {
  messages: Message[]
}

export function MessageHistory({ messages }: MessageHistoryProps) {
  const getMessageIcon = (type: Message["type"]) => {
    switch (type) {
      case "renewal":
        return <Mail className="h-4 w-4 text-primary" />
      case "birthday":
        return <Gift className="h-4 w-4 text-primary" />
      case "payment_reminder":
        return <Calendar className="h-4 w-4 text-primary" />
      default:
        return <MessageSquare className="h-4 w-4 text-primary" />
    }
  }

  const getTypeLabel = (type: Message["type"]) => {
    switch (type) {
      case "renewal":
        return "Renovación"
      case "birthday":
        return "Cumpleaños"
      case "payment_reminder":
        return "Recordatorio"
      default:
        return "Personalizado"
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-white">Historial de Mensajes</CardTitle>
        <p className="text-sm text-muted-foreground">Mensajes enviados recientemente</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="p-4 rounded-lg bg-secondary border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    {getMessageIcon(message.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{message.recipient}</p>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {getTypeLabel(message.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {message.date.toLocaleDateString("es-MX", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    message.status === "sent"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  }
                >
                  {message.status === "sent" ? "Enviado" : "Pendiente"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
