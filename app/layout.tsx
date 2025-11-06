// app/(dashboard)/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import { LayoutContent } from "@/components/layout/layout-content";
import SessionLayout from "@/components/layout/session-layout";
import { ConfigProviderClient } from "@/components/layout/ConfingLayout";

export const metadata: Metadata = {
  title: "GYM PRO - Sistema de Gestión",
  description: "Sistema completo de gestión para gimnasios",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} h-screen overflow-hidden`}
      >
        <ConfigProviderClient>
          <SessionLayout>
            <Suspense fallback={<div>Loading...</div>}>
              <LayoutContent>{children}</LayoutContent>
            </Suspense>
          </SessionLayout>
        </ConfigProviderClient>

        <Analytics />
      </body>
    </html>
  );
}
