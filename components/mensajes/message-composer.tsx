"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send } from "lucide-react"
import type { Member, MessageType } from "@/lib/types"

interface MessageComposerProps {
  members: Member[]
  onSend: (data: { type: MessageType; recipient: string; content: string }) => void
}

const messageTemplates = {
  renewal: "¡Hola! Tu membresía ha sido renovada exitosamente. ¡Gracias por seguir con nosotros! 💪",
  birthday: "¡Feliz cumpleaños! 🎉 Disfruta de un día de entrenamiento gratis como regalo.",
  payment_reminder:
    "Recordatorio: Tu pago vence en 3 días. Por favor realiza tu pago para evitar interrupciones en tu membresía.",
  custom: "",
}

export function MessageComposer({ members, onSend }: MessageComposerProps) {
  const [messageType, setMessageType] = useState<MessageType>("renewal")
  const [recipient, setRecipient] = useState<string>("")
  const [content, setContent] = useState(messageTemplates.renewal)

  const handleTypeChange = (type: MessageType) => {
    setMessageType(type)
    setContent(messageTemplates[type])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !content.trim()) return

    onSend({ type: messageType, recipient, content })

    // Reset form
    setRecipient("")
    setContent(messageTemplates[messageType])
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className="text-white">Enviar Mensaje</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Selecciona una plantilla o escribe un mensaje personalizado</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Mensaje</Label>
            <Select value={messageType} onValueChange={(value: MessageType) => handleTypeChange(value)}>
              <SelectTrigger className="bg-secondary border-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="renewal" className="text-white">
                  Renovación Confirmada
                </SelectItem>
                <SelectItem value="birthday" className="text-white">
                  Feliz Cumpleaños
                </SelectItem>
                <SelectItem value="payment_reminder" className="text-white">
                  Recordatorio de Pago
                </SelectItem>
                <SelectItem value="custom" className="text-white">
                  Mensaje Personalizado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Destinatario</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger className="bg-secondary border-border text-white">
                <SelectValue placeholder="Selecciona un socio" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-[200px]">
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.name} className="text-white">
                    {member.name} - {member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Mensaje</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-secondary border-border text-white min-h-[120px]"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={!recipient || !content.trim()}>
            <Send className="h-4 w-4" />
            Enviar Mensaje
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
