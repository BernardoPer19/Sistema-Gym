"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, AlertCircle, DollarSign, MessageSquare, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/types"
import { notifications as mockNotifications } from "@/lib/mock-data"
import { useSession } from "next-auth/react"

export function NotificationPanel() {
  const user = useSession().data?.user
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load notifications from localStorage or use mock data
    const stored = localStorage.getItem("gym_notifications")
    if (stored) {
      const parsed = JSON.parse(stored)
      setNotifications(
        parsed.map((n: Notification) => ({
          ...n,
          date: new Date(n.date),
        })),
      )
    } else {
      // Filter notifications by user role
      const filtered = mockNotifications.filter((n) => {
        if (user?.role === "client") {
          return !n.userId || n.userId === user.id
        }
        return !n.userId
      })
      setNotifications(filtered)
      localStorage.setItem("gym_notifications", JSON.stringify(filtered))
    }
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updated)
    localStorage.setItem("gym_notifications", JSON.stringify(updated))
  }

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem("gym_notifications", JSON.stringify(updated))
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id)
    setNotifications(updated)
    localStorage.setItem("gym_notifications", JSON.stringify(updated))
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "expiry":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "payment":
        return <DollarSign className="h-5 w-5 text-green-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "system":
        return <Info className="h-5 w-5 text-purple-500" />
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return "Hace unos minutos"
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`
    return date.toLocaleDateString("es-MX", { month: "short", day: "numeric" })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full border-neutral-800 bg-neutral-950 sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white">Notificaciones</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-neutral-400">
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-8rem)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-4 h-12 w-12 text-neutral-700" />
              <p className="text-sm text-neutral-400">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative rounded-lg border p-4 transition-colors",
                    notification.read ? "border-neutral-800 bg-neutral-900/50" : "border-neutral-700 bg-neutral-900",
                  )}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-neutral-400">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-neutral-500">{formatDate(notification.date)}</p>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Marcar como leída
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
