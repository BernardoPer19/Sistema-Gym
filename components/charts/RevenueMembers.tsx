"use client";

import React from "react";
import { CardContent } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { members, memberships } from "@/lib/mock-data";

export function RevenueMembers() {
  const membershipDistribution = memberships.map((m) => ({
    name: m.name,
    value: members.filter((mem) => mem.membershipId === m.id).length,
  }));

  const COLORS = ["#ef4444", "#f97316", "#fb923c", "#fdba74"];

  return (
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={membershipDistribution}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {membershipDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  );
}
