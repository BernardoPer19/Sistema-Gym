// components/layout/SidebarController.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function SidebarController() {
  const pathname = usePathname();

  // Cerrar al cambiar de ruta
  useEffect(() => {
    document.body.dataset.sidebarOpen = "false";
  }, [pathname]);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") document.body.dataset.sidebarOpen = "false";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Botón hamburguesa (visible en móvil) */}
      <button
        aria-label="Abrir menú"
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
        onClick={() => (document.body.dataset.sidebarOpen = "true")}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Botón cerrar dentro del drawer (opcional, lo puedes colocar en el header del sidebar si lo hicieras client) */}
      <button
        aria-label="Cerrar menú"
        className="hidden" // placeholder si luego lo mueves al header
        onClick={() => (document.body.dataset.sidebarOpen = "false")}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Overlay */}
      <div
        onClick={() => (document.body.dataset.sidebarOpen = "false")}
        className="sidebar-overlay fixed inset-0 z-40 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity md:hidden"
      />
    </>
  );
}
