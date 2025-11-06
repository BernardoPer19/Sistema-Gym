"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react"; // Ícono de basurero
import type { Membership } from "@/lib/types/types";

interface MembershipCardProps {
  membership: Membership;
  memberCount: number;
  onDelete?: (id: string) => void; // Nueva prop para eliminar
}

export function MembershipCard({ membership, memberCount, onDelete }: MembershipCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors relative">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          {membership.name}
          {onDelete && (
            <button
              onClick={() => onDelete(membership.id)}
              className="ml-2 p-1 rounded hover:bg-red-600/20"
              title="Eliminar membresía"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{membership.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-4xl font-bold text-white">${membership.price}</p>
          <p className="text-sm text-muted-foreground">por mes</p>
        </div>

        <div className="space-y-2">
          {membership.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-white">{memberCount}</span> socios activos
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" variant="secondary">
          Asignar Membresía
        </Button>
      </CardFooter>
    </Card>
  );
}
