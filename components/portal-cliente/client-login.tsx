"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserCircle, LogIn, QrCode, Scan } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ClientLoginProps {
  onLogin: (code: string) => void
}

export function ClientLogin({ onLogin }: ClientLoginProps) {
  const [code, setCode] = useState("")
  const [qrCode, setQrCode] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      onLogin(code)
    }
  }

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (qrCode.trim()) {
      onLogin(qrCode)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-white">Portal del Cliente</CardTitle>
          <p className="text-sm text-muted-foreground">Accede con tu código QR o código de socio</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="qr" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black">
              <TabsTrigger value="qr" className="gap-2">
                <QrCode className="h-4 w-4" />
                Escanear QR
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Scan className="h-4 w-4" />
                Código
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="space-y-4 mt-4">
              <form onSubmit={handleQRSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-code">Código QR</Label>
                  <Input
                    id="qr-code"
                    placeholder="Escanea o pega tu código QR"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    className="bg-secondary border-border text-white"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: NOMBRE-FECHANACIMIENTO-ID (ej: JUAN-PEREZ-19900515-1)
                  </p>
                </div>

                <Button type="submit" className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Acceder con QR
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="code" className="space-y-4 mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Socio</Label>
                  <Input
                    id="code"
                    placeholder="Ej: member-1"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-secondary border-border text-white"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Usa tu ID de socio como: member-1, member-2, etc.</p>
                </div>

                <Button type="submit" className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Acceder con Código
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
