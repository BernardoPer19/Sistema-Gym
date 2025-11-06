"use client";

import React from "react";
import { CardContent } from "../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data?: Array<{ month: string; revenue: number; members?: number }>;
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  const revenueData = data.length > 0
    ? data.map((item) => ({ month: item.month, revenue: item.revenue }))
    : [
        { month: "Ene", revenue: 0 },
        { month: "Feb", revenue: 0 },
        { month: "Mar", revenue: 0 },
        { month: "Abr", revenue: 0 },
        { month: "May", revenue: 0 },
        { month: "Jun", revenue: 0 },
      ];

  if (data.length === 0) {
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
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="month" stroke="#a3a3a3" />
          <YAxis stroke="#a3a3a3" />
          <Tooltip
            contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040" }}
            labelStyle={{ color: "#ffffff" }}
          />
          <Bar dataKey="revenue" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  );
}
