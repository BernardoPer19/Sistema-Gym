"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signInEmailPassword } from "@/auth/actions/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    // Usamos la función de NextAuth, NO tu signInEmailPassword
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // evita redirección automática
    });

    console.log("Resultado de signIn:", res);

    if (res?.error) {
      // Si las credenciales son inválidas, mostramos mensaje
      setError("Credenciales incorrectas");
      setIsLoading(false);
      return;
    }

    // Si todo sale bien, redirigimos al dashboard o inicio
    router.push("/");
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    setError("Ocurrió un error inesperado");
    setIsLoading(false);
  }
};
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-neutral-800 bg-neutral-950">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">GYM PRO</CardTitle>
          <p className="text-neutral-400">Ingresa tus credenciales para acceder</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-900 bg-red-950/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-200">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@gympro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-200">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
