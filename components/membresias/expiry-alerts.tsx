"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail } from "lucide-react";
import type { Member } from "@/lib/types/types";
import { getMembershipById } from "@/lib/mock-data";

interface ExpiryAlertsProps {
  expiringMembers: Member[];
  onSendReminder: (memberId: string) => void;
}

export function ExpiryAlerts({
  expiringMembers,
  onSendReminder,
}: ExpiryAlertsProps) {
  const getDaysUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-white">Membresías por Vencer</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Próximos 7 días</p>
      </CardHeader>
      <CardContent>
        {expiringMembers.length > 0 ? (
          <div className="space-y-3">
            {expiringMembers.map((member) => {
              const membership = getMembershipById(member.membershipId);
              const daysLeft = getDaysUntilExpiry(member.expiryDate);

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {membership?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        daysLeft <= 3
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      }
                    >
                      {daysLeft} {daysLeft === 1 ? "día" : "días"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 border-border bg-transparent"
                      onClick={() => onSendReminder(member.id)}
                    >
                      <Mail className="h-4 w-4" />
                      Recordar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No hay membresías próximas a vencer
          </p>
        )}
      </CardContent>
    </Card>
  );
}
