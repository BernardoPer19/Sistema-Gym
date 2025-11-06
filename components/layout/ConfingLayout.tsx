"use client";

import { ConfingProvider } from "@/lib/auth-context";


export function ConfigProviderClient({ children }: { children: React.ReactNode }) {
  return <ConfingProvider>{children}</ConfingProvider>;
}
