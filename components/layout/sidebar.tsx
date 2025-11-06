"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  UserCircle,
  Dumbbell,
  Receipt,
  Settings,
  LogOut,
  Bell,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useConfig } from "@/lib/auth-context";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "reception"],
  },
  {
    name: "Socios",
    href: "/socios",
    icon: Users,
    roles: ["admin", "reception"],
  },
  {
    name: "Membresías",
    href: "/membresias",
    icon: CreditCard,
    roles: ["admin", "reception"],
  },
  {
    name: "Asistencias",
    href: "/asistencias",
    icon: ClipboardCheck,
    roles: ["admin", "reception"],
  },
  { name: "Gastos", href: "/gastos", icon: Receipt, roles: ["admin"] },
  {
    name: "Mensajes",
    href: "/mensajes",
    icon: MessageSquare,
    roles: ["admin"],
  },
  { name: "Reportes", href: "/reportes", icon: BarChart3, roles: ["admin"] },
  {
    name: "Notificaciones",
    href: "/notificaciones",
    icon: Bell,
    roles: ["admin"],
  },
  {
    name: "Configuración",
    href: "/configuracion",
    icon: Settings,
    roles: ["admin"],
  },
  {
    name: "Portal Cliente",
    href: "/portal-cliente",
    icon: UserCircle,
    roles: ["admin", "client"],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSession().data?.user;
  const { gymConfig } = useConfig();

  const filteredNavigation = navigation.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const handleLogout = () => {
    router.push("/login");
  };

  const handleLinkClick = () => {
    // Cerrar sidebar en móviles al hacer clic en un enlace
    if (onClose) {
      onClose();
    }
    document.body.dataset.sidebarOpen = "false";
  };

  if (!user) return null;

  return (
    <>
      {/* Overlay para móviles */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => {
          onClose?.();
          document.body.dataset.sidebarOpen = "false";
        }}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-black border-r border-border transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">
              {gymConfig.name}
            </h1>
            <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
          </div>
          {/* Botón cerrar en móviles */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => {
              onClose?.();
              document.body.dataset.sidebarOpen = "false";
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-secondary hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary flex-shrink-0">
              <span className="text-sm font-semibold text-white">
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.role === "admin"
                  ? "Administrador"
                  : user.role === "reception"
                  ? "Recepción"
                  : "Cliente"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </>
  );
}
