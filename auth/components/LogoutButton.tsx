"use client";

import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const LogoutButton = () => {
  return (
    <DropdownMenuItem
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-3  cursor-pointer text-destructive flex justify-start items-center"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Cerrar Sesión
    </DropdownMenuItem>
  );
};

export default LogoutButton;
