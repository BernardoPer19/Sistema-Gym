"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "./sidebar";
import { SidebarController } from "./SidebarController";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSession().data?.user;
  const isAuthenticated = !!user;
  const isLoading = useSession().status === "loading";
  const isLoginPage = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  // Cerrar sidebar al cambiar de ruta en móviles
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Sincronizar con data attribute
  useEffect(() => {
    const handleSidebarToggle = () => {
      const isOpen = document.body.dataset.sidebarOpen === "true";
      setSidebarOpen(isOpen);
    };

    // Observar cambios en el data attribute
    const observer = new MutationObserver(handleSidebarToggle);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-sidebar-open"],
    });

    return () => observer.disconnect();
  }, []);

  // 🕓 Mientras carga el estado de autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  // 👤 Página de login o no autenticado
  if (isLoginPage || !isAuthenticated) {
    return <>{children}</>;
  }

  // ✅ Usuario autenticado, render principal con sidebar
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarController />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto w-full md:w-auto">
        {children}
      </main>
    </div>
  );
}
