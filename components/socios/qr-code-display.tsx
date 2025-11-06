"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy } from "lucide-react";
import type { Member } from "@/lib/types/types";
import { useToast } from "@/hooks/use-toast";
import QRCodeLib from "qrcode";
import { useEffect, useState } from "react";

interface QRCodeDisplayProps {
  member: Member;
}

export function QRCodeDisplay({ member }: QRCodeDisplayProps) {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    // Generate QR code
    QRCodeLib.toDataURL(member.qrCode, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("Error generating QR code:", err);
      });
  }, [member.qrCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(member.qrCode);
    toast({
      title: "Código copiado",
      description: "El código QR ha sido copiado al portapapeles",
    });
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QR_${member.name.replace(/\s+/g, "_")}_${member.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR descargado",
      description: `Código QR de ${member.name} descargado exitosamente`,
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <QrCode className="h-5 w-5" />
          Código QR de Acceso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-lg border-4 border-neutral-800 bg-white p-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl || "/placeholder.svg"}
                  alt="QR Code"
                  className="h-64 w-64"
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              )}
            </div>
            <Button
              onClick={handleDownloadQR}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Descargar QR
            </Button>
          </div>

          {/* Code Information */}
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-white">
                Código de Acceso
              </h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 font-mono text-sm text-white">
                  {member.qrCode}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="border-neutral-800 bg-transparent"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <h4 className="text-sm font-semibold text-white">
                Formato del Código
              </h4>
              <div className="space-y-1 text-sm text-neutral-400">
                <p>
                  <span className="text-neutral-300">Nombre:</span>{" "}
                  {member.name.toUpperCase()}
                </p>
                <p>
                  <span className="text-neutral-300">Fecha de Nacimiento:</span>{" "}
                  {member.birthDate.toISOString().split("T")[0]}
                </p>
                <p>
                  <span className="text-neutral-300">ID:</span> {member.id}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-sm text-blue-400">
                Este código QR es único para {member.name}. Puede ser escaneado
                en la recepción para registrar asistencias automáticamente.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
