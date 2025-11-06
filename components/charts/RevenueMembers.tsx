"use client";

import React from "react";
import { CardContent } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface RevenueMembersProps {
  data?: Array<{ name: string; value: number; revenue?: number }>;
}

export function RevenueMembers({ data = [] }: RevenueMembersProps) {
  const membershipDistribution =
    data.length > 0
      ? data.map((item) => ({ name: item.name, value: item.value }))
      : [];

  const COLORS = ["#ef4444", "#f97316", "#fb923c", "#fdba74"];

  if (membershipDistribution.length === 0) {
    return (
      <CardContent>
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={membershipDistribution}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {membershipDistribution.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          {/* Tooltip con fondo claro */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff", // Blanco
              color: "#000000", // Texto negro
              border: "1px solid #d4d4d4", // Borde gris suave
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  );
}
