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
import { InstallPrompt } from "@/components/pwa/install-prompt";

export const metadata: Metadata = {
  title: "GYM PRO - Sistema de Gestión",
  description: "Sistema completo de gestión para gimnasios",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#ef4444",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GYM PRO",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
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

        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
