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
import { getMonthlyRevenue } from "@/lib/mock-data";

export function RevenueChart() {
  const monthlyRevenue = getMonthlyRevenue();

  const revenueData = [
    { month: "Ene", revenue: 45000 },
    { month: "Feb", revenue: 52000 },
    { month: "Mar", revenue: 48000 },
    { month: "Abr", revenue: 61000 },
    { month: "May", revenue: 55000 },
    { month: "Jun", revenue: monthlyRevenue },
  ];

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
