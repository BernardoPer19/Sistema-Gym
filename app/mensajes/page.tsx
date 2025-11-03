"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { MessageComposer } from "@/components/mensajes/message-composer"
import { MessageHistory } from "@/components/mensajes/message-history"
import { messages as initialMessages, members } from "@/lib/mock-data"
import type { Message, MessageType } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function MensajesPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const { toast } = useToast()

  const handleSendMessage = (data: { type: MessageType; recipient: string; content: string }) => {
    const newMessage: Message = {
      id: `msg-${messages.length + 1}`,
      type: data.type,
      recipient: data.recipient,
      content: data.content,
      status: "sent",
      date: new Date(),
    }

    setMessages([newMessage, ...messages])

    toast({
      title: "Mensaje enviado",
      description: `El mensaje ha sido enviado a ${data.recipient}`,
    })
  }

  // Sort messages by date (most recent first)
  const sortedMessages = [...messages].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="flex flex-col">
      <Header title="Mensajes" description="Comunicación con socios" />

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <MessageComposer members={members} onSend={handleSendMessage} />
          <MessageHistory messages={sortedMessages} />
        </div>
      </div>

      <Toaster />
    </div>
  )
}
