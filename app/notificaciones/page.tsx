"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Calendar, Users } from "lucide-react";
import type { Notification } from "@/lib/types/types";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { members } from "@/lib/mock-data";

function NotificationsContent() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState({
    type: "system" as Notification["type"],
    title: "",
    message: "",
    userId: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("gym_notifications");
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(
        parsed.map((n: Notification) => ({
          ...n,
          date: new Date(n.date),
        }))
      );
    }
  }, []);

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: newNotification.type,
      title: newNotification.title,
      message: newNotification.message,
      date: new Date(),
      read: false,
      userId: newNotification.userId || undefined,
    };

    const updated = [notification, ...notifications];
    setNotifications(updated);
    localStorage.setItem("gym_notifications", JSON.stringify(updated));

    toast({
      title: "Notificación creada",
      description: "La notificación ha sido enviada exitosamente.",
    });

    setNewNotification({
      type: "system",
      title: "",
      message: "",
      userId: "",
    });
  };

  const scheduleExpiryNotifications = () => {
    // Simulate scheduling expiry notifications
    const count = Math.floor(Math.random() * 5) + 3;
    toast({
      title: "Notificaciones programadas",
      description: `Se programaron ${count} notificaciones de vencimiento.`,
    });
  };

  const schedulePaymentReminders = () => {
    // Simulate scheduling payment reminders
    const count = Math.floor(Math.random() * 4) + 2;
    toast({
      title: "Recordatorios programados",
      description: `Se programaron ${count} recordatorios de pago.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Notificaciones Automáticas
            </h1>
            <p className="text-muted-foreground">
              Gestiona y programa notificaciones para los socios
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create Notification */}
          <Card className="border-neutral-800 bg-neutral-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="h-5 w-5" />
                Crear Notificación
              </CardTitle>
              <CardDescription>
                Envía una notificación personalizada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-neutral-200">
                    Tipo
                  </Label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value) =>
                      setNewNotification({
                        ...newNotification,
                        type: value as Notification["type"],
                      })
                    }
                  >
                    <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="expiry">Vencimiento</SelectItem>
                      <SelectItem value="payment">Pago</SelectItem>
                      <SelectItem value="message">Mensaje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient" className="text-neutral-200">
                    Destinatario (opcional)
                  </Label>
                  <Select
                    value={newNotification.userId}
                    onValueChange={(value) =>
                      setNewNotification({ ...newNotification, userId: value })
                    }
                  >
                    <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white">
                      <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      {members.slice(0, 10).map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-neutral-200">
                    Título
                  </Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        title: e.target.value,
                      })
                    }
                    className="border-neutral-800 bg-neutral-900 text-white"
                    placeholder="Título de la notificación"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-neutral-200">
                    Mensaje
                  </Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        message: e.target.value,
                      })
                    }
                    className="border-neutral-800 bg-neutral-900 text-white"
                    placeholder="Contenido del mensaje"
                    rows={4}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Enviar Notificación
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Automated Notifications */}
          <div className="space-y-6">
            <Card className="border-neutral-800 bg-neutral-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5" />
                  Notificaciones Programadas
                </CardTitle>
                <CardDescription>
                  Automatiza recordatorios importantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={scheduleExpiryNotifications}
                  variant="outline"
                  className="w-full justify-start border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Programar Alertas de Vencimiento
                </Button>
                <Button
                  onClick={schedulePaymentReminders}
                  variant="outline"
                  className="w-full justify-start border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Programar Recordatorios de Pago
                </Button>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-950">
              <CardHeader>
                <CardTitle className="text-white">
                  Integraciones Disponibles
                </CardTitle>
                <CardDescription>
                  Conecta con servicios externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                  <span>WhatsApp (Twilio)</span>
                  <span className="text-xs text-neutral-500">Próximamente</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                  <span>Email (SendGrid)</span>
                  <span className="text-xs text-neutral-500">Próximamente</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                  <span>SMS</span>
                  <span className="text-xs text-neutral-500">Próximamente</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
