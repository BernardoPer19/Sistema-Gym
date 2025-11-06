// components/layout/SidebarController.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";

export function SidebarController() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
    document.body.dataset.sidebarOpen = "false";
  }, [pathname]);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        document.body.dataset.sidebarOpen = "false";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    document.body.dataset.sidebarOpen = String(newState);
  };

  return (
    <>
      {/* Botón hamburguesa (visible en móvil) */}
      <Button
        variant="outline"
        size="icon"
        aria-label="Abrir menú"
        className={cn(
          "fixed top-4 left-4 z-50 md:hidden h-10 w-10 border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
        )}
        onClick={handleToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}
