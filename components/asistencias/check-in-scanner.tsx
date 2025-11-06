"use client";

import type React from "react";
import { toast } from "react-hot-toast"; // Import the toast function

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle, XCircle, User, Scan, Camera } from "lucide-react";
import type { Member } from "@/lib/types/types";
import { playSuccessSound, playErrorSound } from "@/lib/audio/sounds";

interface CheckInScannerProps {
  onCheckIn: (code: string) => Promise<{
    success: boolean;
    member?: Member;
    message: string;
  }>;
  stats?: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export function CheckInScanner({ onCheckIn, stats }: CheckInScannerProps) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    member?: Member;
    message: string;
  } | null>(null);
  const [scanMode, setScanMode] = useState<"qr" | "code">("code");
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const checkInResult = await onCheckIn(code);
      setResult(checkInResult);
      setCode("");

      // Reproducir sonido según el resultado
      if (checkInResult.success) {
        playSuccessSound();
      } else {
        playErrorSound();
      }

      // Clear result after 5 seconds
      setTimeout(() => setResult(null), 5000);
    } catch (error) {
      console.error("Error checking in:", error);
      playErrorSound();
      setResult({
        success: false,
        message: "Error al procesar la asistencia. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    // Simulate QR scanning - in production, this would use a camera library
    toast({
      title: "Modo de escaneo",
      description:
        "En producción, esto activaría la cámara para escanear códigos QR",
    });
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <CardTitle className="text-white">Registro de Asistencia</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant={scanMode === "qr" ? "default" : "outline"}
              size="sm"
              onClick={() => setScanMode("qr")}
              className="gap-2"
            >
              <Scan className="h-4 w-4" />
              QR
            </Button>
            <Button
              variant={scanMode === "code" ? "default" : "outline"}
              size="sm"
              onClick={() => setScanMode("code")}
              className="gap-2"
            >
              Código
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {scanMode === "qr"
            ? "Escanea el código QR del socio"
            : "Ingresa el código del socio"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanMode === "qr" && (
          <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-neutral-800 bg-neutral-900 p-8">
            {isScanning ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-48 w-48 animate-pulse rounded-lg border-4 border-primary bg-neutral-800" />
                <p className="text-sm text-neutral-400">
                  Escaneando código QR...
                </p>
              </div>
            ) : (
              <>
                <Camera className="h-16 w-16 text-neutral-600" />
                <Button onClick={handleStartScanning} className="gap-2">
                  <Scan className="h-4 w-4" />
                  Activar Cámara
                </Button>
                <p className="text-xs text-neutral-500">
                  O pega el código QR abajo
                </p>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder={
              scanMode === "qr"
                ? "Escanea o pega el código QR..."
                : "Ingresa código (ej: JUAN-19900515-001)"
            }
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-secondary border-border text-white"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verificando..." : "Verificar"}
          </Button>
        </form>

        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.success
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    result.success ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {result.success
                    ? "✓ Asistencia Registrada"
                    : "✗ Acceso Denegado"}
                </p>
                {result.member && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-white font-medium">
                        {result.member.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.message}
                    </p>
                  </div>
                )}
                {!result.member && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats?.today ?? 0}</p>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {stats?.thisWeek ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Esta Semana</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {stats?.thisMonth ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Este Mes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
