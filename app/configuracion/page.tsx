"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Settings, Save, Upload, Building2 } from "lucide-react"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { useConfig } from "@/lib/auth-context"

function ConfigurationContent() {
  const { gymConfig, updateGymConfig } = useConfig()
  const { toast } = useToast()
  const [formData, setFormData] = useState(gymConfig)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    setFormData(gymConfig)
    if (gymConfig.logo) {
      setLogoPreview(gymConfig.logo)
    }
  }, [gymConfig])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        setFormData({ ...formData, logo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateGymConfig(formData)
    toast({
      title: "Configuración guardada",
      description: "Los cambios se han guardado exitosamente.",
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Configuración</h1>
            <p className="text-muted-foreground">Administra la configuración del gimnasio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <Card className="border-neutral-800 bg-neutral-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Building2 className="h-5 w-5" />
                Información General
              </CardTitle>
              <CardDescription>Datos básicos del gimnasio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-neutral-200">
                    Nombre del Gimnasio
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-neutral-800 bg-neutral-900 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-200">
                    Correo de Contacto
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-neutral-800 bg-neutral-900 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-neutral-200">
                    Moneda
                  </Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="border-neutral-800 bg-neutral-900 text-white"
                    placeholder="MXN, USD, EUR..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-200">Logo del Gimnasio</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <Label
                      htmlFor="logo"
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                    >
                      <Upload className="h-4 w-4" />
                      Subir Logo
                    </Label>
                    <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card className="border-neutral-800 bg-neutral-950">
            <CardHeader>
              <CardTitle className="text-white">Horarios de Operación</CardTitle>
              <CardDescription>Define los horarios de apertura y cierre</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="openingTime" className="text-neutral-200">
                    Hora de Apertura
                  </Label>
                  <Input
                    id="openingTime"
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    className="border-neutral-800 bg-neutral-900 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closingTime" className="text-neutral-200">
                    Hora de Cierre
                  </Label>
                  <Input
                    id="closingTime"
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    className="border-neutral-800 bg-neutral-900 text-white"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ConfigurationPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <ConfigurationContent />
    </ProtectedRoute>
  )
}
