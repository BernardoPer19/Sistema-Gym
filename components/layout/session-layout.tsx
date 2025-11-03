// app/(dashboard)/session-layout.tsx
"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function SessionLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
